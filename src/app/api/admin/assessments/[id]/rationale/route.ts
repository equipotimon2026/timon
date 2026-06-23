import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

// Devuelve results.meta.rationale del assessment (puede no existir → null).
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
  if (!id) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const { data: assessment, error } = await adminSupabase
    .from('assessments')
    .select('results')
    .eq('id', id)
    .maybeSingle();

  if (error || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  const results = assessment.results as { meta?: { rationale?: unknown } } | null;
  const rationale = results?.meta?.rationale ?? null;

  return NextResponse.json({ rationale });
}
