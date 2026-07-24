import { test } from 'node:test';
import assert from 'node:assert/strict';
import { classifyAzureResponse, isPastTimeout } from '../assessments/azure-logic';

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

test('HTTP 404 es unreachable, nunca failed', () => {
  const r = classifyAzureResponse(false, 404, 'Not Found');
  assert.equal(r.kind, 'unreachable');
});

test('body no-JSON es unreachable', () => {
  const r = classifyAzureResponse(true, 200, '<html>gateway timeout</html>');
  assert.equal(r.kind, 'unreachable');
});

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
