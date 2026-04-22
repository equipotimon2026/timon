import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { SECTION_IDS } from '@/lib/constants';

export const maxDuration = 60;

const AZURE_BASE_URL =
  'https://timon-agents-ckfqd5evcdcqgsg9.eastus2-01.azurewebsites.net';
const AZURE_ASSESSMENTS_URL = `${AZURE_BASE_URL}/api/assessments`;

const SECTION_NAMES: Record<number, { key: string; name: string }> = {
  [SECTION_IDS.MILLON]: { key: 'MILLON', name: 'MIPS/Millon' },
  [SECTION_IDS.RIASEC]: { key: 'RIASEC', name: 'Holland RIASEC' },
  [SECTION_IDS.HERRMANN]: { key: 'HERRMANN', name: 'Herrmann' },
  [SECTION_IDS.GARDNER]: { key: 'GARDNER', name: 'Inteligencias Múltiples' },
  [SECTION_IDS.PROYECTIVA]: { key: 'PROYECTIVA', name: 'Técnicas Proyectivas' },
  [SECTION_IDS.AUTODESC]: { key: 'AUTODESC', name: 'Autodescubrimiento' },
  [SECTION_IDS.LIFESTYLE]: { key: 'LIFESTYLE', name: 'Estilo de Vida' },
  [SECTION_IDS.FUTURO]: { key: 'FUTURO', name: 'Visión Futuro' },
  [SECTION_IDS.FAMILIA]: { key: 'FAMILIA', name: 'Árbol Genealógico' },
  [SECTION_IDS.UNIVERSIDAD]: { key: 'UNIVERSIDAD', name: 'Universidad' },
};

function getResponseType(row: {
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}): { answer: unknown; response_type: string } {
  if (row.response_boolean !== null) {
    return { answer: row.response_boolean, response_type: 'boolean' };
  }
  if (row.response_integer !== null) {
    return { answer: row.response_integer, response_type: 'integer' };
  }
  if (row.response_array !== null) {
    return { answer: row.response_array, response_type: 'array' };
  }
  return { answer: row.response_text ?? '', response_type: 'text' };
}

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

  // Fetch all responses grouped by section
  const { data: responses, error: responsesError } = await supabase
    .from('responses')
    .select(
      'section_id, question_number, question, response_boolean, response_integer, response_text, response_array'
    )
    .eq('user_id', profile.id)
    .order('question_number', { ascending: true });

  if (responsesError) {
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    );
  }

  // Fetch questions to get options and metadata
  const { data: questions } = await adminSupabase
    .from('questions')
    .select('section_id, question_number, options, metadata');

  // Build a lookup map: `${section_id}_${question_number}` -> question data
  const questionsMap = new Map<string, { options?: unknown; metadata?: unknown }>();
  for (const q of (questions ?? [])) {
    questionsMap.set(`${q.section_id}_${q.question_number}`, q);
  }

  // Group responses by section_id
  const grouped: Record<number, typeof responses> = {};
  for (const row of responses) {
    if (!grouped[row.section_id]) grouped[row.section_id] = [];
    grouped[row.section_id].push(row);
  }

  // Build the payload matching test_user_input.json format
  const responsesPayload: Record<string, { name: string; responses: unknown[] }> = {};

  for (const [sectionId, meta] of Object.entries(SECTION_NAMES)) {
    const sectionRows = grouped[Number(sectionId)] ?? [];
    responsesPayload[meta.key] = {
      name: meta.name,
      responses: sectionRows.map((row) => {
        const { answer, response_type } = getResponseType(row);
        const questionData = questionsMap.get(`${Number(sectionId)}_${row.question_number}`);
        return {
          question_number: row.question_number,
          question_text: row.question ?? '',
          answer,
          response_type,
          ...(questionData?.options ? { options: questionData.options } : {}),
          ...(questionData?.metadata ? { metadata: questionData.metadata } : {}),
        };
      }),
    };
  }

  const payload = {
    personal_data: {
      first_name: profile.first_name ?? '',
      last_name: profile.last_name ?? '',
      age: profile.age ?? 0,
      school: profile.school ?? '',
      school_year: profile.school_year ?? '',
      email: profile.email ?? '',
      phone_number: profile.phone_number ?? '',
    },
    responses: responsesPayload,
  };

  // Submit to Azure async pipeline
  try {
    console.log('[analyze] → POST %s', AZURE_ASSESSMENTS_URL);
    console.log('[analyze] → Payload sections: %s', Object.keys(responsesPayload).join(', '));
    console.log('[analyze] → User: %s %s (id=%d)', profile.first_name, profile.last_name, profile.id);

    const submitResponse = await fetch(AZURE_ASSESSMENTS_URL, {
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
    .select('user_id')
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

  try {
    const pollUrl = `${AZURE_ASSESSMENTS_URL}/${assessmentId}?email=${encodeURIComponent(email)}`;
    console.log('[analyze] → GET %s', pollUrl);

    const pollResponse = await fetch(pollUrl, {
      headers: { 'x-functions-key': azureKey },
    });

    const pollBody = await pollResponse.text();
    console.log('[analyze] ← Poll status: %d, body: %s', pollResponse.status, pollBody.slice(0, 500));

    if (!pollResponse.ok) {
      return NextResponse.json(
        { error: `Azure poll error: ${pollResponse.status}`, details: pollBody },
        { status: 502 }
      );
    }

    const pollResult = JSON.parse(pollBody);
    const adminSupabase = createAdminClient();

    if (pollResult.status === 'completed') {
      // Save results to assessments table
      const { error: saveError } = await adminSupabase
        .from('assessments')
        .update({
          status: 'completed',
          results: pollResult.results,
          completed_at: new Date().toISOString(),
        })
        .eq('assessment_id', assessmentId);

      if (saveError) {
        console.error('[analyze] ← Failed to save results to assessments table:', saveError.message);
      } else {
        console.log('[analyze] ← Results saved to assessments table for assessment %s', assessmentId);
      }

      return NextResponse.json({ status: 'completed', results: pollResult.results });
    }

    if (pollResult.status === 'failed') {
      // Update assessments table with failure
      const { error: updateError } = await adminSupabase
        .from('assessments')
        .update({
          status: 'failed',
          error: pollResult.error ?? 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('assessment_id', assessmentId);

      if (updateError) {
        console.error('[analyze] ← Failed to update assessment as failed:', updateError.message);
      } else {
        console.log('[analyze] ← Assessment marked as failed for %s', assessmentId);
      }

      return NextResponse.json(
        { status: 'failed', error: pollResult.error },
        { status: 502 }
      );
    }

    return NextResponse.json({ status: pollResult.status });
  } catch (err) {
    console.error('[analyze] ← Poll FAILED: %s', String(err));
    return NextResponse.json(
      { error: 'Failed to poll Azure', details: String(err) },
      { status: 502 }
    );
  }
}
