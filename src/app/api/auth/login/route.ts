import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: 'Email y contraseña requeridos' }, { status: 400 });
  }

  const response = NextResponse.json({ success: true });

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

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    console.error('[login] Supabase error:', error.message, error.status);

    const message =
      error.message === 'Invalid login credentials'
        ? 'Contraseña incorrecta'
        : error.message === 'Email not confirmed'
          ? 'Necesitás confirmar tu email antes de iniciar sesión. Revisá tu bandeja de entrada.'
          : error.message;

    return NextResponse.json({ error: message }, { status: 401 });
  }

  return response;
}
