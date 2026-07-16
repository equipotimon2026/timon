/**
 * Lógica pura de precios del paywall. Sin IO — testeable con node:test.
 * Regla de producto: grupo de referidos (dueño + usuarios del código) >= 4
 * → 25% de descuento para los miembros que aún no pagaron.
 */
export const DEFAULT_GROUP_DISCOUNT_PCT = 25;
export const DEFAULT_GROUP_SIZE_THRESHOLD = 4;
/** Módulos con order >= 4 en JOURNEY_STEPS_CONFIG requieren pago. */
export const FIRST_PAID_ORDER = 4;

export interface PriceQuote {
  baseAmount: number;
  amount: number;
  discountPct: number;
}

export function computePrice(
  baseAmount: number,
  groupSize: number,
  threshold: number = DEFAULT_GROUP_SIZE_THRESHOLD,
  discountPct: number = DEFAULT_GROUP_DISCOUNT_PCT,
): PriceQuote {
  const discounted = groupSize >= threshold;
  const appliedPct = discounted ? discountPct : 0;
  const amount = discounted
    ? Math.round(baseAmount * (1 - discountPct / 100))
    : baseAmount;
  return { baseAmount, amount, discountPct: appliedPct };
}

export function isPaidOrder(order: number): boolean {
  return order >= FIRST_PAID_ORDER;
}
