import 'server-only';
import { createAdminClient } from '@/lib/supabase/admin';
import { computePrice, GROUP_SIZE_THRESHOLD } from '@/lib/payment-pricing';

/** Estados de pago Talo que otorgan acceso. */
const PAID_STATUSES = ['SUCCESS', 'OVERPAID'];

/** Alfabeto sin ambiguos (sin 0/O, 1/I/L) para códigos legibles. */
const CODE_ALPHABET = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
const CODE_LENGTH = 6;

function randomCode(): string {
  let out = '';
  for (let i = 0; i < CODE_LENGTH; i++) {
    out += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)];
  }
  return out;
}

/** Acceso = exento (whitelist) O tiene un pago SUCCESS/OVERPAID. Siempre derivado. */
export async function hasPaidAccess(userId: number): Promise<boolean> {
  const admin = createAdminClient();
  const { data: user } = await admin
    .from('users')
    .select('payment_exempt')
    .eq('id', userId)
    .single();
  if (user?.payment_exempt) return true;

  const { count } = await admin
    .from('payments')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .in('status', PAID_STATUSES);
  return (count ?? 0) > 0;
}

/** Precio de lista desde app_settings (editable en admin). */
export async function getPaymentPriceArs(): Promise<number> {
  const admin = createAdminClient();
  const { data } = await admin
    .from('app_settings')
    .select('value')
    .eq('key', 'payment_price_ars')
    .single();
  const amount = (data?.value as { amount?: number } | null)?.amount;
  if (typeof amount !== 'number' || amount <= 0) {
    throw new Error('payment_price_ars no configurado en app_settings');
  }
  return amount;
}

/**
 * Devuelve el referral_code del usuario, generándolo lazy si no existe
 * (cubre usuarios nuevos creados por el trigger de signup y el backfill).
 */
export async function getOrCreateReferralCode(userId: number): Promise<string> {
  const admin = createAdminClient();
  const { data: user } = await admin
    .from('users')
    .select('referral_code')
    .eq('id', userId)
    .single();
  if (user?.referral_code) return user.referral_code;

  // Reintentos por colisión del UNIQUE (31^6 ≈ 887M combinaciones, colisión rarísima)
  for (let attempt = 0; attempt < 5; attempt++) {
    const code = randomCode();
    const { error } = await admin
      .from('users')
      .update({ referral_code: code })
      .eq('id', userId)
      .is('referral_code', null);
    if (!error) {
      // Releer: si otro request ganó la carrera, devolvemos el que quedó.
      const { data: after } = await admin
        .from('users')
        .select('referral_code')
        .eq('id', userId)
        .single();
      if (after?.referral_code) return after.referral_code;
    }
  }
  throw new Error('No se pudo generar referral_code');
}

/** Tamaño de grupo de un código = dueño (1) + usuarios que lo ingresaron. */
async function groupSizeOfCode(code: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from('referral_uses')
    .select('id', { count: 'exact', head: true })
    .eq('code', code);
  return 1 + (count ?? 0);
}

export async function getReferralGroups(userId: number): Promise<{
  myCode: string;
  myGroupSize: number;
  usedCode: string | null;
  usedGroupSize: number;
}> {
  const admin = createAdminClient();
  const myCode = await getOrCreateReferralCode(userId);
  const myGroupSize = await groupSizeOfCode(myCode);

  const { data: use } = await admin
    .from('referral_uses')
    .select('code')
    .eq('user_id', userId)
    .maybeSingle();
  const usedCode = use?.code ?? null;
  const usedGroupSize = usedCode ? await groupSizeOfCode(usedCode) : 0;

  return { myCode, myGroupSize, usedCode, usedGroupSize };
}

/**
 * Precio para el usuario: 25% off si CUALQUIERA de sus grupos (el propio o
 * el del código que usó) llegó a 4. referralCode = el código que habilitó
 * el descuento (preferimos el usado; si no, el propio).
 */
export async function getPriceForUser(userId: number): Promise<{
  baseAmount: number;
  amount: number;
  discountPct: number;
  referralCode: string | null;
}> {
  const baseAmount = await getPaymentPriceArs();
  const { myCode, myGroupSize, usedCode, usedGroupSize } = await getReferralGroups(userId);

  const qualifying =
    usedCode && usedGroupSize >= GROUP_SIZE_THRESHOLD
      ? usedCode
      : myGroupSize >= GROUP_SIZE_THRESHOLD
        ? myCode
        : null;

  const groupSize = qualifying ? GROUP_SIZE_THRESHOLD : 1;
  const quote = computePrice(baseAmount, groupSize);
  return { ...quote, referralCode: qualifying };
}
