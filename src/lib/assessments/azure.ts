import 'server-only';
import { SupabaseClient } from '@supabase/supabase-js';
import { AzurePollResult, classifyAzureResponse } from './azure-logic';

export { classifyAzureResponse, isPastTimeout } from './azure-logic';
export type { AzurePollResult } from './azure-logic';

// Base de Azure configurable por env para sobrevivir la migración de cuenta
// sin tocar código. Fallback al valor histórico si la env no está seteada.
const DEFAULT_AZURE_BASE_URL =
  'https://timon-agents-ckfqd5evcdcqgsg9.eastus2-01.azurewebsites.net';

export function getAzureAssessmentsUrl(): string {
  const base = process.env.AZURE_BASE_URL ?? DEFAULT_AZURE_BASE_URL;
  return `${base}/api/assessments`;
}

export async function pollAzure(
  assessmentId: string,
  email: string
): Promise<AzurePollResult> {
  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return { kind: 'unreachable', detail: 'AZURE_FUNCTIONS_KEY not configured' };
  }
  try {
    const res = await fetch(
      `${getAzureAssessmentsUrl()}/${assessmentId}?email=${encodeURIComponent(email)}`,
      { headers: { 'x-functions-key': azureKey } }
    );
    const body = await res.text();
    return classifyAzureResponse(res.ok, res.status, body);
  } catch (err) {
    return { kind: 'unreachable', detail: String(err) };
  }
}

/**
 * Persiste un resultado terminal de Azure. Único camino de escritura,
 * compartido entre el poll del navegador (GET /api/analyze) y el cron de
 * reconciliación. 'processing' y 'unreachable' son no-ops a propósito.
 */
export async function applyPollResult(
  admin: SupabaseClient,
  assessmentId: string,
  result: AzurePollResult
): Promise<void> {
  if (result.kind === 'completed') {
    // Activación en dos UPDATEs (sin tx multi-statement vía supabase-js).
    // El índice único de mig 008 (un is_active=true por user) cubre la carrera;
    // el peor caso transitorio es 0 activos, nunca 2.
    const { data: thisRow } = await admin
      .from('assessments')
      .select('id, user_id')
      .eq('assessment_id', assessmentId)
      .maybeSingle();

    if (thisRow) {
      const { error: deactivateError } = await admin
        .from('assessments')
        .update({ is_active: false })
        .eq('user_id', thisRow.user_id)
        .eq('is_active', true)
        .neq('id', thisRow.id);

      if (deactivateError) {
        console.error('[assessments] ← Failed to deactivate old assessment:', deactivateError.message);
      }

      const { error: activateError } = await admin
        .from('assessments')
        .update({
          status: 'completed',
          results: result.results,
          completed_at: new Date().toISOString(),
          is_active: true,
        })
        .eq('id', thisRow.id);

      if (activateError) {
        console.error('[assessments] ← Failed to activate assessment:', activateError.message);
      } else {
        console.log('[assessments] ← Assessment %s activated (is_active=true)', assessmentId);
      }
    } else {
      const { error: saveError } = await admin
        .from('assessments')
        .update({
          status: 'completed',
          results: result.results,
          completed_at: new Date().toISOString(),
        })
        .eq('assessment_id', assessmentId);

      if (saveError) {
        console.error('[assessments] ← Failed to save results (fallback):', saveError.message);
      }
    }
    return;
  }

  if (result.kind === 'failed') {
    const { error: updateError } = await admin
      .from('assessments')
      .update({
        status: 'failed',
        error: result.error,
        completed_at: new Date().toISOString(),
      })
      .eq('assessment_id', assessmentId);

    if (updateError) {
      console.error('[assessments] ← Failed to update assessment as failed:', updateError.message);
    } else {
      console.log('[assessments] ← Assessment marked as failed for %s', assessmentId);
    }
  }
}

/** Marca failed por timeout, solo si sigue en processing (guard atómico). */
export async function markTimedOut(
  admin: SupabaseClient,
  rowId: number | string,
  message: string
): Promise<void> {
  await admin
    .from('assessments')
    .update({
      status: 'failed',
      error: message,
      completed_at: new Date().toISOString(),
    })
    .eq('id', rowId)
    .eq('status', 'processing');
}
