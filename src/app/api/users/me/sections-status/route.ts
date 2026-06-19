import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

interface QuestionSnapshot {
  question_number: number;
  question_hash: string;
  text: string;
  type: string;
  options: string[] | null;
}

interface VersionLog {
  section_id: number;
  version: number;
  questions_snapshot: QuestionSnapshot[] | null;
}

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

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const adminSupabase = createAdminClient();

  // Fetch all sections
  const { data: sections, error: sectionsError } = await adminSupabase
    .from('sections')
    .select('id, code, current_version')
    .order('order_index', { ascending: true });

  if (sectionsError || !sections) {
    return NextResponse.json({ error: 'Failed to fetch sections' }, { status: 500 });
  }

  const sectionIds = sections.map((s) => s.id);

  // Fetch all version logs for all sections
  const { data: logs, error: logsError } = await adminSupabase
    .from('section_versions_log')
    .select('section_id, version, questions_snapshot')
    .in('section_id', sectionIds)
    .order('version', { ascending: false });

  if (logsError) {
    return NextResponse.json({ error: 'Failed to fetch version logs' }, { status: 500 });
  }

  // Fetch all user responses (question_hash only) in one query
  const { data: responses, error: responsesError } = await adminSupabase
    .from('responses')
    .select('section_id, question_hash')
    .eq('user_id', profile.id)
    .not('question_hash', 'is', null);

  if (responsesError) {
    return NextResponse.json({ error: 'Failed to fetch responses' }, { status: 500 });
  }

  // Fetch which sections the user has a saved result for (the form was submitted).
  // This is the same loose signal the progress bar uses, so badge and bar agree.
  const { data: sectionResults } = await adminSupabase
    .from('section_results')
    .select('section_id')
    .eq('user_id', profile.id);

  const sectionResultIds = new Set<number>(
    (sectionResults ?? []).map((r) => r.section_id)
  );

  // Build map: section_id -> Set<question_hash> of user's responses
  const userHashesBySectionId = new Map<number, Set<string>>();
  for (const r of responses ?? []) {
    if (!userHashesBySectionId.has(r.section_id)) {
      userHashesBySectionId.set(r.section_id, new Set());
    }
    if (r.question_hash) {
      userHashesBySectionId.get(r.section_id)!.add(r.question_hash);
    }
  }

  // Build map: section_id -> VersionLog[] sorted DESC by version
  const logsBySectionId = new Map<number, VersionLog[]>();
  for (const log of logs ?? []) {
    if (!logsBySectionId.has(log.section_id)) {
      logsBySectionId.set(log.section_id, []);
    }
    logsBySectionId.get(log.section_id)!.push(log);
  }

  // Fetch active assessment to check assessment_outdated
  const { data: activeAssessment } = await adminSupabase
    .from('assessments')
    .select('id')
    .eq('user_id', profile.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  const hasActiveAssessment = !!activeAssessment;

  let anyOutdatedOrMissing = false;

  const result = sections.map((section) => {
    const userHashes = userHashesBySectionId.get(section.id) ?? new Set<string>();
    const sectionLogs = logsBySectionId.get(section.id) ?? [];

    // Current version log
    const currentLog = sectionLogs.find((l) => l.version === section.current_version);
    const currentSnapshot = currentLog?.questions_snapshot ?? [];
    const expectedCurrentHashes = new Set(currentSnapshot.map((q) => q.question_hash));

    // Check if user covers all expected current hashes
    const coversAll = (expectedHashes: Set<string>): boolean => {
      if (expectedHashes.size === 0) return false;
      for (const hash of expectedHashes) {
        if (!userHashes.has(hash)) return false;
      }
      return true;
    };

    let status: 'completed_current' | 'completed_outdated' | 'missing';
    let user_version_completed: number | null = null;

    if (coversAll(expectedCurrentHashes)) {
      status = 'completed_current';
      user_version_completed = section.current_version;
    } else {
      // Check previous versions (sorted DESC, skipping current_version)
      const previousLogs = sectionLogs.filter((l) => l.version !== section.current_version);
      let matchedVersion: number | null = null;
      for (const log of previousLogs) {
        const snapshot = log.questions_snapshot ?? [];
        const hashes = new Set(snapshot.map((q: QuestionSnapshot) => q.question_hash));
        if (coversAll(hashes)) {
          matchedVersion = log.version;
          break; // logs are DESC, take highest matching
        }
      }

      if (matchedVersion !== null) {
        status = 'completed_outdated';
        user_version_completed = matchedVersion;
      } else if (userHashes.size > 0) {
        // User has at least one response for this section but its hashes don't match
        // any known version's snapshot. Treat as outdated (responded to a version we
        // didn't capture in the log) rather than missing.
        status = 'completed_outdated';
        user_version_completed = null;
      } else if (sectionResultIds.has(section.id)) {
        // No matching question_hash (e.g. responses saved without a hash), but the
        // form WAS submitted (section_results row exists). Count it as completed so
        // the badge matches the progress bar instead of showing "Pendiente".
        status = 'completed_current';
        user_version_completed = section.current_version;
      } else {
        status = 'missing';
      }
    }

    if (status === 'completed_outdated' || status === 'missing') {
      anyOutdatedOrMissing = true;
    }

    return {
      section_id: section.id,
      code: section.code,
      current_version: section.current_version,
      user_version_completed,
      status,
    };
  });

  return NextResponse.json({
    sections: result,
    assessment_outdated: hasActiveAssessment && anyOutdatedOrMissing,
  });
}
