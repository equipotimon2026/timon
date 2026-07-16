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
    .select('key, value')
    .in('key', ['payment_price_ars', 'referral_group_size', 'referral_discount_pct']);
  const map = new Map((data ?? []).map((r) => [r.key, r.value as Record<string, number>]));
  return NextResponse.json({
    priceArs: map.get('payment_price_ars')?.amount ?? null,
    groupSize: map.get('referral_group_size')?.value ?? null,
    discountPct: map.get('referral_discount_pct')?.value ?? null,
  });
}

export async function PUT(req: NextRequest) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }
  const body = await req.json().catch(() => ({}));
  const priceArs = Number(body.priceArs);
  const groupSize = Number(body.groupSize);
  const discountPct = Number(body.discountPct);

  if (!Number.isFinite(priceArs) || priceArs <= 0) {
    return NextResponse.json({ error: 'priceArs inválido' }, { status: 400 });
  }
  if (!Number.isInteger(groupSize) || groupSize < 2) {
    return NextResponse.json({ error: 'groupSize inválido' }, { status: 400 });
  }
  if (!Number.isFinite(discountPct) || discountPct <= 0 || discountPct >= 100) {
    return NextResponse.json({ error: 'discountPct inválido' }, { status: 400 });
  }

  const updatedAt = new Date().toISOString();
  const { error } = await adminSupabase.from('app_settings').upsert([
    { key: 'payment_price_ars', value: { amount: priceArs }, updated_at: updatedAt },
    { key: 'referral_group_size', value: { value: groupSize }, updated_at: updatedAt },
    { key: 'referral_discount_pct', value: { value: discountPct }, updated_at: updatedAt },
  ]);
  if (error) return NextResponse.json({ error: 'Update failed' }, { status: 500 });
  return NextResponse.json({ ok: true });
}
