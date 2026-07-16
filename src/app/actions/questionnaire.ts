'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { isSectionPaymentLocked } from '@/lib/section-gate';

type ResponseItem = {
  questionNumber: number;
  question?: string;
  responseBoolean?: boolean;
  responseInteger?: number;
  responseText?: string;
  responseArray?: string[];
};

type SaveQuestionnaireInput = {
  sectionId: number;
  responses: ResponseItem[];
  scoreData: Record<string, unknown>;
  meta?: Record<string, unknown>;
  /**
   * Whether `responses` represents the COMPLETE, authoritative state of the
   * section (i.e. the form successfully restored every prior answer before
   * submit). Only when true may we delete answers the user intentionally
   * removed. When false (restore failed / partial submit), we MERGE: upsert the
   * incoming answers and never delete prior ones — so a restore failure can
   * never silently wipe a user's answers.
   * Defaults to false (safe: never destructive) if the client omits it.
   */
  fullState?: boolean;
};

async function getUserProfileId(supabase: Awaited<ReturnType<typeof createServerSupabaseClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { data: profile, error } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (error || !profile) throw new Error('User profile not found');
  return profile.id;
}

export async function saveQuestionnaireResponse(input: SaveQuestionnaireInput) {
  const supabase = await createServerSupabaseClient();
  const userId = await getUserProfileId(supabase);

  if (!input.sectionId) {
    throw new Error('Section ID is required');
  }

  if (await isSectionPaymentLocked(userId, input.sectionId)) {
    throw new Error('Módulo bloqueado: requiere pago');
  }

  // Deduplicate responses by question_number (keep last)
  const dedupedMap = new Map<number, ResponseItem>();
  for (const r of input.responses) {
    dedupedMap.set(r.questionNumber, r);
  }
  const responseRows = Array.from(dedupedMap.values()).map((r) => ({
    user_id: userId,
    section_id: input.sectionId,
    question_number: r.questionNumber,
    question: r.question ?? null,
    response_boolean: r.responseBoolean ?? null,
    response_integer:
      typeof r.responseInteger === 'number' && Number.isFinite(r.responseInteger)
        ? Math.round(r.responseInteger)
        : null,
    response_text: r.responseText ?? null,
    response_array: r.responseArray ?? null,
  }));

  // An answer is "empty" when it carries no real value. A boolean answer of
  // `false` is a real value, so we only treat null/missing booleans as empty.
  const isEmptyAnswer = (r: (typeof responseRows)[number]) =>
    r.response_boolean === null &&
    r.response_integer === null &&
    r.response_array === null &&
    (r.response_text ?? '') === '';

  // HARDENING: never persist an empty answer. The upsert below would otherwise
  // overwrite a previously-saved good answer with "" when a restore-failed or
  // partial submit sends blanks (the root cause that wiped MIPS/Proyectivas).
  // Filtering empties out means a blank can never clobber real data; we only
  // write answers that actually carry a value.
  const nonEmptyRows = responseRows.filter((r) => !isEmptyAnswer(r));

  // MERGE semantics: always upsert the incoming (non-empty) answers, keyed on
  // (user_id, section_id, question_number). This never destroys a prior answer
  // that is also present in the payload, and — critically — never wipes the
  // whole section. A partial or restore-failed submit can no longer cause data
  // loss (the bug where reopening a section with a failed restore wiped all
  // previously saved answers).
  if (nonEmptyRows.length > 0) {
    const { error: responsesError } = await supabase
      .from('responses')
      .upsert(nonEmptyRows, { onConflict: 'user_id,section_id,question_number' });
    if (responsesError) throw responsesError;
  }

  // Intentional deletes: only when the client guarantees this payload is the
  // COMPLETE, restored state of the section. Then any saved answer that is NOT
  // in the payload was intentionally removed by the user → delete it. When
  // fullState is false we skip this entirely, so we never delete an answer the
  // user didn't explicitly remove.
  if (input.fullState === true) {
    const keptNumbers = responseRows.map((r) => r.question_number);
    let deleteQuery = supabase
      .from('responses')
      .delete()
      .eq('user_id', userId)
      .eq('section_id', input.sectionId);
    if (keptNumbers.length > 0) {
      // Delete every saved answer for this section EXCEPT the ones still present.
      deleteQuery = deleteQuery.not(
        'question_number',
        'in',
        `(${keptNumbers.join(',')})`
      );
    }
    const { error: delResponsesError } = await deleteQuery;
    if (delResponsesError) throw delResponsesError;
  }

  // Upsert section result atomically
  const sectionPayload = {
    user_id: userId,
    section_id: input.sectionId,
    score_data: input.scoreData,
    meta: input.meta ?? null,
    completed_at: new Date().toISOString(),
  };

  const { data: sectionResult, error: srError } = await supabase
    .from('section_results')
    .upsert(sectionPayload, { onConflict: 'user_id,section_id' })
    .select()
    .single();
  if (srError) throw srError;

  // Invalidate home page cache so completed sections refresh
  revalidatePath('/');
  revalidatePath('/es');
  revalidatePath('/en');

  return {
    success: true,
    sectionResult,
    responsesCount: input.responses.length,
  };
}

// ── Draft management ──

export async function saveDraft(input: { sectionId: number; draftData: unknown }) {
  const supabase = await createServerSupabaseClient();
  const userId = await getUserProfileId(supabase);

  const { error } = await supabase
    .from('response_drafts')
    .upsert(
      {
        user_id: userId,
        section_id: input.sectionId,
        draft_data: input.draftData as Record<string, unknown>,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,section_id' }
    );

  if (error) throw error;
}

export type StoredResponseRow = {
  questionNumber: number;
  question: string | null;
  responseBoolean: boolean | null;
  responseInteger: number | null;
  responseText: string | null;
  responseArray: string[] | null;
};

/**
 * Canonical saved responses for a section (from the `responses` table).
 * Used to restore a completed form when the working draft is stale or absent.
 */
export async function getResponses(sectionId: number): Promise<StoredResponseRow[]> {
  const supabase = await createServerSupabaseClient();
  const userId = await getUserProfileId(supabase);

  const { data, error } = await supabase
    .from('responses')
    .select('question_number, question, response_boolean, response_integer, response_text, response_array')
    .eq('user_id', userId)
    .eq('section_id', sectionId)
    .order('question_number', { ascending: true });

  if (error || !data) return [];
  return data.map((r) => ({
    questionNumber: r.question_number,
    question: r.question ?? null,
    responseBoolean: r.response_boolean ?? null,
    responseInteger: r.response_integer ?? null,
    responseText: r.response_text ?? null,
    responseArray: (r.response_array as string[] | null) ?? null,
  }));
}

export async function getDraft(sectionId: number): Promise<unknown | null> {
  const supabase = await createServerSupabaseClient();
  const userId = await getUserProfileId(supabase);

  const { data, error } = await supabase
    .from('response_drafts')
    .select('draft_data')
    .eq('user_id', userId)
    .eq('section_id', sectionId)
    .single();

  if (error || !data) return null;
  return data.draft_data;
}

export async function deleteDraft(sectionId: number) {
  const supabase = await createServerSupabaseClient();
  const userId = await getUserProfileId(supabase);

  await supabase
    .from('response_drafts')
    .delete()
    .eq('user_id', userId)
    .eq('section_id', sectionId);
}
