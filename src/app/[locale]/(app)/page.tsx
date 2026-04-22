import { createServerSupabaseClient } from '@/lib/supabase/server';
import { HomeContent } from '@/components/home-content';
import { redirect } from 'next/navigation';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/es/login');

  const { data: profile } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single() as { data: any };

  if (!profile) return redirect('/es/login');

  return <HomeContent initialProfile={profile} />;
}
