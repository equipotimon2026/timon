// Logica pura del polling a Azure. Sin IO propio — testeable con node:test.
// El fetch se recibe inyectado; el wiring con env y Supabase vive en ./azure.ts.

export type AzurePollResult =
  | { kind: 'completed'; results: unknown }
  | { kind: 'failed'; error: string }
  | { kind: 'processing'; status: string }
  // httpStatus presente solo cuando Azure SI respondio (error HTTP): un 404
  // es una respuesta explicita ("ese job no existe"), distinta de un timeout
  // o error de red donde httpStatus queda undefined.
  | { kind: 'unreachable'; detail: string; httpStatus?: number };

export type AzureSubmitResult =
  | { kind: 'submitted'; assessmentId: string }
  | { kind: 'rejected'; httpStatus: number; detail: string }
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
      httpStatus,
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

/** Clasificacion de la respuesta al POST inicial. Un submit sin assessment_id
 *  o con body no-JSON es 'rejected': no hay nada que pollear despues. */
export function classifyAzureSubmitResponse(
  ok: boolean,
  httpStatus: number,
  body: string
): AzureSubmitResult {
  if (!ok) {
    return {
      kind: 'rejected',
      httpStatus,
      detail: `Azure submit error ${httpStatus}: ${body.slice(0, 300)}`,
    };
  }
  let parsed: { assessment_id?: unknown };
  try {
    parsed = JSON.parse(body);
  } catch {
    return {
      kind: 'rejected',
      httpStatus,
      detail: `Azure devolvio body no-JSON: ${body.slice(0, 300)}`,
    };
  }
  if (typeof parsed.assessment_id !== 'string' || parsed.assessment_id === '') {
    return {
      kind: 'rejected',
      httpStatus,
      detail: `Azure no devolvio assessment_id: ${body.slice(0, 300)}`,
    };
  }
  return { kind: 'submitted', assessmentId: parsed.assessment_id };
}

export function isPastTimeout(
  createdAt: string | null,
  nowMs: number,
  timeoutMs: number
): boolean {
  if (!createdAt) return false;
  return nowMs - new Date(createdAt).getTime() > timeoutMs;
}

// Prefijos de details que arrastran el BODY devuelto por Azure. Un error de
// validacion de Azure puede reflejar parte del payload (datos personales o
// respuestas), asi que a los LOGS solo va el prefijo (con el status HTTP);
// el detail completo puede viajar en la respuesta HTTP al admin, pero nunca
// persistirse en logs.
const BODY_BEARING_PREFIXES = [
  'Azure poll error',
  'Azure submit error',
  'Azure devolvio body no-JSON',
  'Azure no devolvio assessment_id',
];

/** Version segura de un detail de Azure para logging: corta el body reflejado
 *  y deja solo el prefijo + status HTTP. Details sin body (timeouts, errores
 *  de red) pasan capados a 200 chars. */
export function redactAzureDetail(detail: string): string {
  for (const prefix of BODY_BEARING_PREFIXES) {
    if (detail.startsWith(prefix)) {
      const cut = detail.indexOf(':');
      return cut === -1 ? detail : detail.slice(0, cut);
    }
  }
  return detail.slice(0, 200);
}

/** Parseo defensivo de timeouts desde env: NaN, vacio o <=0 caen al default. */
export function resolveTimeoutMs(raw: string | undefined, fallback: number): number {
  const n = Number(raw);
  return Number.isFinite(n) && n > 0 ? n : fallback;
}

type FetchLike = (
  url: string,
  init: { method?: string; headers: Record<string, string>; body?: string; signal: AbortSignal }
) => Promise<{ ok: boolean; status: number; text(): Promise<string> }>;

/** GET del estado de un assessment. Un timeout o error de red es 'unreachable',
 *  nunca 'failed': la falta de respuesta no dice nada sobre el trabajo. */
export async function pollAzureCore(
  fetchImpl: FetchLike,
  url: string,
  functionsKey: string,
  timeoutMs: number
): Promise<AzurePollResult> {
  try {
    const res = await fetchImpl(url, {
      headers: { 'x-functions-key': functionsKey },
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await res.text();
    return classifyAzureResponse(res.ok, res.status, body);
  } catch (err) {
    return { kind: 'unreachable', detail: describeFetchError(err, timeoutMs) };
  }
}

/** POST del trabajo a Azure. Error de red/timeout es 'unreachable' (reintentable);
 *  respuesta invalida es 'rejected' (no hay assessment que trackear). */
export async function submitToAzureCore(
  fetchImpl: FetchLike,
  url: string,
  functionsKey: string,
  payloadJson: string,
  timeoutMs: number
): Promise<AzureSubmitResult> {
  try {
    const res = await fetchImpl(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-functions-key': functionsKey,
      },
      body: payloadJson,
      signal: AbortSignal.timeout(timeoutMs),
    });
    const body = await res.text();
    return classifyAzureSubmitResponse(res.ok, res.status, body);
  } catch (err) {
    return { kind: 'unreachable', detail: describeFetchError(err, timeoutMs) };
  }
}

function describeFetchError(err: unknown, timeoutMs: number): string {
  // El abort de AbortSignal.timeout() es un DOMException 'TimeoutError'
  // (que no siempre es instanceof Error segun el runtime).
  const name = err && typeof err === 'object' && 'name' in err ? (err as { name: unknown }).name : null;
  if (name === 'TimeoutError') {
    return `Timeout de red tras ${timeoutMs}ms`;
  }
  return String(err);
}

/** map con concurrencia acotada, preservando el orden de resultados. */
export async function mapWithConcurrency<T, R>(
  items: readonly T[],
  limit: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  const workers = Array.from({ length: Math.max(1, Math.min(limit, items.length)) }, async () => {
    while (next < items.length) {
      const index = next++;
      results[index] = await fn(items[index], index);
    }
  });
  await Promise.all(workers);
  return results;
}
