'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

type SaveFeedbackInput = {
  sectionId: number;
  feedback: string;
};

export async function saveFeedback(input: SaveFeedbackInput) {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  if (!input.sectionId || !input.feedback?.trim()) {
    throw new Error('Section ID and feedback are required');
  }

  // Get user profile id
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (profileError || !profile) throw new Error('User profile not found');

  const { data, error } = await supabase
    .from('feedback')
    .insert({
      user_id: profile.id,
      section_id: input.sectionId,
      feedback: input.feedback.trim(),
      created_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}
