import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';
import { buildAzurePayload } from '@/lib/admin/build-azure-payload';

const AZURE_BASE_URL =
  'https://timon-agents-ckfqd5evcdcqgsg9.eastus2-01.azurewebsites.net';
const AZURE_ASSESSMENTS_URL = `${AZURE_BASE_URL}/api/assessments`;

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }

  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return NextResponse.json({ error: 'AZURE_FUNCTIONS_KEY not configured' }, { status: 500 });
  }

  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  // Check for pending assessment
  const { data: pending } = await adminSupabase
    .from('assessments')
    .select('assessment_id, status')
    .eq('user_id', userId)
    .eq('status', 'processing')
    .maybeSingle();

  if (pending) {
    return NextResponse.json(
      { error: 'Ya hay un assessment en proceso para este usuario.', assessment_id: pending.assessment_id },
      { status: 409 }
    );
  }

  let payload;
  try {
    payload = await buildAzurePayload(adminSupabase, userId);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  try {
    const submitResponse = await fetch(AZURE_ASSESSMENTS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': azureKey,
      },
      body: JSON.stringify(payload),
    });

    const submitBody = await submitResponse.text();

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

    // Insert row with generated_by='admin' and is_active=false
    const { error: insertError } = await adminSupabase
      .from('assessments')
      .insert({
        user_id: userId,
        assessment_id: submitResult.assessment_id,
        status: 'processing',
        generated_by: 'admin',
        is_active: false,
      });

    if (insertError) {
      console.error('[admin/generate] Failed to insert assessment row:', insertError.message);
    }

    return NextResponse.json({
      assessment_id: submitResult.assessment_id,
      status: 'pending',
    });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to reach Azure endpoint', details: String(err) },
      { status: 502 }
    );
  }
}
