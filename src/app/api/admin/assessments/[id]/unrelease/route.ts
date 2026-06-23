import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

// Mejora #2: "Desliberar". Vuelve a ocultar el resultado al usuario (released_at = null).
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

  const { error: updateError } = await adminSupabase
    .from('assessments')
    .update({ released_at: null })
    .eq('id', assessmentDbId);

  if (updateError) {
    return NextResponse.json(
      { error: `Failed to unrelease: ${updateError.message}` },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
