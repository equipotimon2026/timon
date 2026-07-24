// Tests de las reglas centralizadas de persistencia (applyPollResult).
// Sin Supabase real: un cliente fake registra cada operacion y responde lo
// que el escenario programe. Lo importante: QUE updates se emiten, con QUE
// guardas de estado previo, y que el outcome refleje la realidad.

import { test } from 'node:test';
import assert from 'node:assert/strict';
import type { SupabaseClient } from '@supabase/supabase-js';
import { applyPollResult, markTimedOut } from '../assessments/apply';

interface Op {
  table: string;
  verb: 'select' | 'update';
  values?: Record<string, unknown>;
  filters: Array<{ method: string; args: unknown[] }>;
  single: boolean;
}

type Responder = (op: Op, index: number) => { data?: unknown; error?: { message: string } | null };

function makeFakeAdmin(responder: Responder): { client: SupabaseClient; ops: Op[] } {
  const ops: Op[] = [];
  const client = {
    from(table: string) {
      const op: Op = { table, verb: 'select', filters: [], single: false };
      const index = ops.length;
      ops.push(op);
      const result = () => {
        const r = responder(op, index) ?? {};
        return { data: r.data ?? null, error: r.error ?? null };
      };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const builder: any = {
        select() {
          return builder;
        },
        update(values: Record<string, unknown>) {
          op.verb = 'update';
          op.values = values;
          return builder;
        },
        eq(...args: unknown[]) {
          op.filters.push({ method: 'eq', args });
          return builder;
        },
        neq(...args: unknown[]) {
          op.filters.push({ method: 'neq', args });
          return builder;
        },
        is(...args: unknown[]) {
          op.filters.push({ method: 'is', args });
          return builder;
        },
        maybeSingle() {
          op.single = true;
          return Promise.resolve(result());
        },
        then(onFulfilled: (v: unknown) => unknown, onRejected?: (e: unknown) => unknown) {
          return Promise.resolve(result()).then(onFulfilled, onRejected);
        },
      };
      return builder;
    },
  };
  return { client: client as unknown as SupabaseClient, ops };
}

const hasFilter = (op: Op, method: string, ...args: unknown[]) =>
  op.filters.some((f) => f.method === method && JSON.stringify(f.args) === JSON.stringify(args));

const row = (overrides: Partial<Record<string, unknown>> = {}) => ({
  id: 1,
  user_id: 7,
  status: 'processing',
  generated_by: 'user',
  results: null,
  ...overrides,
});

const completedResult = { kind: 'completed' as const, results: { profile: 'ok' } };
const failedResult = { kind: 'failed' as const, error: 'agent crashed' };

// ── Generacion de USUARIO completada: persiste y activa ──

test('user completed: desactiva primero y persiste+activa en UN solo UPDATE terminal', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row() };
    if (op.verb === 'update') return { data: [{ id: 1 }] };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.deepEqual(r, { outcome: 'applied', previousStatus: 'processing', activated: true });

  const updates = ops.filter((o) => o.verb === 'update');
  assert.equal(updates.length, 2, 'deactivate + terminal, nada mas');

  // 1º: desactivar los otros (nunca al propio row)
  assert.deepEqual(updates[0].values, { is_active: false });
  assert.ok(hasFilter(updates[0], 'neq', 'id', 1), 'no desactiva al propio row');

  // 2º: escritura terminal atomica — status, results e is_active JUNTOS, con
  // guard de estado previo. Si esta escritura falla, el row sigue processing
  // y el cron reintenta (auto-reparable).
  assert.equal(updates[1].values?.status, 'completed');
  assert.equal(updates[1].values?.is_active, true);
  assert.ok(updates[1].values && 'results' in updates[1].values);
  assert.ok(hasFilter(updates[1], 'eq', 'status', 'processing'), 'el UPDATE terminal exige status previo');
});

// ── Generacion de ADMIN completada: persiste pero NUNCA activa ──

test('admin completed: guarda results/status/completed_at sin tocar is_active', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row({ generated_by: 'admin' }) };
    if (op.verb === 'update') return { data: [{ id: 1 }] };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.deepEqual(r, { outcome: 'applied', previousStatus: 'processing', activated: false });

  const updates = ops.filter((o) => o.verb === 'update');
  assert.equal(updates.length, 1, 'un solo UPDATE (el terminal)');
  assert.equal(updates[0].values?.status, 'completed');
  assert.ok(updates[0].values && 'results' in updates[0].values);
  assert.ok(updates[0].values && 'completed_at' in updates[0].values);
  assert.ok(!('is_active' in (updates[0].values ?? {})), 'is_active jamas se toca en flujo admin');
});

// ── Cancelled: un resultado tardio no lo convierte en perfil activo ──

test('cancelled + completed tardio (cron/user): skipped, cero escrituras', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row({ status: 'cancelled' }) };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.deepEqual(r, { outcome: 'skipped', reason: 'already_terminal', currentStatus: 'cancelled' });
  assert.equal(ops.filter((o) => o.verb === 'update').length, 0);
});

test('cancelled + allowRecovery (admin explicito): persiste sin activar', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row({ status: 'cancelled', generated_by: 'admin' }) };
    if (op.verb === 'update') return { data: [{ id: 1 }] };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult, { allowRecovery: true });
  assert.deepEqual(r, { outcome: 'applied', previousStatus: 'cancelled', activated: false });

  const updates = ops.filter((o) => o.verb === 'update');
  assert.equal(updates.length, 1);
  assert.ok(hasFilter(updates[0], 'eq', 'status', 'cancelled'), 'guard de estado previo');
  assert.ok(hasFilter(updates[0], 'is', 'results', null), 'solo recupera rows sin results');
  assert.ok(!('is_active' in (updates[0].values ?? {})));
});

test('cancelled + allowRecovery pero con results: skipped (no re-pisa)', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row({ status: 'cancelled', results: { old: true } }) };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult, { allowRecovery: true });
  assert.equal(r.outcome, 'skipped');
  assert.equal(ops.filter((o) => o.verb === 'update').length, 0);
});

// ── failed nunca pisa un cancelled intencional ──

test('failed sobre cancelled: skipped, cero escrituras', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row({ status: 'cancelled' }) };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', failedResult);
  assert.deepEqual(r, { outcome: 'skipped', reason: 'already_terminal', currentStatus: 'cancelled' });
  assert.equal(ops.filter((o) => o.verb === 'update').length, 0);
});

test('failed sobre processing: persiste con guard de status', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row() };
    if (op.verb === 'update') return { data: [{ id: 1 }] };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', failedResult);
  assert.deepEqual(r, { outcome: 'applied', previousStatus: 'processing', activated: false });

  const update = ops.find((o) => o.verb === 'update')!;
  assert.equal(update.values?.status, 'failed');
  assert.ok(hasFilter(update, 'eq', 'status', 'processing'));
});

// ── Idempotencia y carreras ──

test('re-aplicar sobre un completed ya persistido: skipped, mismo estado final', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row({ status: 'completed', results: { profile: 'ok' } }) };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.deepEqual(r, { outcome: 'skipped', reason: 'already_terminal', currentStatus: 'completed' });
  assert.equal(ops.filter((o) => o.verb === 'update').length, 0);
});

test('carrera: el UPDATE terminal matchea 0 filas → skipped state_changed', async () => {
  const { client } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row() };
    if (op.verb === 'update') return { data: [] };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.deepEqual(r, { outcome: 'skipped', reason: 'state_changed' });
});

test('row inexistente: skipped row_not_found', async () => {
  const { client } = makeFakeAdmin(() => ({ data: null }));
  const r = await applyPollResult(client, 'az-nope', completedResult);
  assert.deepEqual(r, { outcome: 'skipped', reason: 'row_not_found' });
});

test('resultado no terminal (processing/unreachable): no-op', async () => {
  const { client, ops } = makeFakeAdmin(() => ({}));
  const r1 = await applyPollResult(client, 'az-1', { kind: 'processing', status: 'running' });
  const r2 = await applyPollResult(client, 'az-1', { kind: 'unreachable', detail: 'net' });
  assert.equal(r1.outcome, 'skipped');
  assert.equal(r2.outcome, 'skipped');
  assert.equal(ops.length, 0, 'ni siquiera consulta la DB');
});

// ── Errores de persistencia: jamas se reportan como exito ──

test('fallo de Supabase en el UPDATE terminal: failed_to_persist', async () => {
  const { client } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row() };
    if (op.verb === 'update' && op.values?.status === 'completed')
      return { error: { message: 'connection reset' } };
    if (op.verb === 'update') return { data: [] };
    return {};
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.equal(r.outcome, 'failed_to_persist');
  assert.match(r.outcome === 'failed_to_persist' ? r.reason : '', /connection reset/);
});

test('fallo en el deactivate: failed_to_persist y SIN escritura terminal (auto-reparable)', async () => {
  const { client, ops } = makeFakeAdmin((op, i) => {
    if (i === 0) return { data: row() };
    if (op.verb === 'update' && op.values?.is_active === false)
      return { error: { message: 'deactivate boom' } };
    return { data: [{ id: 1 }] };
  });

  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.equal(r.outcome, 'failed_to_persist');
  // Clave del self-healing: el row NUNCA se marco completed, sigue en
  // processing y la proxima corrida del cron reintenta todo el ciclo.
  assert.ok(
    !ops.some((o) => o.verb === 'update' && o.values?.status === 'completed'),
    'no debe emitirse el UPDATE terminal si fallo el deactivate'
  );
});

test('fallo al leer el row: failed_to_persist, no skipped', async () => {
  const { client } = makeFakeAdmin(() => ({ error: { message: 'select boom' } }));
  const r = await applyPollResult(client, 'az-1', completedResult);
  assert.equal(r.outcome, 'failed_to_persist');
});

// ── markTimedOut ──

test('markTimedOut: applied solo si seguia processing', async () => {
  const { client, ops } = makeFakeAdmin((op) => {
    if (op.verb === 'update') return { data: [{ id: 5 }] };
    return {};
  });
  const r = await markTimedOut(client, 5, 'timeout');
  assert.deepEqual(r, { outcome: 'applied' });
  assert.ok(hasFilter(ops[0], 'eq', 'status', 'processing'));
});

test('markTimedOut: 0 filas matcheadas → skipped (el estado cambio)', async () => {
  const { client } = makeFakeAdmin(() => ({ data: [] }));
  const r = await markTimedOut(client, 5, 'timeout');
  assert.deepEqual(r, { outcome: 'skipped' });
});

test('markTimedOut: error de Supabase → failed_to_persist', async () => {
  const { client } = makeFakeAdmin(() => ({ error: { message: 'db down' } }));
  const r = await markTimedOut(client, 5, 'timeout');
  assert.equal(r.outcome, 'failed_to_persist');
});
