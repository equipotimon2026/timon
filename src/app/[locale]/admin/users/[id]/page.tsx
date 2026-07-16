import { requireAdminPage } from '@/lib/admin/guard';
import { notFound } from 'next/navigation';
import UserDetailClient from './_components/user-detail-client';

interface Assessment {
  id: string;
  assessment_id: string;
  status: string;
  is_active: boolean;
  generated_by: string;
  created_at: string;
  completed_at: string | null;
  released_at: string | null;
  error: string | null;
}

interface Response {
  section_id: number;
  question_number: number;
  question: string | null;
  response_boolean: boolean | null;
  response_integer: number | null;
  response_text: string | null;
  response_array: unknown | null;
}

interface Payment {
  id: number;
  base_amount: number;
  amount: number;
  discount_pct: number;
  referral_code: string | null;
  currency: string;
  status: string;
  created_at: string;
  updated_at: string;
  talo_payment_id: string | null;
  expires_at: string | null;
}

interface ReferralUser {
  user_id: number;
  code: string;
  created_at: string;
  name: string | null;
  email: string | null;
}

interface UsedReferral {
  code: string;
  owner_user_id: number;
  created_at: string;
  ownerName: string | null;
  ownerEmail: string | null;
}

export default async function UserDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { adminSupabase } = await requireAdminPage();
  const { id } = await params;
  const userId = Number(id);

  if (isNaN(userId)) notFound();

  const [
    { data: user, error: userError },
    { data: responses },
    { data: assessments },
    { data: payments, error: paymentsError },
    { data: referralUsesRaw, error: referralUsesError },
    { data: ownUseRaw, error: ownUseError },
  ] = await Promise.all([
    adminSupabase
      .from('users')
      .select('id, auth_id, first_name, last_name, age, school, school_year, email, phone_number, persona, onboarding_completed, created_at, payment_exempt, referral_code')
      .eq('id', userId)
      .single(),
    adminSupabase
      .from('responses')
      .select('section_id, question_number, question, response_boolean, response_integer, response_text, response_array')
      .eq('user_id', userId)
      .order('question_number', { ascending: true }),
    adminSupabase
      .from('assessments')
      .select('id, assessment_id, status, is_active, generated_by, created_at, completed_at, released_at, error')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('payments')
      .select('id, base_amount, amount, discount_pct, referral_code, currency, status, created_at, updated_at, talo_payment_id, expires_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false }),
    adminSupabase
      .from('referral_uses')
      .select('user_id, code, created_at')
      .eq('owner_user_id', userId),
    adminSupabase
      .from('referral_uses')
      .select('code, owner_user_id, created_at')
      .eq('user_id', userId)
      .maybeSingle(),
  ]);

  if (userError || !user) notFound();
  if (paymentsError) console.error('[admin/users/[id]] payments error:', paymentsError);
  if (referralUsesError) console.error('[admin/users/[id]] referral_uses (captados) error:', referralUsesError);
  if (ownUseError) console.error('[admin/users/[id]] referral_uses (propio) error:', ownUseError);

  // Resolver nombre/email de los usuarios que captó (referidos entrantes)
  const referredUserIds = (referralUsesRaw ?? []).map((r) => r.user_id);
  let referredUsersById: Record<number, { first_name: string | null; last_name: string | null; email: string }> = {};
  if (referredUserIds.length > 0) {
    const { data: referredUsers, error: referredUsersError } = await adminSupabase
      .from('users')
      .select('id, first_name, last_name, email')
      .in('id', referredUserIds);
    if (referredUsersError) console.error('[admin/users/[id]] referred users error:', referredUsersError);
    referredUsersById = Object.fromEntries(
      (referredUsers ?? []).map((u) => [u.id, { first_name: u.first_name, last_name: u.last_name, email: u.email }])
    );
  }
  const referralUses: ReferralUser[] = (referralUsesRaw ?? []).map((r) => {
    const owner = referredUsersById[r.user_id];
    const name = owner ? [owner.first_name, owner.last_name].filter(Boolean).join(' ') || null : null;
    return {
      user_id: r.user_id,
      code: r.code,
      created_at: r.created_at,
      name,
      email: owner?.email ?? null,
    };
  });

  // Resolver dueño del código que este usuario usó
  let usedReferral: UsedReferral | null = null;
  if (ownUseRaw) {
    const { data: ownerUser, error: ownerUserError } = await adminSupabase
      .from('users')
      .select('id, first_name, last_name, email')
      .eq('id', ownUseRaw.owner_user_id)
      .maybeSingle();
    if (ownerUserError) console.error('[admin/users/[id]] owner user error:', ownerUserError);
    usedReferral = {
      code: ownUseRaw.code,
      owner_user_id: ownUseRaw.owner_user_id,
      created_at: ownUseRaw.created_at,
      ownerName: ownerUser ? [ownerUser.first_name, ownerUser.last_name].filter(Boolean).join(' ') || null : null,
      ownerEmail: ownerUser?.email ?? null,
    };
  }

  // Group responses by section_id
  const responsesBySection: Record<number, Response[]> = {};
  for (const row of responses ?? []) {
    if (!responsesBySection[row.section_id]) responsesBySection[row.section_id] = [];
    responsesBySection[row.section_id].push(row as Response);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        {[user.first_name, user.last_name].filter(Boolean).join(' ') || user.email}
      </h1>
      <UserDetailClient
        user={user}
        responsesBySection={responsesBySection}
        assessments={(assessments ?? []) as Assessment[]}
        payments={(payments ?? []) as Payment[]}
        referralUses={referralUses}
        usedReferral={usedReferral}
        userId={userId}
      />
    </div>
  );
}
