import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUserId } from '@/lib/api-auth';
import { createAdminClient } from '@/lib/supabase/admin';
import { groupSizeOfCode } from '@/lib/payment-access';

export async function POST(req: NextRequest) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const code = typeof body.code === 'string' ? body.code.trim().toUpperCase() : '';
  if (!code) return NextResponse.json({ error: 'Código requerido' }, { status: 400 });

  const admin = createAdminClient();

  // ¿Ya usó un código? (inmutable)
  const { data: existing } = await admin
    .from('referral_uses')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle();
  if (existing) {
    return NextResponse.json({ error: 'Ya usaste un código' }, { status: 409 });
  }

  // ¿Existe el código?
  const { data: owner } = await admin
    .from('users')
    .select('id')
    .eq('referral_code', code)
    .maybeSingle();
  if (!owner) return NextResponse.json({ error: 'Código inexistente' }, { status: 404 });
  if (owner.id === userId) {
    return NextResponse.json({ error: 'No podés usar tu propio código' }, { status: 422 });
  }

  const { error } = await admin
    .from('referral_uses')
    .insert({ user_id: userId, code, owner_user_id: owner.id });
  if (error) {
    if (error.code === '23505') {
      // UNIQUE(user_id) — carrera con otro request del mismo usuario
      return NextResponse.json({ error: 'Ya usaste un código' }, { status: 409 });
    }
    console.error('[referrals/use] insert:', error);
    return NextResponse.json({ error: 'Error interno' }, { status: 500 });
  }

  const groupSize = await groupSizeOfCode(code);

  return NextResponse.json({ groupSize });
}
