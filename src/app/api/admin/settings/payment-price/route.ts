import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(req: NextRequest) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }
  const { data } = await adminSupabase
    .from('app_settings')
    .select('value')
    .eq('key', 'payment_price_ars')
    .single();
  return NextResponse.json({ amount: (data?.value as { amount?: number })?.amount ?? null });
}

export async function PUT(req: NextRequest) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }
  const body = await req.json().catch(() => ({}));
  const amount = Number(body.amount);
  if (!Number.isFinite(amount) || amount <= 0) {
    return NextResponse.json({ error: 'amount inválido' }, { status: 400 });
  }
  const { error } = await adminSupabase
    .from('app_settings')
    .upsert({ key: 'payment_price_ars', value: { amount }, updated_at: new Date().toISOString() });
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
