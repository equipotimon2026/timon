import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll() {},
      },
    }
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  // Fetch all sections
  const { data: sections, error: sectionsError } = await adminSupabase
    .from('sections')
    .select('id, code, name, order_index, current_version')
    .order('order_index', { ascending: true });

  if (sectionsError || !sections) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }

  // Fetch version logs for current_version of each section
  const sectionIds = sections.map((s) => s.id);
  const { data: logs, error: logsError } = await adminSupabase
    .from('section_versions_log')
    .select('section_id, version, questions_snapshot')
    .in('section_id', sectionIds);

  if (logsError) {
    return NextResponse.json({ error: 'Failed to fetch section version logs' }, { status: 500 });
  }

  // Build a map: section_id -> questions from the log matching current_version
  const logMap = new Map<number, { question_number: number; question_hash: string; text: string; type: string; options: string[] | null }[]>();
  for (const log of logs ?? []) {
    const section = sections.find((s) => s.id === log.section_id);
    if (section && log.version === section.current_version) {
      logMap.set(log.section_id, log.questions_snapshot ?? []);
    }
  }

  const result = sections.map((s) => ({
    section_id: s.id,
    code: s.code,
    name: s.name,
    order_index: s.order_index,
    current_version: s.current_version,
    questions: (logMap.get(s.id) ?? []).map((q) => ({
      question_number: q.question_number,
      question_hash: q.question_hash,
      text: q.text,
      type: q.type as 'boolean' | 'integer' | 'text' | 'array',
      options: q.options ?? null,
    })),
  }));

  return NextResponse.json({ sections: result });
}
