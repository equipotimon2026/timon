// Logica pura del polling a Azure. Sin IO — testeable con node:test.
// El IO (fetch, Supabase) vive en ./azure.ts.

export type AzurePollResult =
  | { kind: 'completed'; results: unknown }
  | { kind: 'failed'; error: string }
  | { kind: 'processing'; status: string }
  | { kind: 'unreachable'; detail: string };

/** Clasificacion de la respuesta de Azure. Errores HTTP y body no-JSON son
 *  'unreachable' (= no decidir nada), nunca 'failed'. */
export function classifyAzureResponse(
  ok: boolean,
  httpStatus: number,
  body: string
): AzurePollResult {
  if (!ok) {
    return {
      kind: 'unreachable',
      detail: `Azure poll error ${httpStatus}: ${body.slice(0, 300)}`,
    };
  }
  let parsed: { status?: string; results?: unknown; error?: string };
  try {
    parsed = JSON.parse(body);
  } catch {
    return {
      kind: 'unreachable',
      detail: `Azure devolvio body no-JSON: ${body.slice(0, 300)}`,
    };
  }
  if (parsed.status === 'completed') {
    return { kind: 'completed', results: parsed.results };
  }
  if (parsed.status === 'failed') {
    return { kind: 'failed', error: parsed.error ?? 'Unknown error' };
  }
  return { kind: 'processing', status: parsed.status ?? 'processing' };
}

export function isPastTimeout(
  createdAt: string | null,
  nowMs: number,
  timeoutMs: number
): boolean {
  if (!createdAt) return false;
  return nowMs - new Date(createdAt).getTime() > timeoutMs;
}
