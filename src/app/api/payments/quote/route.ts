import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUserId } from '@/lib/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  hasPaidAccess,
  getPriceForUser,
  getReferralGroups,
} from '@/lib/payment-access';
import { GROUP_SIZE_THRESHOLD } from '@/lib/payment-pricing';

export async function GET(req: NextRequest) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [hasAccess, price, groups] = await Promise.all([
    hasPaidAccess(userId),
    getPriceForUser(userId),
    getReferralGroups(userId),
  ]);

  // Pago pendiente vigente (para mostrar "retomá tu pago" y no duplicar)
  const admin = createAdminClient();
  const { data: pending } = await admin
    .from('payments')
    .select('payment_url, amount, expires_at')
    .eq('user_id', userId)
    .eq('status', 'PENDING')
    .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  // Status del pago más reciente (excluyendo CANCELLED) para detectar UNDERPAID
  // y evitar que el usuario dispare otra transferencia completa.
  const { data: lastPayment } = await admin
    .from('payments')
    .select('status')
    .eq('user_id', userId)
    .neq('status', 'CANCELLED')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  return NextResponse.json({
    hasAccess,
    baseAmount: price.baseAmount,
    amount: price.amount,
    discountPct: price.discountPct,
    myCode: groups.myCode,
    myGroupSize: groups.myGroupSize,
    usedCode: groups.usedCode,
    usedGroupSize: groups.usedGroupSize,
    groupSizeThreshold: GROUP_SIZE_THRESHOLD,
    pendingPayment: pending
      ? { paymentUrl: pending.payment_url, amount: Number(pending.amount), expiresAt: pending.expires_at }
      : null,
    lastPaymentStatus: lastPayment?.status ?? null,
  });
}
