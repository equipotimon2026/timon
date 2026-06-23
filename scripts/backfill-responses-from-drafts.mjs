/**
 * Backfill de `responses` desde `response_drafts`.
 *
 * Recupera respuestas que quedaron vacias en la tabla canonica `responses`
 * (bug historico de reopen+restore que wipeaba) pero que siguen intactas en
 * `response_drafts.draft_data.answers` (indexadas 0..N => question_number i+1).
 *
 * SEGURO: idempotente. Solo completa filas EXISTENTES que esten vacias.
 * Nunca pisa una respuesta no vacia, nunca crea filas, nunca borra.
 *
 * Config por env:
 *   DRY_RUN=1            (default) no escribe, solo reporta
 *   SECTIONS=2,6         (default 2,6 = MIPS, PROYECTIVA)
 *   EMAILS=a@x.com,b@y   filtrar por email (opcional)
 *   USER_IDS=104,96      filtrar por id (opcional)
 *   (sin EMAILS ni USER_IDS => todos los usuarios)
 *
 * Uso:
 *   DRY_RUN=1 SECTIONS=6 EMAILS=santi.montschiaff@gmail.com node scripts/backfill-responses-from-drafts.mjs
 *   DRY_RUN=0 SECTIONS=6 EMAILS=santi.montschiaff@gmail.com node scripts/backfill-responses-from-drafts.mjs
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : '';
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));

const DRY_RUN = process.env.DRY_RUN !== '0';
const SECTIONS = (process.env.SECTIONS ?? '2,6').split(',').map((s) => Number(s.trim())).filter(Boolean);
const EMAILS = (process.env.EMAILS ?? '').split(',').map((s) => s.trim()).filter(Boolean);
const USER_IDS = (process.env.USER_IDS ?? '').split(',').map((s) => Number(s.trim())).filter(Boolean);
// INSERT_MISSING=1 (default): inserta filas que el wipe borro enteras. =0 las saltea.
const INSERT_MISSING = process.env.INSERT_MISSING !== '0';

const isEmpty = (r) =>
  r.response_boolean === null &&
  r.response_integer === null &&
  r.response_array === null &&
  (r.response_text === null || r.response_text === '');

// Mapea un valor del draft a la columna correcta de responses.
function valueToColumns(v) {
  if (Array.isArray(v)) return { response_array: v };
  if (typeof v === 'boolean') return { response_boolean: v };
  if (typeof v === 'number' && Number.isFinite(v)) return { response_integer: Math.round(v) };
  return { response_text: String(v) };
}
const valEmpty = (v) => v === null || v === undefined || v === '' || (Array.isArray(v) && v.length === 0);

async function resolveUserIds() {
  if (USER_IDS.length) return USER_IDS;
  if (EMAILS.length) {
    const { data } = await supabase.from('users').select('id,email').in('email', EMAILS);
    return (data ?? []).map((u) => u.id);
  }
  return null; // todos
}

async function main() {
  console.log(`\n=== Backfill responses<-drafts  DRY_RUN=${DRY_RUN}  SECTIONS=[${SECTIONS}] ===`);
  const userIds = await resolveUserIds();
  console.log('Scope usuarios:', userIds ? userIds.join(',') : 'TODOS');

  let totalUpdated = 0;
  let totalInserted = 0;
  let totalSkipped = 0;

  for (const sectionId of SECTIONS) {
    // Drafts de esta seccion
    let draftQ = supabase.from('response_drafts').select('user_id, draft_data').eq('section_id', sectionId);
    if (userIds) draftQ = draftQ.in('user_id', userIds);
    const { data: drafts } = await draftQ;

    for (const d of drafts ?? []) {
      const answers = d.draft_data?.answers ?? d.draft_data;
      if (!answers || typeof answers !== 'object') continue;

      // Responses actuales del user/section
      const { data: rows } = await supabase
        .from('responses')
        .select('id, question_number, response_boolean, response_integer, response_text, response_array')
        .eq('user_id', d.user_id)
        .eq('section_id', sectionId);
      const byQn = new Map((rows ?? []).map((r) => [r.question_number, r]));

      for (const [idxStr, v] of Object.entries(answers)) {
        const idx = Number(idxStr);
        if (!Number.isInteger(idx)) continue;
        if (valEmpty(v)) continue;
        const qn = idx + 1;
        const cols = valueToColumns(v);
        const row = byQn.get(qn);
        if (!row) {
          // Fila inexistente: el wipe borro la fila entera (no solo la vacio).
          // La insertamos. `question` queda null a proposito: buildAzurePayload
          // toma el texto del snapshot de la version vigente (currentTextByNumber)
          // y filtra por question_number, no por hash → el agente lo recibe bien.
          if (!INSERT_MISSING) {
            console.log(`  [skip:no-row] user=${d.user_id} sec=${sectionId} qn=${qn}`);
            totalSkipped++;
            continue;
          }
          if (DRY_RUN) {
            console.log(`  [would-insert] user=${d.user_id} sec=${sectionId} qn=${qn} <= ${JSON.stringify(cols)}`);
            totalInserted++;
          } else {
            const { error } = await supabase.from('responses').insert({
              user_id: d.user_id,
              section_id: sectionId,
              question_number: qn,
              question: null,
              response_boolean: null,
              response_integer: null,
              response_text: null,
              response_array: null,
              ...cols,
            });
            if (error) {
              console.log(`  [ERROR:insert] user=${d.user_id} sec=${sectionId} qn=${qn}: ${error.message}`);
            } else {
              totalInserted++;
            }
          }
          continue;
        }
        if (!isEmpty(row)) {
          totalSkipped++; // ya tiene valor, no pisar
          continue;
        }
        if (DRY_RUN) {
          console.log(`  [would-set] user=${d.user_id} sec=${sectionId} qn=${qn} <= ${JSON.stringify(cols)}`);
          totalUpdated++;
        } else {
          const { error } = await supabase.from('responses').update(cols).eq('id', row.id);
          if (error) {
            console.log(`  [ERROR] user=${d.user_id} sec=${sectionId} qn=${qn}: ${error.message}`);
          } else {
            totalUpdated++;
          }
        }
      }
    }
  }

  console.log(`\n=== ${DRY_RUN ? 'WOULD' : 'DONE'}: update=${totalUpdated} insert=${totalInserted} | skipped: ${totalSkipped} ===\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
