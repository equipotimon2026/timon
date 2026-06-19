import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(
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
  const assessmentDbId = id;

  if (!assessmentDbId) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const { data: assessment, error } = await adminSupabase
    .from('assessments')
    .select('assessment_id, results')
    .eq('id', assessmentDbId)
    .single();

  if (error || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  if (!assessment.results) {
    return NextResponse.json({ error: 'No results available for this assessment' }, { status: 404 });
  }

  const json = JSON.stringify(assessment.results, null, 2);

  return new NextResponse(json, {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="results-${assessment.assessment_id}.json"`,
    },
  });
}
