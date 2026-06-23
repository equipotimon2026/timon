/**
 * Recupera assessments que el agente (Azure) termino OK pero que de nuestro lado
 * quedaron 'processing' o 'cancelled' sin results.
 *
 * Causa: el unico poller que traia resultados (/api/analyze) corre desde la
 * sesion del usuario. Los generados por admin nunca se polleaban => 'processing'
 * eterno. Y 'cancel'/'pisar' marcaban 'cancelled' sin avisarle a Azure, que
 * igual terminaba.
 *
 * SEGURO: idempotente. Solo toca filas con results=null. Solo escribe si Azure
 * devuelve 'completed'. No auto-activa (respeta el gate manual del admin).
 *
 * Config por env:
 *   DRY_RUN=1            (default) no escribe, solo reporta
 *   STATUSES=processing,cancelled,failed   (default) estados a revisar
 *   ASSESSMENT_IDS=a,b   filtrar por assessment_id de Azure (opcional)
 *
 * Uso:
 *   DRY_RUN=1 node scripts/recover-stuck-assessments.mjs
 *   DRY_RUN=0 node scripts/recover-stuck-assessments.mjs
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';

const env = fs.readFileSync('.env.local', 'utf8');
const getEnv = (k) => {
  const m = env.match(new RegExp('^' + k + '=(.*)$', 'm'));
  return m ? m[1].replace(/^["']|["']$/g, '').trim() : '';
};

const supabase = createClient(getEnv('NEXT_PUBLIC_SUPABASE_URL'), getEnv('SUPABASE_SERVICE_ROLE_KEY'));
const AZURE_KEY = getEnv('AZURE_FUNCTIONS_KEY');
const AZURE_URL = 'https://timon-agents-ckfqd5evcdcqgsg9.eastus2-01.azurewebsites.net/api/assessments';

const DRY_RUN = process.env.DRY_RUN !== '0';
const STATUSES = (process.env.STATUSES ?? 'processing,cancelled,failed').split(',').map((s) => s.trim()).filter(Boolean);
const ASSESSMENT_IDS = (process.env.ASSESSMENT_IDS ?? '').split(',').map((s) => s.trim()).filter(Boolean);

async function main() {
  if (!AZURE_KEY) {
    console.error('Falta AZURE_FUNCTIONS_KEY en .env.local');
    process.exit(1);
  }
  console.log(`\n=== Recover stuck assessments  DRY_RUN=${DRY_RUN}  STATUSES=[${STATUSES}] ===`);

  let q = supabase
    .from('assessments')
    .select('id, assessment_id, status, user_id, created_at')
    .is('results', null)
    .in('status', STATUSES);
  if (ASSESSMENT_IDS.length) q = q.in('assessment_id', ASSESSMENT_IDS);
  const { data: rows, error } = await q;
  if (error) {
    console.error('Query error:', error.message);
    process.exit(1);
  }
  console.log(`Candidatos (results=null): ${rows?.length ?? 0}`);

  let recovered = 0;
  let stillProcessing = 0;
  let failedOrMissing = 0;

  for (const a of rows ?? []) {
    if (!a.assessment_id) {
      console.log(`  [skip] db=${a.id} sin assessment_id`);
      continue;
    }
    const { data: u } = await supabase.from('users').select('email').eq('id', a.user_id).maybeSingle();
    if (!u?.email) {
      console.log(`  [skip] db=${a.id} user=${a.user_id} sin email`);
      continue;
    }

    let pollResult;
    try {
      const res = await fetch(`${AZURE_URL}/${a.assessment_id}?email=${encodeURIComponent(u.email)}`, {
        headers: { 'x-functions-key': AZURE_KEY },
      });
      const body = await res.text();
      if (!res.ok) {
        console.log(`  [azure ${res.status}] db=${a.id} aid=${a.assessment_id} :: ${body.slice(0, 120)}`);
        failedOrMissing++;
        continue;
      }
      pollResult = JSON.parse(body);
    } catch (e) {
      console.log(`  [neterr] db=${a.id} aid=${a.assessment_id} :: ${e.message}`);
      failedOrMissing++;
      continue;
    }

    if (pollResult.status === 'completed') {
      console.log(`  [COMPLETED] db=${a.id} aid=${a.assessment_id} user=${a.user_id} (era ${a.status})`);
      recovered++;
      if (!DRY_RUN) {
        const { error: upErr } = await supabase
          .from('assessments')
          .update({
            status: 'completed',
            results: pollResult.results,
            completed_at: new Date().toISOString(),
            error: null,
          })
          .eq('id', a.id);
        if (upErr) console.log(`    [ERROR update] ${upErr.message}`);
      }
    } else if (pollResult.status === 'failed') {
      console.log(`  [azure-failed] db=${a.id} aid=${a.assessment_id} :: ${pollResult.error ?? ''}`);
      failedOrMissing++;
    } else {
      console.log(`  [azure-${pollResult.status ?? 'processing'}] db=${a.id} aid=${a.assessment_id} (Azure aun no termino)`);
      stillProcessing++;
    }
  }

  console.log(`\n=== ${DRY_RUN ? 'WOULD RECOVER' : 'RECOVERED'}: ${recovered} | aun-procesando: ${stillProcessing} | failed/missing: ${failedOrMissing} ===\n`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
