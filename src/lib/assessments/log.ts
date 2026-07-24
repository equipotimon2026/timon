// Log estructurado del flujo de assessments. Una linea JSON por evento para
// que Vercel Logs sea filtrable ("[assessments]") y parseable.
//
// PRIVACIDAD: el shape del evento admite SOLO identificadores tecnicos.
// Nunca agregar nombre, apellido, email, telefono, respuestas, payloads,
// resultados psicologicos, prompts ni secretos. user_id numerico solo cuando
// es estrictamente necesario para investigar un caso.

export interface AssessmentLogEvent {
  /** Quien origino el evento. */
  source: 'user' | 'admin' | 'cron' | 'webhook';
  /** Nombre del evento, ej: 'submit', 'poll', 'apply', 'timeout'. */
  event: string;
  /** UUID del assessment en Azure. */
  assessment_id?: string;
  /** id (PK) del row en la tabla assessments, cuando existe. */
  db_id?: number | string;
  /** users.id numerico — solo cuando hace falta de verdad. */
  user_id?: number;
  /** Estado anterior → siguiente, cuando aplica. */
  from?: string;
  to?: string;
  duration_ms?: number;
  /** Resultado de la persistencia: applied | skipped | failed_to_persist. */
  persistence?: string;
  /** Detalle tecnico corto (mensajes de error de red/DB, nunca contenido). */
  detail?: string;
}

export function logAssessmentEvent(e: AssessmentLogEvent): void {
  console.log('[assessments]', JSON.stringify(e));
}
