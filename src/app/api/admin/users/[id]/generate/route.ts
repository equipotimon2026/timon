import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';
import { submitToAzure } from '@/lib/assessments/azure';
import { buildAzurePayload } from '@/lib/admin/build-azure-payload';
import { logAssessmentEvent } from '@/lib/assessments/log';

export const maxDuration = 60;

// Ventana del guard anti doble-click: si ya hay una generacion arrancada hace
// menos de esto, un segundo POST casi seguro es un click repetido y no un
// "pisar" intencional del admin.
const DOUBLE_CLICK_WINDOW_MS = 10_000;

// Genera un assessment desde admin. Orden a proposito:
//   validar → payload → Azure → INSERT → recien ahi cancelar los anteriores.
// Los assessments previos en 'processing' solo se cancelan DESPUES de tener el
// nuevo insertado: si el payload o Azure fallan, el proceso anterior sigue
// intacto (antes se cancelaba primero y un fallo posterior lo dejaba huerfano).
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
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

  // Guard anti doble-click: una generacion arrancada hace segundos no se pisa.
  // Pasada la ventana, el admin SI puede pisar un processing colgado (el
  // reemplazo se hace despues del insert del nuevo).
  const { data: recentProcessing } = await adminSupabase
    .from('assessments')
    .select('id, created_at')
    .eq('user_id', userId)
    .eq('status', 'processing')
    .gte('created_at', new Date(Date.now() - DOUBLE_CLICK_WINDOW_MS).toISOString())
    .limit(1)
    .maybeSingle();

  if (recentProcessing) {
    return NextResponse.json(
      { error: 'Ya hay una generación arrancando para este usuario. Esperá unos segundos.' },
      { status: 409 }
    );
  }

  // buildAzurePayload valida que el usuario exista (tira si no).
  let payload;
  let sectionVersions: Record<string, number> = {};
  try {
    ({ payload, sectionVersions } = await buildAzurePayload(adminSupabase, userId));
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }

  const submitStarted = Date.now();
  const submit = await submitToAzure(payload);

  if (submit.kind !== 'submitted') {
    // Azure fallo o devolvio algo invalido: no se toco nada en la DB — el
    // processing anterior (si existia) sigue vivo.
    logAssessmentEvent({
      source: 'admin',
      event: 'generate_rejected',
      user_id: userId,
      duration_ms: Date.now() - submitStarted,
      detail: submit.detail,
    });
    return NextResponse.json(
      { error: 'Azure submit failed', details: submit.detail },
      { status: 502 }
    );
  }

  logAssessmentEvent({
    source: 'admin',
    event: 'generate_submit',
    assessment_id: submit.assessmentId,
    user_id: userId,
    to: 'processing',
    duration_ms: Date.now() - submitStarted,
  });

  // Insert row with generated_by='admin' and is_active=false
  const { data: inserted, error: insertError } = await adminSupabase
    .from('assessments')
    .insert({
      user_id: userId,
      assessment_id: submit.assessmentId,
      status: 'processing',
      generated_by: 'admin',
      is_active: false,
      section_versions: sectionVersions,
    })
    .select('id')
    .single();

  if (insertError || !inserted) {
    // Sin row no hay como trackear el trabajo: no responder exito y NO
    // cancelar el proceso anterior. Solo identificadores tecnicos en el log.
    logAssessmentEvent({
      source: 'admin',
      event: 'insert_failed',
      assessment_id: submit.assessmentId,
      user_id: userId,
      persistence: 'failed_to_persist',
      detail: insertError?.message ?? 'insert returned no row',
    });
    return NextResponse.json(
      { error: 'Failed to persist assessment' },
      { status: 500 }
    );
  }

  // Recien ahora, con el nuevo confirmado, "pisamos" los processing anteriores
  // (excluyendo el recien insertado) para que se deje de pollear esos ids.
  const { error: cancelError } = await adminSupabase
    .from('assessments')
    .update({
      status: 'cancelled',
      error: 'Reemplazado por una nueva generacion.',
      completed_at: new Date().toISOString(),
    })
    .eq('user_id', userId)
    .eq('status', 'processing')
    .neq('id', inserted.id);

  if (cancelError) {
    // El nuevo assessment ya existe y es trackeable; que un viejo quede en
    // processing es benigno (el cron/poll lo resuelve). Solo lo registramos.
    logAssessmentEvent({
      source: 'admin',
      event: 'cancel_previous_failed',
      assessment_id: submit.assessmentId,
      db_id: inserted.id,
      user_id: userId,
      detail: cancelError.message,
    });
  }

  return NextResponse.json({
    assessment_id: submit.assessmentId,
    status: 'pending',
  });
}
