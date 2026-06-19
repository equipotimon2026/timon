import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

// Mejora #2: "Liberar resultado". Marca released_at para que el usuario pueda ver
// el resultado. Solo aplica a assessments 'completed'.
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
  const assessmentDbId = id;

  if (!assessmentDbId) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const { data: assessment, error: fetchError } = await adminSupabase
    .from('assessments')
    .select('id, status, released_at')
    .eq('id', assessmentDbId)
    .single();

  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  if (assessment.status !== 'completed') {
    return NextResponse.json(
      { error: 'Solo se pueden liberar resultados completados.' },
      { status: 400 }
    );
  }

  const releasedAt = new Date().toISOString();
  const { error: updateError } = await adminSupabase
    .from('assessments')
    .update({ released_at: releasedAt })
    .eq('id', assessmentDbId);

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to release: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true, released_at: releasedAt });
}
