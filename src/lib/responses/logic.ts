// Logica pura del guardado de respuestas. Sin IO — testeable con node:test.
//
// Identidad canonica de una respuesta: (user_id, section_id, question_number),
// que es el UNIQUE real de la tabla (mig 001). `question_hash` NO es identidad:
// es metadata de versionado (que redaccion de la pregunta respondio el user).

import { createHash } from 'node:crypto';

/** Hash del texto de la pregunta (metadata de versionado, no identidad).
 *  Mismo algoritmo que el backfill de mig 009: sha256(lower(trim(text))). */
export function questionHash(text: string): string {
  return createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
}

export interface ResponseValues {
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}

/** Normaliza los campos de respuesta del body (undefined → null). */
export function normalizeResponseValues(body: {
  response_boolean?: boolean | null;
  response_integer?: number | null;
  response_text?: string | null;
  response_array?: unknown | null;
}): ResponseValues {
  return {
    response_boolean: body.response_boolean ?? null,
    response_integer: body.response_integer ?? null,
    response_text: body.response_text ?? null,
    response_array: body.response_array ?? null,
  };
}

/** Una respuesta debe traer a lo sumo UN tipo de valor. `false` y `0` son
 *  valores reales (no vacios), por eso se compara contra null y no truthiness. */
export function validateSingleResponseType(
  v: ResponseValues
): { ok: true } | { ok: false; error: string } {
  const present = [
    v.response_boolean !== null,
    v.response_integer !== null,
    v.response_text !== null,
    v.response_array !== null,
  ].filter(Boolean).length;

  if (present > 1) {
    return { ok: false, error: 'Solo un tipo de respuesta por pregunta' };
  }
  return { ok: true };
}

/** Una respuesta es "vacia" cuando no carga ningun valor real. Un boolean
 *  `false` ES un valor real; un texto "" no lo es. Misma regla que el server
 *  action (saveQuestionnaireResponse): una vacia nunca pisa una respuesta real. */
export function isEmptyAnswer(v: ResponseValues): boolean {
  return (
    v.response_boolean === null &&
    v.response_integer === null &&
    v.response_array === null &&
    (v.response_text ?? '').trim() === ''
  );
}
