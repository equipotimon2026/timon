import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

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

  const { id } = await params;
  const assessmentDbId = Number(id);

  if (isNaN(assessmentDbId)) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  // Fetch target assessment
  const { data: assessment, error: fetchError } = await adminSupabase
    .from('assessments')
    .select('id, user_id, status')
    .eq('id', assessmentDbId)
    .single();

  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  if (assessment.status !== 'completed') {
    return NextResponse.json(
      { error: 'Only completed assessments can be activated' },
      { status: 400 }
    );
  }

  // Demote all active assessments for this user
  const { error: demoteError } = await adminSupabase
    .from('assessments')
    .update({ is_active: false })
    .eq('user_id', assessment.user_id)
    .eq('is_active', true);

  if (demoteError) {
    return NextResponse.json(
      { error: `Failed to demote existing active assessment: ${demoteError.message}` },
      { status: 500 }
    );
  }

  // Promote target
  const { error: promoteError } = await adminSupabase
    .from('assessments')
    .update({ is_active: true })
    .eq('id', assessmentDbId);

  if (promoteError) {
    return NextResponse.json(
      { error: `Failed to activate assessment: ${promoteError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
