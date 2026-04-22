import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  // Extract locale from path: /es/auth/callback or /en/auth/callback
  const locale = req.nextUrl.pathname.startsWith('/en') ? 'en' : 'es';
  const redirectUrl = new URL(`/${locale}${next}`, req.url);

  if (code) {
    const response = NextResponse.redirect(redirectUrl);

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return req.cookies.getAll();
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            );
          },
        },
      }
    );

    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (error) {
      console.error('[auth/callback] Error exchanging code:', error.message);
      // Redirect to login on error
      return NextResponse.redirect(new URL(`/${locale}/login`, req.url));
    }

    return response;
  }

  // No code provided, redirect to the default path
  return NextResponse.redirect(redirectUrl);
}
