import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';
import { applyPollResult, pollAzure } from '@/lib/assessments/azure';
import { logAssessmentEvent } from '@/lib/assessments/log';

export const maxDuration = 60;


// Poll server-side de Azure para assessments generados por admin.
//
// Por que existe: el unico poller que traia resultados de Azure era
// `/api/analyze` (GET), y corre desde la SESION DEL USUARIO. Un assessment
// generado por admin (donde el usuario no esta polleando su pantalla) nunca
// se actualizaba: Azure terminaba pero nadie traia el resultado, y el row
// quedaba 'processing' para siempre. Esto lo resuelve: el frontend admin
// llama a este endpoint y aca SI consultamos Azure y persistimos el resultado.
//
// Las reglas de escritura viven en applyPollResult: una generacion admin
// completa guarda results/status pero NUNCA se activa ni se libera sola —
// el admin conserva su gate manual (activar / liberar).
//
// Recuperacion (allowRecovery): permitimos pollear aunque el row este
// 'cancelled'/'failed' SIEMPRE que no tenga results todavia. Asi recuperamos
// un assessment que el agente termino OK pero que de nuestro lado quedo
// cancelado (caso del "pisar" de generate o del boton Cancelar: marcamos
// cancelled sin avisarle a Azure, que igual siguio y termino).
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }

  const azureKey = process.env.AZURE_FUNCTIONS_KEY;
  if (!azureKey) {
    return NextResponse.json({ error: 'AZURE_FUNCTIONS_KEY not configured' }, { status: 500 });
  }

  const { id } = await params;
  const assessmentDbId = id;
  if (!assessmentDbId) {
    return NextResponse.json({ error: 'Invalid assessment id' }, { status: 400 });
  }

  const { data: assessment, error: fetchError } = await adminSupabase
    .from('assessments')
    .select('id, assessment_id, status, results, user_id')
    .eq('id', assessmentDbId)
    .single();

  if (fetchError || !assessment) {
    return NextResponse.json({ error: 'Assessment not found' }, { status: 404 });
  }

  // Ya tiene resultado persistido → nada que pollear.
  if (assessment.results) {
    return NextResponse.json({ status: assessment.status, alreadyHasResults: true });
  }

  if (!assessment.assessment_id) {
    return NextResponse.json({ error: 'Assessment has no assessment_id' }, { status: 400 });
  }

  // Email necesario para el poll a Azure.
  const { data: userRow } = await adminSupabase
    .from('users')
    .select('email')
    .eq('id', assessment.user_id)
    .maybeSingle();

  if (!userRow?.email) {
    return NextResponse.json({ error: 'User email not found' }, { status: 400 });
  }

  const pollStarted = Date.now();
  const pollResult = await pollAzure(assessment.assessment_id, userRow.email);

  if (pollResult.kind === 'unreachable') {
    return NextResponse.json(
      { error: 'Azure poll failed', details: pollResult.detail.slice(0, 500) },
      { status: 502 }
    );
  }

  if (pollResult.kind === 'processing') {
    // Sigue procesando del lado de Azure.
    return NextResponse.json({ status: pollResult.status });
  }

  const applied = await applyPollResult(adminSupabase, assessment.assessment_id, pollResult, {
    allowRecovery: true,
  });

  logAssessmentEvent({
    source: 'admin',
    event: 'apply',
    assessment_id: assessment.assessment_id,
    db_id: assessment.id,
    from: assessment.status,
    to: pollResult.kind,
    duration_ms: Date.now() - pollStarted,
    persistence: applied.outcome,
    detail: applied.outcome === 'applied' ? undefined : ('reason' in applied ? applied.reason : undefined),
  });

  if (applied.outcome === 'failed_to_persist') {
    return NextResponse.json(
      { error: `Failed to save results: ${applied.reason}` },
      { status: 500 }
    );
  }

  if (pollResult.kind === 'completed') {
    if (applied.outcome === 'applied') {
      // recovered=true si veniamos de un estado terminal distinto de processing.
      return NextResponse.json({
        status: 'completed',
        recovered: applied.previousStatus !== 'processing',
      });
    }
    // skipped: otro caller lo persistio primero, o el estado cambio en el
    // medio. Devolver el estado actual conocido; el proximo poll/refresh del
    // admin lee la verdad desde la DB.
    return NextResponse.json({
      status: applied.reason === 'already_terminal' ? (applied.currentStatus ?? 'completed') : 'processing',
    });
  }

  // pollResult.kind === 'failed': applyPollResult nunca pisa un cancelled
  // intencional con failed (skipped already_terminal en ese caso).
  if (applied.outcome === 'applied') {
    return NextResponse.json({ status: 'failed' });
  }
  return NextResponse.json({
    status: applied.reason === 'already_terminal' ? (applied.currentStatus ?? 'failed') : 'processing',
  });
}
