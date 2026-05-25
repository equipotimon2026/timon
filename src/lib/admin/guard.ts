import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { notFound } from 'next/navigation';
import { createAdminClient } from '@/lib/supabase/admin';

function makeServerClientFromRequest(req: NextRequest) {
  return createServerClient(
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
}

async function makeServerClientFromCookies() {
  const cookieStore = await cookies();
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll() {},
      },
    }
  );
}

async function checkAdminWhitelist(email: string): Promise<boolean> {
  const adminSupabase = createAdminClient();
  const { data } = await adminSupabase
    .from('admin_whitelist')
    .select('email')
    .eq('email', email)
    .maybeSingle();
  return data !== null;
}

/**
 * For API routes. Returns { authUser, supabase, adminSupabase } or throws NextResponse.
 * - 401 if not authenticated.
 * - 403 if authenticated but not admin.
 */
export async function requireAdmin(req: NextRequest) {
  const supabase = makeServerClientFromRequest(req);
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    throw NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const isAdmin = await checkAdminWhitelist(authUser.email);
  if (!isAdmin) {
    throw NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const adminSupabase = createAdminClient();
  return { authUser, supabase, adminSupabase };
}

/**
 * For server components / layouts. Returns { authUser, adminSupabase } or calls notFound().
 * Uses notFound() to hide the existence of admin routes from unauthorized users.
 */
export async function requireAdminPage() {
  const supabase = await makeServerClientFromCookies();
  const {
    data: { user: authUser },
  } = await supabase.auth.getUser();

  if (!authUser || !authUser.email) {
    notFound();
  }

  const isAdmin = await checkAdminWhitelist(authUser!.email!);
  if (!isAdmin) {
    notFound();
  }

  const adminSupabase = createAdminClient();
  return { authUser: authUser!, adminSupabase };
}
