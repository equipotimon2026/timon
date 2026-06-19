import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

// Mejora #3: cancelar un assessment atascado en 'processing'. Pasa a 'cancelled'
// para que quede claro que no esta activo y se pueda generar uno nuevo.
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
    .select('id, status')
    .eq('id', assessmentDbId)
    .single();

  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  if (assessment.status !== 'processing') {
    return NextResponse.json(
      { error: 'Solo se pueden cancelar assessments en proceso.' },
      { status: 400 }
    );
  }

  const { error: updateError } = await adminSupabase
    .from('assessments')
    .update({
      status: 'cancelled',
      error: 'Cancelado por el administrador.',
      completed_at: new Date().toISOString(),
    })
    .eq('id', assessmentDbId)
    .eq('status', 'processing');

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to cancel: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
