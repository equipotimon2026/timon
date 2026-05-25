import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(req: NextRequest) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }

  const { data: users, error } = await adminSupabase
    .from('users')
    .select('id, email, first_name, last_name, age, school, created_at')
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }

  const enriched = await Promise.all(
    (users ?? []).map(async (user) => {
      const [{ data: responsesRaw }, { data: activeAssessment }] = await Promise.all([
        adminSupabase
          .from('responses')
          .select('section_id')
          .eq('user_id', user.id),
        adminSupabase
          .from('assessments')
          .select('id')
          .eq('user_id', user.id)
          .eq('is_active', true)
          .maybeSingle(),
      ]);

      const distinctSections = new Set((responsesRaw ?? []).map((r: { section_id: number }) => r.section_id));

      return {
        id: user.id,
        email: user.email,
        name: [user.first_name, user.last_name].filter(Boolean).join(' '),
        age: user.age,
        school: user.school,
        created_at: user.created_at,
        responses_count: distinctSections.size,
        has_active_assessment: activeAssessment !== null,
      };
    })
  );

  return NextResponse.json(enriched);
}
