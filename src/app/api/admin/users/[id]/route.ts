import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }

  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) {
    return NextResponse.json({ error: 'Invalid user id' }, { status: 400 });
  }

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

  if (userError || !user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Group responses by section
  type ResponseRow = NonNullable<typeof responses>[number];
  const responsesBySection: Record<number, ResponseRow[]> = {};
  for (const row of responses ?? []) {
    if (!responsesBySection[row.section_id]) responsesBySection[row.section_id] = [];
    responsesBySection[row.section_id].push(row);
  }

  return NextResponse.json({
    profile: user,
    responses_by_section: responsesBySection,
    assessments: assessments ?? [],
  });
}
