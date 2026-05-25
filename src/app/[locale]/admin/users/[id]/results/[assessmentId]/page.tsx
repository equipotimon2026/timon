import { requireAdminPage } from '@/lib/admin/guard';
import { notFound } from 'next/navigation';
import { AdminResultsView } from './_components/admin-results-view';

interface PageProps {
  params: Promise<{ id: string; assessmentId: string }>;
}

export default async function AdminAssessmentResultsPage({ params }: PageProps) {
  const { adminSupabase } = await requireAdminPage();
  const { id: userId, assessmentId } = await params;

  const { data: assessment, error } = await adminSupabase
    .from('assessments')
    .select('id, assessment_id, user_id, status, results, is_active')
    .eq('id', assessmentId)
    .eq('user_id', userId)
    .maybeSingle();

  if (error || !assessment) {
    notFound();
  }

  if (assessment.status !== 'completed' || !assessment.results) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-muted-foreground">Assessment no completado</p>
      </div>
    );
  }

  // Fetch user name for PDF filename
  const { data: profile } = await adminSupabase
    .from('profiles')
    .select('name')
    .eq('user_id', userId)
    .maybeSingle();

  const userName = profile?.name ?? userId;

  return (
    <AdminResultsView
      assessmentId={String(assessment.id)}
      userId={userId}
      results={assessment.results}
      userName={userName}
    />
  );
}
