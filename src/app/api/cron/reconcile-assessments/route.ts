import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  applyPollResult,
  isPastTimeout,
  markTimedOut,
  pollAzure,
} from '@/lib/assessments/azure';

export const maxDuration = 60;

// Lote chico, los mas viejos primero: el cron corre cada 5 min, no hace falta
// drenar todo en una pasada.
const BATCH_SIZE = 20;

// Reconciliacion server-side de assessments en 'processing' contra Azure.
//
// Por que existe: el resultado de Azure solo se persistia cuando el navegador
// del usuario polleaba GET /api/analyze. Si cerraba la pestania, el assessment
// quedaba 'processing' para siempre (o 'failed' por timeout aunque Azure lo
// hubiera completado). Este cron cierra ese agujero sin depender del cliente.
//
// Reglas: solo actua con respuesta explicita de Azure (completed/failed).
// Errores de red o 5xx se saltean y se reintentan en la proxima corrida — una
// caida de Azure (ej. durante la migracion de cuenta) nunca genera falsos
// failed. Tope duro opcional via RECONCILE_HARD_TIMEOUT_MIN (0/ausente = off).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: pending, error } = await admin
    .from('assessments')
    .select('id, assessment_id, user_id, created_at')
    .eq('status', 'processing')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    console.error('[reconcile] Error consultando assessments:', error.message);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = { pending: pending?.length ?? 0, completed: 0, failed: 0, timedOut: 0, skipped: 0 };
  if (!pending || pending.length === 0) {
    return NextResponse.json({ ok: true, ...counts });
  }

  const userIds = [...new Set(pending.map((a) => a.user_id))];
  const { data: users, error: usersError } = await admin
    .from('users')
    .select('id, email')
    .in('id', userIds);

  if (usersError) {
    console.error('[reconcile] Error consultando users:', usersError.message);
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }
  const emailById = new Map((users ?? []).map((u) => [u.id, u.email]));

  const hardTimeoutMin = Number(process.env.RECONCILE_HARD_TIMEOUT_MIN ?? '0');

  for (const row of pending) {
    const email = emailById.get(row.user_id);
    if (!email) {
      counts.skipped++;
      continue;
    }

    const result = await pollAzure(row.assessment_id, email);

    if (result.kind === 'completed') {
      await applyPollResult(admin, row.assessment_id, result);
      counts.completed++;
      continue;
    }
    if (result.kind === 'failed') {
      await applyPollResult(admin, row.assessment_id, result);
      counts.failed++;
      continue;
    }
    if (
      result.kind === 'processing' &&
      hardTimeoutMin > 0 &&
      isPastTimeout(row.created_at, Date.now(), hardTimeoutMin * 60_000)
    ) {
      await markTimedOut(
        admin,
        row.id,
        `Timeout: supero los ${hardTimeoutMin} minutos sin resolucion de Azure.`
      );
      counts.timedOut++;
      continue;
    }

    // processing dentro de plazo, o Azure inalcanzable: proxima corrida.
    counts.skipped++;
  }

  console.log(
    '[reconcile] pending=%d completed=%d failed=%d timedOut=%d skipped=%d',
    counts.pending, counts.completed, counts.failed, counts.timedOut, counts.skipped
  );
  return NextResponse.json({ ok: true, ...counts });
}
