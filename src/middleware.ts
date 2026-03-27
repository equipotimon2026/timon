import { NextRequest, NextResponse } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import createMiddleware from 'next-intl/middleware';
import { routing } from '@/i18n/routing';

const intlMiddleware = createMiddleware(routing);

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user } = await updateSession(request);

  const { pathname } = request.nextUrl;

  // Check if it's an auth route (login, register, forgot-password)
  const isAuthRoute = /^\/(es|en)\/(login|register|forgot-password)/.test(
    pathname
  );
  const isProtectedRoute =
    /^\/(es|en)\//.test(pathname) && !isAuthRoute;

  // Redirect authenticated users away from auth pages
  if (isAuthRoute && user) {
    const locale = pathname.startsWith('/en') ? 'en' : 'es';
    return NextResponse.redirect(new URL(`/${locale}`, request.url));
  }

  // Redirect unauthenticated users to login
  if (isProtectedRoute && !user) {
    const locale = pathname.startsWith('/en') ? 'en' : 'es';
    return NextResponse.redirect(
      new URL(`/${locale}/login`, request.url)
    );
  }

  // Apply i18n middleware for locale routing
  const intlResponse = intlMiddleware(request);

  // Merge supabase cookies into the intl response
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    intlResponse.cookies.set(cookie.name, cookie.value);
  });

  return intlResponse;
}

export const config = {
  matcher: ['/((?!_next|api|.*\\..*).*)'],
};
