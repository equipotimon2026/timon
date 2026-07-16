import { NextRequest, NextResponse } from 'next/server';
import { getAuthedUserId } from '@/lib/api-auth';
import { getReferralGroups, getReferralSettings } from '@/lib/payment-access';

export async function GET(req: NextRequest) {
  const userId = await getAuthedUserId(req);
  if (!userId) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const [groups, settings] = await Promise.all([
    getReferralGroups(userId),
    getReferralSettings(),
  ]);

  return NextResponse.json({
    myCode: groups.myCode,
    myGroupSize: groups.myGroupSize,
    usedCode: groups.usedCode,
    groupSizeThreshold: settings.groupSize,
    discountPct: settings.discountPct,
  });
}
