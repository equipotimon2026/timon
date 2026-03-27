import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AssessmentWrapper } from '@/components/assessment-wrapper';
import { redirect } from 'next/navigation';

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect('/es/login');

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single<{ id: number }>();

  if (!profile) return redirect('/es/login');

  return <AssessmentWrapper assessmentId={id} userId={profile.id} />;
}
