import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  isEmptyAnswer,
  normalizeResponseValues,
  questionHash,
  validateSingleResponseType,
} from '../responses/logic';

// ── questionHash: metadata de versionado, no identidad ──

test('mismo numero y mismo texto: el hash es estable (update idempotente)', () => {
  const a = questionHash('¿Qué te gusta estudiar?');
  const b = questionHash('¿Qué te gusta estudiar?');
  assert.equal(a, b);
});

test('hash normaliza mayusculas y espacios (igual que el backfill de mig 009)', () => {
  assert.equal(questionHash('  ¿Qué te GUSTA estudiar?  '), questionHash('¿qué te gusta estudiar?'));
});

test('mismo numero con texto modificado: hash distinto, misma identidad', () => {
  // La identidad (user, section, question_number) no cambia — el upsert
  // actualiza el MISMO row y solo el hash refleja la nueva redaccion.
  const v1 = questionHash('¿Qué materias te gustan?');
  const v2 = questionHash('¿Qué materias disfrutás más?');
  assert.notEqual(v1, v2);
});

// ── normalizacion ──

test('normalizeResponseValues: undefined → null', () => {
  assert.deepEqual(normalizeResponseValues({}), {
    response_boolean: null,
    response_integer: null,
    response_text: null,
    response_array: null,
  });
});

test('normalizeResponseValues: false y 0 se preservan', () => {
  const v = normalizeResponseValues({ response_boolean: false });
  assert.equal(v.response_boolean, false);
  assert.equal(normalizeResponseValues({ response_integer: 0 }).response_integer, 0);
});

// ── un solo tipo de respuesta ──

test('un solo tipo presente es valido (incluido boolean false)', () => {
  assert.deepEqual(
    validateSingleResponseType(normalizeResponseValues({ response_boolean: false })),
    { ok: true }
  );
  assert.deepEqual(
    validateSingleResponseType(normalizeResponseValues({ response_text: 'hola' })),
    { ok: true }
  );
});

test('dos tipos a la vez es invalido', () => {
  const r = validateSingleResponseType(
    normalizeResponseValues({ response_boolean: true, response_text: 'si' })
  );
  assert.equal(r.ok, false);
});

test('sin ningun tipo es valido para el validador (lo frena isEmptyAnswer)', () => {
  assert.deepEqual(validateSingleResponseType(normalizeResponseValues({})), { ok: true });
});

// ── respuesta vacia: nunca pisa una respuesta real ──

test('boolean false NO es vacio (es una respuesta valida)', () => {
  assert.equal(isEmptyAnswer(normalizeResponseValues({ response_boolean: false })), false);
});

test('integer 0 NO es vacio', () => {
  assert.equal(isEmptyAnswer(normalizeResponseValues({ response_integer: 0 })), false);
});

test('texto vacio o solo espacios ES vacio', () => {
  assert.equal(isEmptyAnswer(normalizeResponseValues({ response_text: '' })), true);
  assert.equal(isEmptyAnswer(normalizeResponseValues({ response_text: '   ' })), true);
});

test('todo null ES vacio', () => {
  assert.equal(isEmptyAnswer(normalizeResponseValues({})), true);
});

test('array presente NO es vacio', () => {
  assert.equal(isEmptyAnswer(normalizeResponseValues({ response_array: ['a'] })), false);
});
