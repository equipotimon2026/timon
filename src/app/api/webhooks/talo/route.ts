import { createWebhookHandler } from 'talo-pay';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Webhook de Talo. El SDK valida el evento y re-consulta el estado real del
 * pago a la API de Talo antes de invocar onPaymentUpdated (anti-spoofing).
 * Sin auth de sesión: es server-to-server.
 */
const handler = createWebhookHandler(
  {
    clientId: process.env.TALO_CLIENT_ID!,
    clientSecret: process.env.TALO_CLIENT_SECRET!,
    userId: process.env.TALO_USER_ID!,
    environment: (process.env.TALO_ENVIRONMENT as 'sandbox' | 'production') ?? 'production',
  },
  {
    onPaymentUpdated: async ({ event, payment }) => {
      const admin = createAdminClient();
      const status = payment.payment_status;
      if (!status) return;

      // Idempotente: no pisar estados finales con PENDING.
      const match = event.externalId
        ? { column: 'external_id', value: event.externalId }
        : { column: 'talo_payment_id', value: event.paymentId };

      const { data: row, error: selectError } = await admin
        .from('payments')
        .select('id, status')
        .eq(match.column, match.value)
        .maybeSingle();
      if (selectError) {
        console.error('[talo webhook] error consultando payments', selectError);
        return;
      }
      if (!row) {
        console.error('[talo webhook] pago desconocido', event.paymentId, event.externalId);
        return;
      }
      // No filtramos por status: un pago real sobre un row local CANCELLED
      // (ej. link viejo regenerado) debe poder desbloquear igual.
      if (['SUCCESS', 'OVERPAID'].includes(row.status)) return; // final, no pisar
      if (row.status === status) return;

      const { error: updateError } = await admin
        .from('payments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', row.id);
      if (updateError) {
        console.error('[talo webhook] error actualizando payment', updateError);
      }
    },
  }
);

export async function POST(request: Request): Promise<Response> {
  return handler(request);
}
