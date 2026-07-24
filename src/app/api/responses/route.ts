import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';
import { isSectionPaymentLocked } from '@/lib/section-gate';
import {
  isEmptyAnswer,
  normalizeResponseValues,
  questionHash,
  validateSingleResponseType,
} from '@/lib/responses/logic';

// Guardado individual de una respuesta. Identidad canonica y upsert atomico
// sobre el UNIQUE real (user_id, section_id, question_number) — igual que el
// server action saveQuestionnaireResponse. Nada de SELECT→INSERT manual:
// dos requests concurrentes ya no pueden chocar con 23505.
export async function POST(req: NextRequest) {
  // Auth check
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Resolve users.id (BIGINT) from auth.uid()
  const adminSupabase = createAdminClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { section_id, question_number, question, question_hash: clientHash } = body;

  if (!section_id || question_number == null || !question) {
    return NextResponse.json(
      { error: 'section_id, question_number, and question are required' },
      { status: 400 }
    );
  }

  if (await isSectionPaymentLocked(profile.id, section_id)) {
    return NextResponse.json({ error: 'Módulo bloqueado: requiere pago' }, { status: 402 });
  }

  const values = normalizeResponseValues(body);

  const typeCheck = validateSingleResponseType(values);
  if (!typeCheck.ok) {
    return NextResponse.json({ error: typeCheck.error }, { status: 400 });
  }

  // Backend wins: always calculate hash, warn if client sent a different value
  const hash = questionHash(question);
  if (clientHash && clientHash !== hash) {
    console.warn(
      '[POST /api/responses] question_hash mismatch — client sent %s, computed %s. Using computed.',
      clientHash,
      hash
    );
  }

  // Una respuesta vacia nunca pisa una respuesta real ya guardada.
  if (isEmptyAnswer(values)) {
    return NextResponse.json({ saved: false, reason: 'empty_answer', question_hash: hash });
  }

  const { error: upsertError } = await adminSupabase
    .from('responses')
    .upsert(
      {
        user_id: profile.id,
        section_id,
        question_number,
        question,
        question_hash: hash,
        ...values,
        answered_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,section_id,question_number' }
    );

  if (upsertError) {
    console.error('[POST /api/responses] UPSERT error:', upsertError.message);
    return NextResponse.json({ error: 'Failed to save response' }, { status: 500 });
  }

  return NextResponse.json({ saved: true, question_hash: hash });
}
