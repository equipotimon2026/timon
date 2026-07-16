import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUserId } from '@/lib/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { hasPaidAccess } from '@/lib/payment-access';
import { getTaloClient } from '@/lib/talo';

export async function GET(req: NextRequest) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const admin = createAdminClient();
  const { data: latest, error: latestError } = await admin
    .from('payments')
    .select('id, talo_payment_id, status')
    .eq('user_id', userId)
    .neq('status', 'CANCELLED')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  if (latestError) {
    console.error('[payments] GET status (select latest):', latestError);
  }

  if (!latest) {
    return NextResponse.json({ status: 'NONE', hasAccess: await hasPaidAccess(userId) });
  }

  let status = latest.status;

  // Si sigue PENDING, re-consultar a Talo: cubre webhook perdido y dev local
  // (donde el webhook nunca llega a localhost).
  if (status === 'PENDING' && latest.talo_payment_id) {
    try {
      const talo = getTaloClient();
      const remote = await talo.payments.get(latest.talo_payment_id);
      const remoteStatus = remote.payment_status;
      if (remoteStatus && remoteStatus !== 'PENDING') {
        status = remoteStatus;
        // Guard atómico: solo actualizar si status sigue siendo PENDING
        const { error: updateError } = await admin.from('payments').update({
          status: remoteStatus,
          updated_at: new Date().toISOString(),
        }).eq('id', latest.id).eq('status', 'PENDING');
        if (updateError) {
          console.error('[payments] GET status (update from remote):', updateError);
        }
      }
    } catch (err) {
      console.error('[talo] Error consultando pago:', err);
      // devolvemos el estado local sin romper el polling
    }
  }

  return NextResponse.json({ status, hasAccess: await hasPaidAccess(userId) });
}
