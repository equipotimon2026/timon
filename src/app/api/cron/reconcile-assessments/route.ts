import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  applyPollResult,
  isPastTimeout,
  markTimedOut,
  pollAzure,
} from '@/lib/assessments/azure';
import { mapWithConcurrency } from '@/lib/assessments/azure-logic';
import { logAssessmentEvent } from '@/lib/assessments/log';

export const maxDuration = 60;

// Lote chico, los mas viejos primero: el cron corre cada 5 min, no hace falta
// drenar todo en una pasada.
const BATCH_SIZE = 20;

// Polls a Azure en paralelo acotado: 20 items secuenciales con timeout de 10s
// podrian superar los 60s de maxDuration; con 4 workers el peor caso queda
// dentro del presupuesto sin ametrallar a Azure.
const POLL_CONCURRENCY = 4;

// Pasado este punto no se arrancan items nuevos: mejor devolver contadores
// reales que morir por maxDuration con la respuesta a medias. Lo que quedo
// afuera se reintenta en la proxima corrida (idempotente).
const SOFT_BUDGET_MS = 45_000;

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
// failed. Las reglas user/admin/cancelled viven en applyPollResult (las
// generaciones de admin NUNCA se activan solas). Tope duro opcional via
// RECONCILE_HARD_TIMEOUT_MIN (0/ausente = off).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const admin = createAdminClient();

  const { data: pending, error } = await admin
    .from('assessments')
    .select('id, assessment_id, user_id, created_at, generated_by')
    .eq('status', 'processing')
    .order('created_at', { ascending: true })
    .limit(BATCH_SIZE);

  if (error) {
    logAssessmentEvent({ source: 'cron', event: 'scan_error', detail: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const counts = {
    scanned: pending?.length ?? 0,
    completed: 0,
    failed: 0,
    still_processing: 0,
    unreachable: 0,
    timed_out: 0,
    skipped: 0,
    persistence_errors: 0,
  };

  const respond = () => {
    const duration_ms = Date.now() - startedAt;
    const ok = counts.persistence_errors === 0;
    logAssessmentEvent({
      source: 'cron',
      event: 'reconcile_run',
      duration_ms,
      detail: JSON.stringify(counts),
    });
    // Non-2xx cuando hubo errores de persistencia: el curl --fail-with-body
    // del workflow marca la corrida como fallida y queda visible en Actions.
    return NextResponse.json({ ok, ...counts, duration_ms }, { status: ok ? 200 : 500 });
  };

  if (!pending || pending.length === 0) {
    return respond();
  }

  const userIds = [...new Set(pending.map((a) => a.user_id))];
  const { data: users, error: usersError } = await admin
    .from('users')
    .select('id, email')
    .in('id', userIds);

  if (usersError) {
    logAssessmentEvent({ source: 'cron', event: 'scan_error', detail: usersError.message });
    return NextResponse.json({ error: usersError.message }, { status: 500 });
  }
  const emailById = new Map((users ?? []).map((u) => [u.id, u.email]));

  const hardTimeoutMin = Number(process.env.RECONCILE_HARD_TIMEOUT_MIN ?? '0');

  await mapWithConcurrency(pending, POLL_CONCURRENCY, async (row) => {
    if (Date.now() - startedAt > SOFT_BUDGET_MS) {
      counts.skipped++;
      return;
    }

    const email = emailById.get(row.user_id);
    if (!email) {
      counts.skipped++;
      logAssessmentEvent({
        source: 'cron',
        event: 'skip_no_email',
        assessment_id: row.assessment_id,
        db_id: row.id,
      });
      return;
    }

    const pollStarted = Date.now();
    const result = await pollAzure(row.assessment_id, email);

    if (result.kind === 'completed' || result.kind === 'failed') {
      const applied = await applyPollResult(admin, row.assessment_id, result);
      logAssessmentEvent({
        source: 'cron',
        event: 'apply',
        assessment_id: row.assessment_id,
        db_id: row.id,
        from: 'processing',
        to: result.kind === 'completed' ? 'completed' : 'failed',
        duration_ms: Date.now() - pollStarted,
        persistence: applied.outcome,
        detail: applied.outcome === 'applied' ? undefined : ('reason' in applied ? applied.reason : undefined),
      });
      if (applied.outcome === 'failed_to_persist') {
        counts.persistence_errors++;
      } else if (applied.outcome === 'skipped') {
        counts.skipped++;
      } else if (result.kind === 'completed') {
        counts.completed++;
      } else {
        counts.failed++;
      }
      return;
    }

    if (result.kind === 'unreachable') {
      // Sin respuesta de Azure no se decide nada: proxima corrida.
      counts.unreachable++;
      logAssessmentEvent({
        source: 'cron',
        event: 'poll_unreachable',
        assessment_id: row.assessment_id,
        db_id: row.id,
        duration_ms: Date.now() - pollStarted,
        detail: result.detail,
      });
      return;
    }

    // Azure confirma que sigue procesando: recien aca aplica el tope duro.
    if (
      hardTimeoutMin > 0 &&
      isPastTimeout(row.created_at, Date.now(), hardTimeoutMin * 60_000)
    ) {
      const timedOut = await markTimedOut(
        admin,
        row.id,
        `Timeout: supero los ${hardTimeoutMin} minutos sin resolucion de Azure.`
      );
      logAssessmentEvent({
        source: 'cron',
        event: 'timeout',
        assessment_id: row.assessment_id,
        db_id: row.id,
        from: 'processing',
        to: 'failed',
        persistence: timedOut.outcome,
      });
      if (timedOut.outcome === 'applied') counts.timed_out++;
      else if (timedOut.outcome === 'skipped') counts.skipped++;
      else counts.persistence_errors++;
      return;
    }

    counts.still_processing++;
  });

  return respond();
}
