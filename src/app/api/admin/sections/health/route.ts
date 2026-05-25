import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin/guard';

export async function GET(req: NextRequest) {
  let adminSupabase;
  try {
    ({ adminSupabase } = await requireAdmin(req));
  } catch (err) {
    return err as NextResponse;
  }

  // responses_without_hash: COUNT where question_hash IS NULL
  const { count: responsesWithoutHash, error: e1 } = await adminSupabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .is('question_hash', null);

  if (e1) {
    return NextResponse.json({ error: `responses_without_hash query failed: ${e1.message}` }, { status: 500 });
  }

  // responses_with_null_question: COUNT where question IS NULL
  const { count: responsesWithNullQuestion, error: e2 } = await adminSupabase
    .from('responses')
    .select('*', { count: 'exact', head: true })
    .is('question', null);

  if (e2) {
    return NextResponse.json({ error: `responses_with_null_question query failed: ${e2.message}` }, { status: 500 });
  }

  // assessments_without_section_versions: COUNT where section_versions IS NULL
  const { count: assessmentsWithoutSectionVersions, error: e3 } = await adminSupabase
    .from('assessments')
    .select('*', { count: 'exact', head: true })
    .is('section_versions', null);

  if (e3) {
    return NextResponse.json({ error: `assessments_without_section_versions query failed: ${e3.message}` }, { status: 500 });
  }

  // sections list with their versions_in_log
  const { data: sectionsData, error: e4 } = await adminSupabase
    .from('sections')
    .select('id, code, current_version')
    .order('order_index', { ascending: true });

  if (e4) {
    return NextResponse.json({ error: `sections query failed: ${e4.message}` }, { status: 500 });
  }

  // For each section, fetch versions from section_versions_log
  const sections = await Promise.all(
    (sectionsData ?? []).map(async (s) => {
      const { data: logRows, error: logErr } = await adminSupabase
        .from('section_versions_log')
        .select('version')
        .eq('section_id', s.id)
        .order('version', { ascending: true });

      if (logErr) {
        console.error(`[admin/sections/health] Failed to fetch versions for section ${s.id}: ${logErr.message}`);
      }

      const versionsInLog = (logRows ?? []).map((r) => r.version as number);

      return {
        section_id: s.id as number,
        code: s.code as string,
        current_version: s.current_version as number,
        versions_in_log: versionsInLog,
      };
    })
  );

  return NextResponse.json({
    responses_without_hash: responsesWithoutHash ?? 0,
    responses_with_null_question: responsesWithNullQuestion ?? 0,
    assessments_without_section_versions: assessmentsWithoutSectionVersions ?? 0,
    sections,
  });
}
