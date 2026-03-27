import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
    return NextResponse.json({ error: 'Email y contrasena requeridos' }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: 'Minimo 6 caracteres' }, { status: 400 });
  }

  const supabase = createAdminClient();

  // Verify this is a legacy user
  const { data: profile } = await supabase
    .from('users')
    .select('id, auth_id')
    .eq('email', email)
    .single();

  if (!profile) {
    return NextResponse.json({ error: 'Usuario no encontrado' }, { status: 404 });
  }

  if (profile.auth_id) {
    return NextResponse.json({ error: 'Este usuario ya tiene contrasena' }, { status: 400 });
  }

  // Create auth account
  const { data: authData, error: authError } =
    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });

  if (authError) {
    return NextResponse.json({ error: authError.message }, { status: 500 });
  }

  if (authData.user) {
    // Delete the auto-created row from the trigger
    await supabase
      .from('users')
      .delete()
      .eq('auth_id', authData.user.id)
      .neq('id', profile.id);

    // Link auth account to existing profile
    await supabase
      .from('users')
      .update({ auth_id: authData.user.id })
      .eq('id', profile.id);
  }

  return NextResponse.json({ success: true });
}
