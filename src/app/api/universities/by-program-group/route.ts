import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { getUniversitiesByProgramGroup } from '@/lib/cosmos/universities';

// @azure/cosmos requiere runtime Node.js (no edge).
export const runtime = 'nodejs';

/**
 * GET /api/universities/by-program-group?group=<programSearchGroup>
 *
 * Devuelve las universidades que dictan la carrera del grupo dado, para los
 * "bubbles" del detalle de carrera (PDF 3.c). Lee del catálogo Cosmos.
 */
export async function GET(req: NextRequest) {
  // Auth: mismo patrón que el resto de las rutas (cookie de sesión Supabase).
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll() {},
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const group = req.nextUrl.searchParams.get('group')?.trim();
  if (!group) {
    return NextResponse.json(
      { error: 'Missing "group" query param' },
      { status: 400 }
    );
  }

  try {
    const universities = await getUniversitiesByProgramGroup(group);
    return NextResponse.json({ group, universities });
  } catch (err) {
    console.error('[universities/by-program-group] Cosmos query failed:', err);
    return NextResponse.json({ error: 'Catalog query failed' }, { status: 500 });
  }
}
