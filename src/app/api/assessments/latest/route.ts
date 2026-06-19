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
    return NextResponse.json({ assessment: null });
  }

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();

  if (!profile) {
    return NextResponse.json({ assessment: null });
  }

  const adminSupabase = createAdminClient();
  const { data: assessment } = await adminSupabase
    .from('assessments')
    .select('assessment_id, status, results, section_versions, created_at, completed_at, released_at, is_active')
    .eq('user_id', profile.id)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!assessment) {
    return NextResponse.json({ assessment: null });
  }

  // Gate manual de visibilidad: el usuario solo recibe results si el admin
  // libero el resultado (released_at seteado). Mientras tanto ocultamos results
  // para que el front muestre la pantalla "12hs".
  const isReleased = !!assessment.released_at;
  if (!isReleased) {
    assessment.results = null;
  }

  // Compute is_outdated
  let is_outdated = false;
  const sectionVersionsSnapshot = assessment.section_versions as Record<string, number> | null;

  if (!sectionVersionsSnapshot) {
    // No version info — conservative: treat as outdated
    is_outdated = true;
  } else {
    const { data: currentSections } = await adminSupabase
      .from('sections')
      .select('id, current_version');

    if (currentSections) {
      for (const section of currentSections) {
        const snapshotVersion = sectionVersionsSnapshot[String(section.id)];
        if (snapshotVersion !== undefined && section.current_version > snapshotVersion) {
          is_outdated = true;
          break;
        }
      }
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { section_versions: _sv, ...assessmentWithoutSnapshot } = assessment;

  return NextResponse.json({ assessment: { ...assessmentWithoutSnapshot, is_outdated } });
}
