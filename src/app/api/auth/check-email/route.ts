import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(req: NextRequest) {
  const { email } = await req.json();

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Email requerido' }, { status: 400 });
  }

  const supabase = createAdminClient();

  const { data: profile } = await supabase
    .from('users')
    .select('id, auth_id, first_name')
    .eq('email', email)
    .single();

  if (!profile) {
    return NextResponse.json({ exists: false, hasPassword: false });
  }

  if (profile.auth_id) {
    return NextResponse.json({
      exists: true,
      hasPassword: true,
      firstName: profile.first_name,
    });
  }

  // Legacy user: exists but no auth account
  return NextResponse.json({
    exists: true,
    hasPassword: false,
    firstName: profile.first_name,
  });
}
