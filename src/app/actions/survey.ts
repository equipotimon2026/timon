'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

type SaveSurveyInput = {
  surveySlug?: string;
  surveyVersion?: number;
  answers: Record<string, unknown>;
  meta?: Record<string, unknown>;
};

export async function saveSurveyResponse(input: SaveSurveyInput) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!input.answers || typeof input.answers !== 'object') {
    throw new Error('Invalid answers payload');
  }

  const surveySlug = input.surveySlug ?? 'timon';
  const surveyVersion = Number.isFinite(input.surveyVersion)
    ? input.surveyVersion!
    : 1;

  const { data, error } = await supabase
    .from('survey_responses')
    .insert({
      survey_slug: surveySlug,
      survey_version: surveyVersion,
      auth_id: user.id,
      answers: input.answers,
      meta: input.meta ?? null,
    })
    .select('id, created_at')
    .single();

  if (error) throw error;
  return data;
}
