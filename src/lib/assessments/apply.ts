// Persistencia de resultados terminales de Azure. UNICO camino de escritura,
// compartido por el poll del navegador (GET /api/analyze), el poll de admin y
// el cron de reconciliacion — y por un eventual webhook futuro. Las reglas de
// negocio viven aca para que ningun caller pueda contradecirlas:
//
//   • generated_by='user'  → completed se persiste Y se activa (is_active).
//   • generated_by='admin' → completed se persiste pero NUNCA se activa ni se
//     libera: el admin conserva su gate manual (activar / liberar).
//   • 'cancelled' es intencional: ni un completed tardio ni un failed lo pisan.
//     La unica excepcion es allowRecovery (accion explicita del admin), que
//     persiste los results pero tampoco activa.
//   • Toda escritura terminal esta condicionada al estado previo (UPDATE ...
//     WHERE status = <previo>), asi dos ejecuciones concurrentes no corrompen
//     nada: la segunda matchea 0 filas y termina en 'skipped'.
//
// Sin import de 'server-only' a proposito: este modulo se testea con node:test
// usando un SupabaseClient fake. Solo lo importan modulos server-side.

import type { SupabaseClient } from '@supabase/supabase-js';
import type { AzurePollResult } from './azure-logic';

export type ApplyPollOutcome =
  | { outcome: 'applied'; previousStatus: string; activated: boolean }
  | {
      outcome: 'skipped';
      reason:
        | 'not_terminal_result'
        | 'row_not_found'
        | 'already_terminal'
        | 'state_changed';
      currentStatus?: string;
    }
  | { outcome: 'failed_to_persist'; reason: string };

export interface ApplyPollOptions {
  /** Recuperacion explicita desde admin: permite persistir un completed tardio
   *  sobre un row cancelled/failed SIN results. Nunca activa. */
  allowRecovery?: boolean;
}

interface AssessmentRow {
  id: number | string;
  user_id: number;
  status: string;
  generated_by: string | null;
  results: unknown;
}

export async function applyPollResult(
  admin: SupabaseClient,
  assessmentId: string,
  result: AzurePollResult,
  opts: ApplyPollOptions = {}
): Promise<ApplyPollOutcome> {
  if (result.kind !== 'completed' && result.kind !== 'failed') {
    return { outcome: 'skipped', reason: 'not_terminal_result' };
  }

  const { data: row, error: fetchError } = await admin
    .from('assessments')
    .select('id, user_id, status, generated_by, results')
    .eq('assessment_id', assessmentId)
    .maybeSingle<AssessmentRow>();

  if (fetchError) {
    return { outcome: 'failed_to_persist', reason: `fetch: ${fetchError.message}` };
  }
  if (!row) {
    return { outcome: 'skipped', reason: 'row_not_found' };
  }

  if (result.kind === 'completed') {
    return applyCompleted(admin, row, result.results, opts);
  }
  return applyFailed(admin, row, result.error);
}

async function applyCompleted(
  admin: SupabaseClient,
  row: AssessmentRow,
  results: unknown,
  opts: ApplyPollOptions
): Promise<ApplyPollOutcome> {
  if (row.status === 'processing') {
    const { data: updated, error: updateError } = await admin
      .from('assessments')
      .update({
        status: 'completed',
        results,
        completed_at: new Date().toISOString(),
      })
      .eq('id', row.id)
      .eq('status', 'processing')
      .select('id');

    if (updateError) {
      return { outcome: 'failed_to_persist', reason: `complete: ${updateError.message}` };
    }
    if (!updated || updated.length === 0) {
      // Otro caller (o una cancelacion) gano la carrera.
      return { outcome: 'skipped', reason: 'state_changed' };
    }

    // Activacion: SOLO generaciones de usuario. Las de admin quedan con
    // is_active tal como este — activar y liberar es decision manual.
    if (row.generated_by !== 'admin') {
      return activate(admin, row);
    }
    return { outcome: 'applied', previousStatus: 'processing', activated: false };
  }

  // Estado terminal (completed/cancelled/failed): un completed tardio NO lo
  // pisa solo. Re-aplicar sobre un completed ya persistido es idempotente.
  if (!opts.allowRecovery || row.results != null) {
    return { outcome: 'skipped', reason: 'already_terminal', currentStatus: row.status };
  }

  // Recuperacion explicita del admin sobre un row terminal SIN results
  // (cancelado/pisado/anomalo cuyo agente igual termino OK). Nunca activa.
  const { data: recovered, error: recoverError } = await admin
    .from('assessments')
    .update({
      status: 'completed',
      results,
      completed_at: new Date().toISOString(),
      error: null,
    })
    .eq('id', row.id)
    .eq('status', row.status)
    .is('results', null)
    .select('id');

  if (recoverError) {
    return { outcome: 'failed_to_persist', reason: `recover: ${recoverError.message}` };
  }
  if (!recovered || recovered.length === 0) {
    return { outcome: 'skipped', reason: 'state_changed' };
  }
  return { outcome: 'applied', previousStatus: row.status, activated: false };
}

async function activate(admin: SupabaseClient, row: AssessmentRow): Promise<ApplyPollOutcome> {
  // Activacion en dos UPDATEs (sin tx multi-statement via supabase-js).
  // El indice unico de mig 008 (un is_active=true por user) cubre la carrera;
  // el peor caso transitorio es 0 activos, nunca 2.
  const { error: deactivateError } = await admin
    .from('assessments')
    .update({ is_active: false })
    .eq('user_id', row.user_id)
    .eq('is_active', true)
    .neq('id', row.id);

  if (deactivateError) {
    return { outcome: 'failed_to_persist', reason: `deactivate: ${deactivateError.message}` };
  }

  // Condicionado a 'completed': si algo cambio el estado en el medio, no
  // reactivamos una generacion que ya no es valida.
  const { data: activated, error: activateError } = await admin
    .from('assessments')
    .update({ is_active: true })
    .eq('id', row.id)
    .eq('status', 'completed')
    .select('id');

  if (activateError) {
    return { outcome: 'failed_to_persist', reason: `activate: ${activateError.message}` };
  }
  if (!activated || activated.length === 0) {
    return { outcome: 'skipped', reason: 'state_changed' };
  }
  return { outcome: 'applied', previousStatus: 'processing', activated: true };
}

async function applyFailed(
  admin: SupabaseClient,
  row: AssessmentRow,
  errorMessage: string
): Promise<ApplyPollOutcome> {
  // 'failed' solo puede pisar 'processing': nunca un cancelled intencional
  // ni un completed ya persistido.
  if (row.status !== 'processing') {
    return { outcome: 'skipped', reason: 'already_terminal', currentStatus: row.status };
  }

  const { data: updated, error: updateError } = await admin
    .from('assessments')
    .update({
      status: 'failed',
      error: errorMessage,
      completed_at: new Date().toISOString(),
    })
    .eq('id', row.id)
    .eq('status', 'processing')
    .select('id');

  if (updateError) {
    return { outcome: 'failed_to_persist', reason: `fail: ${updateError.message}` };
  }
  if (!updated || updated.length === 0) {
    return { outcome: 'skipped', reason: 'state_changed' };
  }
  return { outcome: 'applied', previousStatus: 'processing', activated: false };
}

export type MarkTimedOutOutcome =
  | { outcome: 'applied' }
  | { outcome: 'skipped' }
  | { outcome: 'failed_to_persist'; reason: string };

/** Marca failed por timeout, solo si sigue en processing (guard atomico). */
export async function markTimedOut(
  admin: SupabaseClient,
  rowId: number | string,
  message: string
): Promise<MarkTimedOutOutcome> {
  const { data: updated, error } = await admin
    .from('assessments')
    .update({
      status: 'failed',
      error: message,
      completed_at: new Date().toISOString(),
    })
    .eq('id', rowId)
    .eq('status', 'processing')
    .select('id');

  if (error) {
    return { outcome: 'failed_to_persist', reason: error.message };
  }
  if (!updated || updated.length === 0) {
    return { outcome: 'skipped' };
  }
  return { outcome: 'applied' };
}
