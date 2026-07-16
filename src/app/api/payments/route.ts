import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUserId } from '@/lib/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasPaidAccess, getPriceForUser } from '@/lib/payment-access';
import { getTaloClient, getAppUrl } from '@/lib/talo';

export async function POST(req: NextRequest) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  if (await hasPaidAccess(userId)) {
    return NextResponse.json({ error: 'Ya tenés acceso' }, { status: 409 });
  }

  const admin = createAdminClient();
  const price = await getPriceForUser(userId);

  // Pago PENDING vigente al mismo precio → reusar (no duplicar pagos en Talo).
  const { data: pending, error: pendingError } = await admin
    .from('payments')
    .select('id, amount, payment_url, expires_at')
    .eq('user_id', userId)
    .eq('status', 'PENDING')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (pendingError) {
    console.error('[payments] POST (select pending):', pendingError);
  }

  if (pending && pending.payment_url) {
    const vigente = !pending.expires_at || new Date(pending.expires_at) > new Date();
    if (vigente && Number(pending.amount) === price.amount) {
      return NextResponse.json({ paymentUrl: pending.payment_url });
    }
    // Precio cambió (ej. grupo llegó a 4) o expiró → cancelamos el row local.
    // El pago viejo sigue vivo en Talo; si el usuario lo paga igual, el webhook
    // lo marca SUCCESS y desbloquea (caso borde aceptado en la spec).
    const { error: cancelError } = await admin.from('payments').update({
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
    }).eq('id', pending.id);
    if (cancelError) {
      console.error('[payments] POST (cancel stale pending):', cancelError);
    }
  }

  // Datos del usuario para client_data de Talo
  const { data: user, error: userError } = await admin
    .from('users')
    .select('first_name, last_name, email')
    .eq('id', userId)
    .single();
  if (userError) {
    console.error('[payments] POST (select user):', userError);
  }

  // Row primero (external_id determinístico a partir del id)
  const { data: row, error: insertError } = await admin
    .from('payments')
    .insert({
      user_id: userId,
      external_id: crypto.randomUUID(),
      base_amount: price.baseAmount,
      amount: price.amount,
      discount_pct: price.discountPct,
      referral_code: price.referralCode,
      currency: 'ARS',
      status: 'PENDING',
    })
    .select('id, external_id')
    .single();
  if (insertError || !row) {
    console.error('[payments] POST (insert row):', insertError);
    return NextResponse.json({ error: 'Error creando pago' }, { status: 500 });
  }

  const appUrl = getAppUrl();
  try {
    const talo = getTaloClient();
    const payment = await talo.payments.create({
      user_id: process.env.TALO_USER_ID!,
      price: { amount: price.amount, currency: 'ARS' },
      payment_options: ['transfer'],
      external_id: row.external_id,
      webhook_url: `${appUrl}/api/webhooks/talo`,
      redirect_url: `${appUrl}/es/payment/callback`,
      motive: 'Timon - desbloqueo de análisis completo',
      client_data: {
        first_name: user?.first_name ?? undefined,
        last_name: user?.last_name ?? undefined,
        email: user?.email ?? undefined,
      },
    });

    const { error: updateError } = await admin.from('payments').update({
      talo_payment_id: payment.id,
      payment_url: payment.payment_url,
      expires_at: payment.expiration_timestamp ?? null,
      updated_at: new Date().toISOString(),
    }).eq('id', row.id);
    if (updateError) {
      console.error('[payments] POST (update row post-create):', updateError);
    }

    return NextResponse.json({ paymentUrl: payment.payment_url });
  } catch (err) {
    console.error('[talo] Error creando pago:', err);
    // Row local queda PENDING sin talo_payment_id; lo cancelamos para no ensuciar.
    const { error: cancelError } = await admin.from('payments').update({
      status: 'CANCELLED',
      updated_at: new Date().toISOString(),
    }).eq('id', row.id);
    if (cancelError) {
      console.error('[payments] POST (cancel after talo error):', cancelError);
    }
    return NextResponse.json(
      { error: 'No pudimos generar el pago. Reintentá en unos minutos.' },
      { status: 502 }
    );
  }
}
