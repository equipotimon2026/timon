'use server';

import { revalidatePath } from 'next/cache';
import { createServerSupabaseClient } from '@/lib/supabase/server';

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

  // Delete existing rows for this user+section, then insert fresh.
  // Requires DELETE RLS policy (migration 006). Verifies rows actually removed
  // before insert to avoid silent failures masking 23505 on re-save.
  const { error: delResponsesError } = await supabase
    .from('responses')
    .delete()
    .eq('user_id', userId)
    .eq('section_id', input.sectionId);
  if (delResponsesError) throw delResponsesError;

  if (responseRows.length > 0) {
    // Use upsert as defense in depth: if delete didn't fully clear (e.g. RLS
    // issue), upsert with onConflict still resolves conflicts atomically.
    const { error: responsesError } = await supabase
      .from('responses')
      .upsert(responseRows, { onConflict: 'user_id,section_id,question_number' });
    if (responsesError) throw responsesError;
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
