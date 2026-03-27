'use server';

import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function updateProfile(input: {
  firstName?: string;
  lastName?: string;
  age: number;
  school: string;
  schoolYear: string;
  email?: string;
  phoneNumber: string;
}) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const updateData: Record<string, unknown> = {
    age: input.age,
    school: input.school,
    school_year: input.schoolYear,
    phone_number: input.phoneNumber,
    onboarding_completed: true,
    updated_at: new Date().toISOString(),
  };

  // Only update name/email if provided (they come from registration now)
  if (input.firstName) updateData.first_name = input.firstName;
  if (input.lastName) updateData.last_name = input.lastName;
  if (input.email) updateData.email = input.email;

  const { data, error } = await supabase
    .from('users')
    .update(updateData)
    .eq('auth_id', user.id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updatePersona(persona: string) {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error('Not authenticated');

  const { error } = await supabase
    .from('users')
    .update({ persona, updated_at: new Date().toISOString() })
    .eq('auth_id', user.id);

  if (error) throw error;
}
