'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function getCompletedAssessments(): Promise<number[]> {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  // Get user profile id
  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) return [];

  const { data: results, error } = await supabase
    .from('section_results')
    .select('section_id')
    .eq('user_id', profile.id);

  if (error) {
    console.error('Error fetching completed assessments:', error);
    return [];
  }

  return results.map((r) => r.section_id);
}

export async function getProfile() {
  const supabase = await createServerSupabaseClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: profile, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error) {
    console.error('Error fetching profile:', error);
    return null;
  }

  return profile;
}
