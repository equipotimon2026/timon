import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

export const maxDuration = 60;

const AZURE_BASE_URL =
  'https://timon-agents-ckfqd5evcdcqgsg9.eastus2-01.azurewebsites.net';
const AZURE_ASSESSMENTS_URL = `${AZURE_BASE_URL}/api/assessments`;

// Poll server-side de Azure para assessments generados por admin.
//
// Por que existe: el unico poller que traia resultados de Azure era
// `/api/analyze` (GET), y corre desde la SESION DEL USUARIO. Un assessment
// generado por admin (donde el usuario no esta polleando su pantalla) nunca
// se actualizaba: Azure terminaba pero nadie traia el resultado, y el row
// quedaba 'processing' para siempre. Esto lo resuelve: el frontend admin
// llama a este endpoint y aca SI consultamos Azure y persistimos el resultado.
//
// A diferencia de analyze: NO auto-activamos (is_active). El admin tiene su
// propio gate manual (activar / liberar), asi que solo escribimos status +
// results. Tampoco aplicamos timeout aca (el admin decide cancelar a mano).
//
// Recuperacion: permitimos pollear aunque el row este 'cancelled'/'failed'
// SIEMPRE que no tenga results todavia. Asi recuperamos un assessment que el
// agente termino OK pero que de nuestro lado quedo cancelado (caso del "pisar"
// de generate o del boton Cancelar: marcamos cancelled sin avisarle a Azure,
// que igual siguio y termino).
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

  try {
    const pollUrl = `${AZURE_ASSESSMENTS_URL}/${assessment.assessment_id}?email=${encodeURIComponent(userRow.email)}`;
    const pollResponse = await fetch(pollUrl, {
      headers: { 'x-functions-key': azureKey },
    });
    const pollBody = await pollResponse.text();

    if (!pollResponse.ok) {
      return NextResponse.json(
        { error: `Azure poll error: ${pollResponse.status}`, details: pollBody.slice(0, 500) },
        { status: 502 }
      );
    }

    const pollResult = JSON.parse(pollBody);

    if (pollResult.status === 'completed') {
      const { error: saveError } = await adminSupabase
        .from('assessments')
        .update({
          status: 'completed',
          results: pollResult.results,
          completed_at: new Date().toISOString(),
          error: null,
        })
        .eq('id', assessment.id);

      if (saveError) {
        return NextResponse.json(
          { error: `Failed to save results: ${saveError.message}` },
          { status: 500 }
        );
      }
      // recovered=true si veniamos de un estado terminal distinto de processing.
      const recovered = assessment.status !== 'processing';
      return NextResponse.json({ status: 'completed', recovered });
    }

    if (pollResult.status === 'failed') {
      await adminSupabase
        .from('assessments')
        .update({
          status: 'failed',
          error: pollResult.error ?? 'Unknown error',
          completed_at: new Date().toISOString(),
        })
        .eq('id', assessment.id)
        .eq('status', 'processing'); // no pisar un cancelled intencional con failed
      return NextResponse.json({ status: 'failed' });
    }

    // Sigue procesando del lado de Azure.
    return NextResponse.json({ status: pollResult.status ?? 'processing' });
  } catch (err) {
    return NextResponse.json(
      { error: 'Failed to reach Azure endpoint', details: String(err) },
      { status: 502 }
    );
  }
}
