import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { ensureReferralCode, countReferrals } from "@/lib/activity";

export const dynamic = "force-dynamic";

// GET — fetch the current user's referral code + referral stats
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }

  const code = await ensureReferralCode(user.id);
  const referralCount = await countReferrals(code);

  // Count how many referrals resulted in premium activations
  const referrals = await db.user.findMany({
    where: { referredBy: code },
    select: { id: true },
  });
  const referralIds = referrals.map((r) => r.id);
  const premiumReferrals =
    referralIds.length > 0
      ? await db.subscription.count({
          where: {
            userId: { in: referralIds },
            status: "success",
          },
        })
      : 0;

  return NextResponse.json({
    code,
    referralCount,
    premiumReferrals,
    rewardPerReferral: 24, // hours of premium per successful referral
  });
}
