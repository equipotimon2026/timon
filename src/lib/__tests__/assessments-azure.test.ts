import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  classifyAzureResponse,
  classifyAzureSubmitResponse,
  isPastTimeout,
  mapWithConcurrency,
  pollAzureCore,
  redactAzureDetail,
  resolveTimeoutMs,
  submitToAzureCore,
} from '../assessments/azure-logic';

// ── classifyAzureResponse (poll) ──

test('completed: devuelve los results', () => {
  const r = classifyAzureResponse(true, 200, JSON.stringify({ status: 'completed', results: { a: 1 } }));
  assert.deepEqual(r, { kind: 'completed', results: { a: 1 } });
});

test('failed: devuelve el error de Azure', () => {
  const r = classifyAzureResponse(true, 200, JSON.stringify({ status: 'failed', error: 'boom' }));
  assert.deepEqual(r, { kind: 'failed', error: 'boom' });
});

test('failed sin mensaje: fallback a Unknown error', () => {
  const r = classifyAzureResponse(true, 200, JSON.stringify({ status: 'failed' }));
  assert.deepEqual(r, { kind: 'failed', error: 'Unknown error' });
});

test('processing: passthrough del status', () => {
  const r = classifyAzureResponse(true, 200, JSON.stringify({ status: 'queued' }));
  assert.deepEqual(r, { kind: 'processing', status: 'queued' });
});

test('HTTP 500 es unreachable, nunca failed', () => {
  const r = classifyAzureResponse(false, 500, 'Internal Server Error');
  assert.equal(r.kind, 'unreachable');
});

test('HTTP 404 es unreachable, nunca failed, y expone el httpStatus', () => {
  const r = classifyAzureResponse(false, 404, 'Not Found');
  assert.equal(r.kind, 'unreachable');
  // El cron usa httpStatus === 404 (respuesta explicita de Azure) para drenar
  // rows irrecuperables via tope duro sin confundirlos con caidas de red.
  assert.equal(r.kind === 'unreachable' && r.httpStatus, 404);
});

test('timeout/error de red NO llevan httpStatus (no son respuesta de Azure)', async () => {
  const r = await pollAzureCore(
    async () => {
      throw new TypeError('fetch failed');
    },
    'http://azure.test',
    'key',
    1000
  );
  assert.equal(r.kind === 'unreachable' && r.httpStatus, undefined);
});

test('body no-JSON es unreachable', () => {
  const r = classifyAzureResponse(true, 200, '<html>gateway timeout</html>');
  assert.equal(r.kind, 'unreachable');
});

// ── classifyAzureSubmitResponse (POST inicial) ──

test('submit OK con assessment_id', () => {
  const r = classifyAzureSubmitResponse(true, 200, JSON.stringify({ assessment_id: 'abc-123' }));
  assert.deepEqual(r, { kind: 'submitted', assessmentId: 'abc-123' });
});

test('submit sin assessment_id es rejected', () => {
  const r = classifyAzureSubmitResponse(true, 200, JSON.stringify({ ok: true }));
  assert.equal(r.kind, 'rejected');
});

test('submit con assessment_id vacio es rejected', () => {
  const r = classifyAzureSubmitResponse(true, 200, JSON.stringify({ assessment_id: '' }));
  assert.equal(r.kind, 'rejected');
});

test('submit con body no-JSON es rejected', () => {
  const r = classifyAzureSubmitResponse(true, 200, '<html>oops</html>');
  assert.equal(r.kind, 'rejected');
});

test('submit con HTTP error es rejected e incluye el status', () => {
  const r = classifyAzureSubmitResponse(false, 503, 'Service Unavailable');
  assert.equal(r.kind, 'rejected');
  assert.equal(r.kind === 'rejected' && r.httpStatus, 503);
});

// ── redactAzureDetail: nunca bodies de Azure en los logs ──

test('redacta el body de un error de poll (puede reflejar payload/PII)', () => {
  const detail = 'Azure poll error 400: {"error":"invalid","echo":"Juan Perez juan@mail.com"}';
  assert.equal(redactAzureDetail(detail), 'Azure poll error 400');
});

test('redacta el body de un error de submit', () => {
  assert.equal(
    redactAzureDetail('Azure submit error 422: {"payload":{"first_name":"Juan"}}'),
    'Azure submit error 422'
  );
});

test('redacta bodies no-JSON y de assessment_id ausente', () => {
  assert.equal(
    redactAzureDetail('Azure devolvio body no-JSON: <html>algo</html>'),
    'Azure devolvio body no-JSON'
  );
  assert.equal(
    redactAzureDetail('Azure no devolvio assessment_id: {"echo":"datos"}'),
    'Azure no devolvio assessment_id'
  );
});

test('details sin body (timeout, errores de red) pasan capados', () => {
  assert.equal(redactAzureDetail('Timeout de red tras 10000ms'), 'Timeout de red tras 10000ms');
  assert.equal(redactAzureDetail('TypeError: fetch failed'), 'TypeError: fetch failed');
  assert.equal(redactAzureDetail('x'.repeat(500)).length, 200);
});

test('un error de fetch que incluye la URL no filtra el ?email= (scrub en origen)', async () => {
  // Caso real del review: una AZURE_BASE_URL invalida hace que fetch tire un
  // error cuyo mensaje contiene la URL completa, query string incluido.
  const r = await pollAzureCore(
    async (url) => {
      throw new TypeError(`Failed to parse URL from ${url}`);
    },
    'not-a-url/api/assessments/abc?email=juan.perez@mail.com',
    'key',
    1000
  );
  assert.equal(r.kind, 'unreachable');
  const detail = r.kind === 'unreachable' ? r.detail : '';
  assert.ok(!detail.includes('juan.perez@mail.com'), `el detail filtro el email: ${detail}`);
  assert.match(detail, /\?<redacted>/);
});

// ── isPastTimeout ──

test('isPastTimeout: false dentro del plazo', () => {
  const created = new Date('2026-07-24T10:00:00Z').toISOString();
  const now = new Date('2026-07-24T10:29:00Z').getTime();
  assert.equal(isPastTimeout(created, now, 30 * 60 * 1000), false);
});

test('isPastTimeout: true pasado el plazo', () => {
  const created = new Date('2026-07-24T10:00:00Z').toISOString();
  const now = new Date('2026-07-24T10:31:00Z').getTime();
  assert.equal(isPastTimeout(created, now, 30 * 60 * 1000), true);
});

test('isPastTimeout: sin created_at nunca expira', () => {
  assert.equal(isPastTimeout(null, Date.now(), 1), false);
});

// ── resolveTimeoutMs ──

test('resolveTimeoutMs: usa el valor de env cuando es valido', () => {
  assert.equal(resolveTimeoutMs('5000', 10_000), 5000);
});

test('resolveTimeoutMs: fallback con undefined, vacio, NaN, 0 y negativos', () => {
  assert.equal(resolveTimeoutMs(undefined, 10_000), 10_000);
  assert.equal(resolveTimeoutMs('', 10_000), 10_000);
  assert.equal(resolveTimeoutMs('abc', 10_000), 10_000);
  assert.equal(resolveTimeoutMs('0', 10_000), 10_000);
  assert.equal(resolveTimeoutMs('-5', 10_000), 10_000);
});

// ── pollAzureCore (fetch inyectado, sin Azure real) ──

type FakeResponse = { ok: boolean; status: number; text(): Promise<string> };
const jsonResponse = (status: number, body: unknown): FakeResponse => ({
  ok: status >= 200 && status < 300,
  status,
  text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
});

test('pollAzureCore: completed', async () => {
  const r = await pollAzureCore(
    async () => jsonResponse(200, { status: 'completed', results: { x: 1 } }),
    'http://azure.test/api/assessments/1?email=e',
    'key',
    1000
  );
  assert.deepEqual(r, { kind: 'completed', results: { x: 1 } });
});

test('pollAzureCore: failed', async () => {
  const r = await pollAzureCore(
    async () => jsonResponse(200, { status: 'failed', error: 'agent crashed' }),
    'http://azure.test',
    'key',
    1000
  );
  assert.deepEqual(r, { kind: 'failed', error: 'agent crashed' });
});

test('pollAzureCore: processing', async () => {
  const r = await pollAzureCore(
    async () => jsonResponse(200, { status: 'running' }),
    'http://azure.test',
    'key',
    1000
  );
  assert.deepEqual(r, { kind: 'processing', status: 'running' });
});

test('pollAzureCore: error de red es unreachable', async () => {
  const r = await pollAzureCore(
    async () => {
      throw new TypeError('fetch failed');
    },
    'http://azure.test',
    'key',
    1000
  );
  assert.equal(r.kind, 'unreachable');
});

test('pollAzureCore: manda la functions key y el signal', async () => {
  let seenKey: string | undefined;
  let seenSignal: AbortSignal | undefined;
  await pollAzureCore(
    async (_url, init) => {
      seenKey = init.headers['x-functions-key'];
      seenSignal = init.signal;
      return jsonResponse(200, { status: 'processing' });
    },
    'http://azure.test',
    'secret-key',
    1000
  );
  assert.equal(seenKey, 'secret-key');
  assert.ok(seenSignal instanceof AbortSignal);
});

// fetch fake que nunca responde: solo rechaza cuando el signal aborta. El
// timer ref'd mantiene vivo el event loop (el de AbortSignal.timeout es
// unref'd; en un fetch real lo mantiene vivo el socket).
const neverRespondingFetch = (_url: string, init: { signal: AbortSignal }) =>
  new Promise<never>((_resolve, reject) => {
    const keepAlive = setTimeout(() => reject(new Error('el signal nunca aborto')), 5000);
    init.signal.addEventListener('abort', () => {
      clearTimeout(keepAlive);
      reject(init.signal.reason);
    });
  });

test('pollAzureCore: timeout de red es unreachable, nunca failed', async () => {
  const r = await pollAzureCore(neverRespondingFetch, 'http://azure.test', 'key', 25);
  assert.equal(r.kind, 'unreachable');
  assert.match(r.kind === 'unreachable' ? r.detail : '', /Timeout de red tras 25ms/);
});

// ── submitToAzureCore ──

test('submitToAzureCore: submitted con assessment_id', async () => {
  const r = await submitToAzureCore(
    async () => jsonResponse(200, { assessment_id: 'new-id' }),
    'http://azure.test',
    'key',
    '{}',
    1000
  );
  assert.deepEqual(r, { kind: 'submitted', assessmentId: 'new-id' });
});

test('submitToAzureCore: timeout es unreachable (reintentable), no rejected', async () => {
  const r = await submitToAzureCore(neverRespondingFetch, 'http://azure.test', 'key', '{}', 25);
  assert.equal(r.kind, 'unreachable');
});

// ── mapWithConcurrency ──

test('mapWithConcurrency: preserva el orden de resultados', async () => {
  const items = [30, 10, 20];
  const out = await mapWithConcurrency(items, 2, async (ms) => {
    await new Promise((r) => setTimeout(r, ms));
    return ms * 2;
  });
  assert.deepEqual(out, [60, 20, 40]);
});

test('mapWithConcurrency: nunca supera el limite de concurrencia', async () => {
  let active = 0;
  let maxActive = 0;
  await mapWithConcurrency([1, 2, 3, 4, 5, 6, 7, 8], 3, async () => {
    active++;
    maxActive = Math.max(maxActive, active);
    await new Promise((r) => setTimeout(r, 5));
    active--;
  });
  assert.ok(maxActive <= 3, `maxActive=${maxActive}`);
});

test('mapWithConcurrency: funciona con limite mayor que la lista y lista vacia', async () => {
  assert.deepEqual(await mapWithConcurrency([1], 10, async (n) => n + 1), [2]);
  assert.deepEqual(await mapWithConcurrency([], 4, async () => 1), []);
});
