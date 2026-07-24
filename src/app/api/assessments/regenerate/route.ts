import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildAzurePayload } from '@/lib/admin/build-azure-payload';
import { submitToAzure } from '@/lib/assessments/azure';
import { redactAzureDetail } from '@/lib/assessments/azure-logic';
import { logAssessmentEvent } from '@/lib/assessments/log';

export const maxDuration = 60;

export async function POST(req: NextRequest) {
  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return NextResponse.json({ error: 'AZURE_FUNCTIONS_KEY not configured' }, { status: 500 });
  }

  // Auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Resolve users.id (BIGINT) from auth.uid()
  const adminSupabase = createAdminClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  // Check for existing processing assessment (409 if found)
  const { data: pending } = await adminSupabase
    .from('assessments')
    .select('assessment_id, status')
    .eq('user_id', profile.id)
    .eq('status', 'processing')
    .maybeSingle();

  if (pending) {
    return NextResponse.json(
      { error: 'Ya hay un assessment en proceso para este usuario.', assessment_id: pending.assessment_id },
      { status: 409 }
    );
  }

  // Build Azure payload
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

  // POST to Azure (timeout + validacion de body centralizados en submitToAzure)
  const submitStarted = Date.now();
  const submit = await submitToAzure(payload);

  if (submit.kind !== 'submitted') {
    logAssessmentEvent({
      source: 'user',
      event: 'regenerate_rejected',
      user_id: profile.id,
      duration_ms: Date.now() - submitStarted,
      detail: redactAzureDetail(submit.detail),
    });
    return NextResponse.json(
      { error: 'Azure submit failed', details: submit.detail },
      { status: 502 }
    );
  }

  logAssessmentEvent({
    source: 'user',
    event: 'regenerate_submit',
    assessment_id: submit.assessmentId,
    user_id: profile.id,
    to: 'processing',
    duration_ms: Date.now() - submitStarted,
  });

  // INSERT new assessment row — is_active=false, activated when polling detects completed
  const { error: insertError } = await adminSupabase
    .from('assessments')
    .insert({
      user_id: profile.id,
      assessment_id: submit.assessmentId,
      status: 'processing',
      generated_by: 'user',
      is_active: false,
      section_versions: sectionVersions,
    });

  if (insertError) {
    // Sin row, nadie puede pollear ni reconciliar este trabajo: no responder 200.
    logAssessmentEvent({
      source: 'user',
      event: 'insert_failed',
      assessment_id: submit.assessmentId,
      user_id: profile.id,
      persistence: 'failed_to_persist',
      detail: insertError.message,
    });
    return NextResponse.json(
      { error: 'Failed to persist assessment' },
      { status: 500 }
    );
  }

  return NextResponse.json({
    assessment_id: submit.assessmentId,
    status: 'processing',
  });
}
