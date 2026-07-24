import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildAzurePayload } from '@/lib/admin/build-azure-payload';
import {
  applyPollResult,
  getAzureAssessmentsUrl,
  isPastTimeout,
  markTimedOut,
  pollAzure,
} from '@/lib/assessments/azure';

export const maxDuration = 60;

// Maximo que tarda el agente. Pasado este tiempo desde created_at, si sigue en
// 'processing' Y Azure lo confirma, lo marcamos 'failed' (timeout). Se controla
// en el servidor comparando contra created_at para que sobreviva a reloads.
const GENERATION_TIMEOUT_MS = 30 * 60 * 1000; // 30 min

export async function POST(req: NextRequest) {
  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return NextResponse.json(
      { error: 'AZURE_FUNCTIONS_KEY not configured' },
      { status: 500 }
    );
  }

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {
          // No need to set cookies in this route
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Fetch user profile (no longer selecting assessment_id or assessment_results)
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id, first_name, last_name, age, school, school_year, email, phone_number')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'Profile not found' }, { status: 404 });
  }

  const adminSupabase = createAdminClient();

  // Check assessments table for existing assessment for this user
  const { data: existingAssessments, error: assessmentsError } = await adminSupabase
    .from('assessments')
    .select('assessment_id, status')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false });

  if (assessmentsError) {
    console.error('[analyze] ← Failed to check assessments:', assessmentsError.message);
    return NextResponse.json(
      { error: 'Failed to check existing assessments' },
      { status: 500 }
    );
  }

  if (existingAssessments && existingAssessments.length > 0) {
    const latest = existingAssessments[0];

    if (latest.status === 'completed') {
      return NextResponse.json(
        { error: 'Ya se generó un perfil para este usuario' },
        { status: 409 }
      );
    }

    if (latest.status === 'processing') {
      return NextResponse.json({
        assessment_id: latest.assessment_id,
        email: profile.email ?? '',
        status: 'processing',
      });
    }

    // status === 'failed' or anything else → proceed to create new
  }

  // Build payload using shared helper
  let payload;
  let sectionVersions: Record<string, number> = {};
  try {
    ({ payload, sectionVersions } = await buildAzurePayload(adminSupabase, profile.id));
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to build payload', details: String(err) },
      { status: 500 }
    );
  }

  const responsesPayload = payload.responses;

  // Submit to Azure async pipeline
  try {
    console.log('[analyze] → POST %s', getAzureAssessmentsUrl());
    console.log('[analyze] → Payload sections: %s', Object.keys(responsesPayload).join(', '));
    console.log('[analyze] → User: %s %s (id=%d)', profile.first_name, profile.last_name, profile.id);

    const submitResponse = await fetch(getAzureAssessmentsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': azureKey,
      },
      body: JSON.stringify(payload),
    });

    const submitBody = await submitResponse.text();
    console.log('[analyze] ← Submit status: %d, body: %s', submitResponse.status, submitBody.slice(0, 500));

    if (!submitResponse.ok) {
      return NextResponse.json(
        { error: `Azure submit error: ${submitResponse.status}`, details: submitBody },
        { status: 502 }
      );
    }

    const submitResult = JSON.parse(submitBody);

    if (!submitResult.assessment_id) {
      return NextResponse.json(
        { error: 'No assessment_id returned from Azure', details: submitBody },
        { status: 502 }
      );
    }

    console.log('[analyze] ← Assessment submitted: %s', submitResult.assessment_id);

    // Insert row into assessments table
    const { error: insertError } = await adminSupabase
      .from('assessments')
      .insert({
        user_id: profile.id,
        assessment_id: submitResult.assessment_id,
        status: 'processing',
        section_versions: sectionVersions,
      });

    if (insertError) {
      console.error('[analyze] ← Failed to insert assessment row:', insertError.message);
    } else {
      console.log('[analyze] ← Assessment row inserted into assessments table');
    }

    // Return assessment_id + email so the frontend can poll
    return NextResponse.json({
      assessment_id: submitResult.assessment_id,
      email: profile.email ?? '',
      status: 'processing',
    });
  } catch (err) {
    console.error('[analyze] ← FAILED: %s', String(err));
    return NextResponse.json(
      { error: 'Failed to reach Azure endpoint', details: String(err) },
      { status: 502 }
    );
  }
}

// GET — proxy poll request to Azure
export async function GET(req: NextRequest) {
  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return NextResponse.json({ error: 'AZURE_FUNCTIONS_KEY not configured' }, { status: 500 });
  }

  // Auth check
  const supabaseGet = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );
  const { data: { user: authUser } } = await supabaseGet.auth.getUser();
  if (!authUser) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const assessmentId = searchParams.get('assessment_id');
  const email = searchParams.get('email');

  if (!assessmentId || !email) {
    return NextResponse.json({ error: 'assessment_id and email required' }, { status: 400 });
  }

  // Verify ownership: the assessment must belong to the authenticated user
  const adminCheck = createAdminClient();
  const { data: ownerCheck } = await adminCheck
    .from('assessments')
    .select('id, user_id, status, created_at, released_at')
    .eq('assessment_id', assessmentId)
    .maybeSingle();

  if (!ownerCheck) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  const { data: userProfile } = await adminCheck
    .from('users')
    .select('id')
    .eq('auth_id', authUser.id)
    .maybeSingle();

  if (!userProfile || ownerCheck.user_id !== userProfile.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  // --- Short-circuits que evitan exponer errores al usuario y respetan el gate ---
  // El cliente solo necesita saber: seguir poolleando, mostrar resultados, o
  // mostrar la pantalla "12hs". Nunca devolvemos un error visible.
  const released = !!ownerCheck.released_at;

  // Estado terminal completado: NO devolvemos results salvo que este liberado.
  if (ownerCheck.status === 'completed') {
    return NextResponse.json({ status: 'completed', released });
  }

  // Estado terminal de fallo/cancelado: el front muestra la pantalla "12hs",
  // nunca un error. Respondemos 200 a proposito.
  if (ownerCheck.status === 'failed' || ownerCheck.status === 'cancelled') {
    return NextResponse.json({ status: ownerCheck.status, released });
  }

  // Sigue 'processing': consultar a Azure ANTES de decidir. Nunca marcamos
  // failed sin confirmacion de Azure — un completado tardio vale mas que un
  // timeout prolijo (caso: usuario vuelve pasados los 30 min y el resultado
  // estaba listo).
  const pollResult = await pollAzure(assessmentId, email);
  const adminSupabase = createAdminClient();

  if (pollResult.kind === 'completed') {
    await applyPollResult(adminSupabase, assessmentId, pollResult);
    // Recien completado → todavia no liberado (gate manual del admin).
    // No devolvemos results al usuario hasta que released_at este seteado.
    return NextResponse.json({ status: 'completed', released: false });
  }

  if (pollResult.kind === 'failed') {
    await applyPollResult(adminSupabase, assessmentId, pollResult);
    // 200 a proposito: el front muestra la pantalla "12hs", nunca un error.
    return NextResponse.json({ status: 'failed' });
  }

  if (pollResult.kind === 'processing') {
    // Azure confirma que sigue corriendo: recien aca aplica el timeout.
    if (isPastTimeout(ownerCheck.created_at, Date.now(), GENERATION_TIMEOUT_MS)) {
      await markTimedOut(
        adminSupabase,
        ownerCheck.id,
        'Timeout: la generacion supero los 30 minutos.'
      );
      console.log('[analyze] ← Assessment %s marcado failed por timeout', assessmentId);
      return NextResponse.json({ status: 'failed', timedOut: true });
    }
    return NextResponse.json({ status: pollResult.status });
  }

  // 'unreachable': no exponer el error de red/Azure al usuario. El cliente
  // reintenta, y si persiste, el cron de reconciliacion cierra el caso.
  console.error('[analyze] ← Poll FAILED: %s', pollResult.detail);
  return NextResponse.json({ status: 'processing' });
}
