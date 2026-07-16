import 'server-only';
import { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

/**
 * Resuelve el users.id (BIGINT) del usuario autenticado por cookie.
 * Devuelve null si no hay sesión o no hay fila en users.
 * Mismo patrón que sections-status/route.ts.
 */
export async function getAuthedUserId(req: NextRequest): Promise<number | null> {
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
  if (!user) return null;

  const { data: profile } = await supabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .single();
  return profile?.id ?? null;
}
