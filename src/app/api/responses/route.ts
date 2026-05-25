import { createHash } from 'node:crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { createAdminClient } from '@/lib/supabase/admin';

function questionHash(text: string): string {
  return createHash('sha256').update(text.toLowerCase().trim()).digest('hex');
}

export async function POST(req: NextRequest) {
  // Auth check
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
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Resolve users.id (BIGINT) from auth.uid()
  const adminSupabase = createAdminClient();
  const { data: profile, error: profileError } = await adminSupabase
    .from('users')
    .select('id')
    .eq('auth_id', user.id)
    .maybeSingle();

  if (profileError || !profile) {
    return NextResponse.json({ error: 'User profile not found' }, { status: 404 });
  }

  const body = await req.json();
  const {
    section_id,
    question_number,
    question,
    question_hash: clientHash,
    response_boolean,
    response_integer,
    response_text,
    response_array,
  } = body;

  if (!section_id || question_number == null || !question) {
    return NextResponse.json(
      { error: 'section_id, question_number, and question are required' },
      { status: 400 }
    );
  }

  // Backend wins: always calculate hash, warn if client sent a different value
  const computedHash = questionHash(question);
  if (clientHash && clientHash !== computedHash) {
    console.warn(
      '[POST /api/responses] question_hash mismatch — client sent %s, computed %s. Using computed.',
      clientHash,
      computedHash
    );
  }
  const hash = computedHash;

  // SELECT by (user_id, section_id, question_hash) — upsert manually since no unique constraint
  const { data: existing, error: selectError } = await adminSupabase
    .from('responses')
    .select('id')
    .eq('user_id', profile.id)
    .eq('section_id', section_id)
    .eq('question_hash', hash)
    .maybeSingle();

  if (selectError) {
    console.error('[POST /api/responses] SELECT error:', selectError.message);
    return NextResponse.json({ error: 'Database error' }, { status: 500 });
  }

  const responseData = {
    user_id: profile.id,
    section_id,
    question_number,
    question,
    question_hash: hash,
    response_boolean: response_boolean ?? null,
    response_integer: response_integer ?? null,
    response_text: response_text ?? null,
    response_array: response_array ?? null,
    answered_at: new Date().toISOString(),
  };

  if (existing) {
    // UPDATE existing row
    const { error: updateError } = await adminSupabase
      .from('responses')
      .update(responseData)
      .eq('id', existing.id);

    if (updateError) {
      console.error('[POST /api/responses] UPDATE error:', updateError.message);
      return NextResponse.json({ error: 'Failed to update response' }, { status: 500 });
    }
  } else {
    // INSERT new row
    const { error: insertError } = await adminSupabase
      .from('responses')
      .insert(responseData);

    if (insertError) {
      console.error('[POST /api/responses] INSERT error:', insertError.message);
      return NextResponse.json({ error: 'Failed to insert response' }, { status: 500 });
    }
  }

  return NextResponse.json({ saved: true, question_hash: hash });
}
