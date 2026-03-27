'use server';

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

  // Upsert individual responses
  const responseRows = input.responses.map((r) => ({
    user_id: userId,
    section_id: input.sectionId,
    question_number: r.questionNumber,
    question: r.question ?? null,
    response_boolean: r.responseBoolean ?? null,
    response_integer: r.responseInteger ?? null,
    response_text: r.responseText ?? null,
    response_array: r.responseArray ?? null,
  }));

  const { error: responsesError } = await supabase
    .from('responses')
    .upsert(responseRows, {
      onConflict: 'user_id,section_id,question_number',
    });

  if (responsesError) throw responsesError;

  // Upsert section result
  const { data: sectionResult, error: sectionError } = await supabase
    .from('section_results')
    .upsert(
      {
        user_id: userId,
        section_id: input.sectionId,
        score_data: input.scoreData,
        meta: input.meta ?? null,
        completed_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,section_id' }
    )
    .select()
    .single();

  if (sectionError) throw sectionError;

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
        draft_data: input.draftData,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_id,section_id' }
    );

  if (error) throw error;
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
