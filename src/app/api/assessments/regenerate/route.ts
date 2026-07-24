import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { buildAzurePayload } from '@/lib/admin/build-azure-payload';
import { getAzureAssessmentsUrl } from '@/lib/assessments/azure';

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

  // POST to Azure
  try {
    console.log('[regenerate] → POST %s', getAzureAssessmentsUrl());
    const submitResponse = await fetch(getAzureAssessmentsUrl(), {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': azureKey,
      },
      body: JSON.stringify(payload),
    });

    const submitBody = await submitResponse.text();
    console.log('[regenerate] ← Submit status: %d, body: %s', submitResponse.status, submitBody.slice(0, 500));

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

    console.log('[regenerate] ← Assessment submitted: %s', submitResult.assessment_id);

    // INSERT new assessment row — is_active=false, activated when polling detects completed
    const { error: insertError } = await adminSupabase
      .from('assessments')
      .insert({
        user_id: profile.id,
        assessment_id: submitResult.assessment_id,
        status: 'processing',
        generated_by: 'user',
        is_active: false,
        section_versions: sectionVersions,
      });

    if (insertError) {
      console.error('[regenerate] ← Failed to insert assessment row:', insertError.message);
    }

    return NextResponse.json({
      assessment_id: submitResult.assessment_id,
      status: 'processing',
    });
  } catch (err) {
    console.error('[regenerate] ← FAILED: %s', String(err));
    return NextResponse.json(
      { error: 'Failed to reach Azure endpoint', details: String(err) },
      { status: 502 }
    );
  }
}
