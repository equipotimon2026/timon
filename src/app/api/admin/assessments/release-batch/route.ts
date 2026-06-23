import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

// Mejora #2 (bulk): liberar varios resultados completados de una.
export async function POST(req: NextRequest) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }

  let ids: unknown;
  try {
    ({ ids } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid body' }, { status: 400 });
  }

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ error: 'ids requerido (array no vacio)' }, { status: 400 });
  }

  const cleanIds = ids.filter((x): x is string => typeof x === 'string' && x.length > 0);
  if (cleanIds.length === 0) {
    return NextResponse.json({ error: 'No hay ids validos' }, { status: 400 });
  }

  const releasedAt = new Date().toISOString();
  // Solo libera los que esten 'completed' y aun sin liberar.
  const { data, error } = await adminSupabase
    .from('assessments')
    .update({ released_at: releasedAt })
    .in('id', cleanIds)
    .eq('status', 'completed')
    .is('released_at', null)
    .select('id');

  if (error) {
    return NextResponse.json({ error: `Failed to release: ${error.message}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true, released: data?.length ?? 0, released_at: releasedAt });
}
