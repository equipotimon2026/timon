import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import {
  applyPollResult,
  isPastTimeout,
  markTimedOut,
  pollAzure,
} from '@/lib/assessments/azure';
import { mapWithConcurrency, redactAzureDetail } from '@/lib/assessments/azure-logic';
import { logAssessmentEvent } from '@/lib/assessments/log';

export const maxDuration = 60;

// Lote chico y MIXTO: mayoria de los mas viejos + una tajada de los mas
// nuevos. Si solo se tomaran los 20 mas viejos, 20 rows permanentemente rotos
// (404, sin email) monopolizarian el batch y los assessments recien creados
// jamas se reconciliarian (starvation). Con la tajada de nuevos, lo recien
// llegado siempre entra al scan aunque la cola vieja este podrida.
const OLDEST_BATCH = 12;
const NEWEST_BATCH = 8;

// Tope duro por default: 24hs. Un job de Azure tarda minutos; un row que
// lleva un dia entero sin resolucion no va a resolverse solo, y dejarlo vivo
// bloquea la cola. Se puede subir/bajar por env, o apagar explicitamente con
// '0' (un completed tardio igual es recuperable via poll del admin).
const DEFAULT_HARD_TIMEOUT_MIN = 1440;

function resolveHardTimeoutMin(raw: string | undefined): number {
  if (raw === undefined || raw === '') return DEFAULT_HARD_TIMEOUT_MIN;
  const n = Number(raw);
  return Number.isFinite(n) && n >= 0 ? n : DEFAULT_HARD_TIMEOUT_MIN;
}

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
// Reglas: dentro del plazo, solo actua con respuesta explicita de Azure
// (completed/failed) — errores de red o 5xx se saltean y se reintentan en la
// proxima corrida, asi una caida de Azure (ej. durante la migracion de
// cuenta) no genera falsos failed. Vencido el tope duro (default 24hs,
// RECONCILE_HARD_TIMEOUT_MIN, '0' = off) cualquier no-terminal se drena a
// failed para que la cola nunca quede bloqueada; un completed tardio sigue
// siendo recuperable via poll del admin. Las reglas user/admin/cancelled
// viven en applyPollResult (las generaciones de admin NUNCA se activan solas).
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const startedAt = Date.now();
  const admin = createAdminClient();

  const baseQuery = () =>
    admin
      .from('assessments')
      .select('id, assessment_id, user_id, created_at, generated_by')
      .eq('status', 'processing');

  const [oldestRes, newestRes] = await Promise.all([
    baseQuery().order('created_at', { ascending: true }).limit(OLDEST_BATCH),
    baseQuery().order('created_at', { ascending: false }).limit(NEWEST_BATCH),
  ]);

  const error = oldestRes.error ?? newestRes.error;
  if (error) {
    logAssessmentEvent({ source: 'cron', event: 'scan_error', detail: error.message });
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Merge con dedupe (con pocos processing, ambas tajadas se solapan).
  const seen = new Set<number | string>();
  const pending = [...(oldestRes.data ?? []), ...(newestRes.data ?? [])].filter((row) => {
    if (seen.has(row.id)) return false;
    seen.add(row.id);
    return true;
  });

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

  if (pending.length === 0) {
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

  const hardTimeoutMin = resolveHardTimeoutMin(process.env.RECONCILE_HARD_TIMEOUT_MIN);

  // Drenaje de rows permanentemente rotos: pasado el tope duro, CUALQUIER
  // estado no terminal (processing eterno, 404, 500 recurrente, sin email) se
  // marca failed y la cola avanza. Solo una respuesta terminal de Azure en
  // este mismo poll le gana al tope (un completed tardio siempre vale mas).
  const pastHardTimeout = (createdAt: string | null) =>
    hardTimeoutMin > 0 && isPastTimeout(createdAt, Date.now(), hardTimeoutMin * 60_000);

  const drain = async (
    row: { id: number | string; assessment_id: string },
    reason: string
  ) => {
    const timedOut = await markTimedOut(
      admin,
      row.id,
      `Timeout: supero los ${hardTimeoutMin} minutos sin resolucion (${reason}).`
    );
    logAssessmentEvent({
      source: 'cron',
      event: 'timeout',
      assessment_id: row.assessment_id,
      db_id: row.id,
      from: 'processing',
      to: 'failed',
      persistence: timedOut.outcome,
      detail: reason,
    });
    if (timedOut.outcome === 'applied') counts.timed_out++;
    else if (timedOut.outcome === 'skipped') counts.skipped++;
    else counts.persistence_errors++;
  };

  await mapWithConcurrency(pending, POLL_CONCURRENCY, async (row) => {
    if (Date.now() - startedAt > SOFT_BUDGET_MS) {
      counts.skipped++;
      return;
    }

    const email = emailById.get(row.user_id);
    if (!email) {
      // Sin email no hay como pollear a Azure: irrecuperable. Se drena via
      // tope duro; sin tope configurado solo se saltea (y se loguea).
      if (pastHardTimeout(row.created_at)) {
        await drain(row, 'sin email del usuario');
        return;
      }
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
      // Azure no dio respuesta usable (404, 5xx recurrente, timeout, red).
      // Dentro del plazo no se decide nada (proxima corrida); vencido el tope
      // duro se drena — un 500 eterno bloquea la cola igual que un 404.
      if (pastHardTimeout(row.created_at)) {
        await drain(
          row,
          result.httpStatus ? `Azure inaccesible (http ${result.httpStatus})` : 'Azure inaccesible'
        );
        return;
      }
      counts.unreachable++;
      logAssessmentEvent({
        source: 'cron',
        event: 'poll_unreachable',
        assessment_id: row.assessment_id,
        db_id: row.id,
        duration_ms: Date.now() - pollStarted,
        detail: redactAzureDetail(result.detail),
      });
      return;
    }

    // Azure confirma que sigue procesando: mismo tope duro.
    if (pastHardTimeout(row.created_at)) {
      await drain(row, 'Azure sigue processing');
      return;
    }

    counts.still_processing++;
  });

  return respond();
}
