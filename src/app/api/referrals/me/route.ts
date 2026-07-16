import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUserId } from '@/lib/api-auth';
import { getReferralGroups, getReferralSettings } from '@/lib/payment-access';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET(req: NextRequest) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [groups, settings] = await Promise.all([
    getReferralGroups(userId),
    getReferralSettings(),
  ]);

  let ownerEmail: string | null = null;
  if (groups.usedCode !== null) {
    const admin = createAdminClient();
    const { data: use, error: useError } = await admin
      .from('referral_uses')
      .select('owner_user_id')
      .eq('user_id', userId)
      .maybeSingle();
    if (useError) {
      console.error('[api/referrals/me] referral_uses lookup:', useError);
    } else if (use?.owner_user_id) {
      const { data: owner, error: ownerError } = await admin
        .from('users')
        .select('email')
        .eq('id', use.owner_user_id)
        .maybeSingle();
      if (ownerError) {
        console.error('[api/referrals/me] owner lookup:', ownerError);
      } else {
        ownerEmail = owner?.email ?? null;
      }
    }
  }

  return NextResponse.json({
    myCode: groups.myCode,
    myGroupSize: groups.myGroupSize,
    usedCode: groups.usedCode,
    usedGroupSize: groups.usedGroupSize,
    ownerEmail,
    groupSizeThreshold: settings.groupSize,
    discountPct: settings.discountPct,
  });
}
