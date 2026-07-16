import 'server-only';
import { hasPaidAccess } from '@/lib/payment-access';
import { isPaidOrder } from '@/lib/payment-pricing';
import {
  getStepBySlug,
  getStepBySectionId,
} from '@/components/journey-path/journey-steps-config';

/** true si el módulo (por slug de ruta) requiere pago y el usuario no lo tiene. */
export async function isSlugPaymentLocked(userId: number, slug: string): Promise<boolean> {
  const step = getStepBySlug(slug);
  if (!step || !isPaidOrder(step.order)) return false;
  return !(await hasPaidAccess(userId));
}

/** true si la sección (por section_id) requiere pago y el usuario no lo tiene. */
export async function isSectionPaymentLocked(userId: number, sectionId: number): Promise<boolean> {
  const step = getStepBySectionId(sectionId);
  if (!step || !isPaidOrder(step.order)) return false;
  return !(await hasPaidAccess(userId));
}
