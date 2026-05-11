import { createServerSupabaseClient } from '@/lib/supabase/server';
import { AssessmentWrapper } from '@/components/assessment-wrapper';
import { redirect } from 'next/navigation';
import { SECTION_IDS } from '@/lib/constants';

const PROFESIONALES_SECTION_ID = SECTION_IDS.PROFESIONALES;

export default async function AssessmentPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
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

  // FEAT-03: Block re-entry to profesionales if already completed
  if (id === 'profesionales') {
    const { data: existing } = await supabase
      .from('section_results')
      .select('completed_at')
      .eq('user_id', profile.id)
      .eq('section_id', PROFESIONALES_SECTION_ID)
      .single();

    if (existing?.completed_at) {
      return (
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-6">
          <span className="text-[48px] mb-4">✅</span>
          <h2 className="text-xl font-bold mb-2">Ya completaste este módulo</h2>
          <p className="text-sm text-muted-foreground max-w-sm">
            Ya registramos tu sesión con los profesionales. No es posible volver a completarla.
          </p>
        </div>
      );
    }
  }

  return <AssessmentWrapper assessmentId={id} userId={profile.id} />;
}
