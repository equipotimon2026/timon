import { requireAdminPage } from '@/lib/admin/guard';
import { notFound } from 'next/navigation';
import UserDetailClient from './_components/user-detail-client';

interface Assessment {
  id: string;
  assessment_id: string;
  status: string;
  is_active: boolean;
  generated_by: string;
  created_at: string;
  completed_at: string | null;
  released_at: string | null;
  error: string | null;
}

interface Response {
  section_id: number;
  question_number: number;
  question: string | null;
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { adminSupabase } = await requireAdminPage();
  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) notFound();

  const [{ data: user, error: userError }, { data: responses }, { data: assessments }] =
    await Promise.all([
      adminSupabase
        .from('users')
        .select('id, auth_id, first_name, last_name, age, school, school_year, email, phone_number, persona, onboarding_completed, created_at')
        .eq('id', userId)
        .single(),
      adminSupabase
        .from('responses')
        .select('section_id, question_number, question, response_boolean, response_integer, response_text, response_array')
        .eq('user_id', userId)
        .order('question_number', { ascending: true }),
      adminSupabase
        .from('assessments')
        .select('id, assessment_id, status, is_active, generated_by, created_at, completed_at, released_at, error')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),
    ]);

  if (userError || !user) notFound();

  // Group responses by section_id
  const responsesBySection: Record<number, Response[]> = {};
  for (const row of responses ?? []) {
    if (!responsesBySection[row.section_id]) responsesBySection[row.section_id] = [];
    responsesBySection[row.section_id].push(row as Response);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
      </h1>
      <UserDetailClient
        user={user}
        responsesBySection={responsesBySection}
        assessments={(assessments ?? []) as Assessment[]}
        userId={userId}
      />
    </div>
  );
}
