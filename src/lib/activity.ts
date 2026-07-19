import { db } from "@/lib/db";

// Log a user activity for the activity feed.
export async function logActivity(
  userId: string,
  type: string,
  detail?: string,
): Promise<void> {
  try {
    await db.activityLog.create({
      data: { userId, type, detail },
    });
    // Keep only the latest 100 activities per user to avoid unbounded growth
    const count = await db.activityLog.count({ where: { userId } });
    if (count > 100) {
      const old = await db.activityLog.findMany({
        where: { userId },
        orderBy: { createdAt: "asc" },
        take: count - 100,
        select: { id: true },
      });
      if (old.length > 0) {
        await db.activityLog.deleteMany({
          where: { id: { in: old.map((o) => o.id) } },
        });
      }
    }
  } catch {
    // activity logging is best-effort, don't fail the request
  }
}

// Ensure a user has a referral code (generate one if missing).
export async function ensureReferralCode(userId: string): Promise<string> {
  const user = await db.user.findUnique({ where: { id: userId } });
  if (user?.referralCode) return user.referralCode;
  const code = generateReferralCode(user?.name ?? "GE");
  await db.user.update({
    where: { id: userId },
    data: { referralCode: code },
  });
  return code;
}

// Generate a human-readable referral code like "GE-ABC123".
function generateReferralCode(name: string): string {
  const prefix =
    name.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "GE";
  const rand = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `${prefix}-${rand}`;
}

// Count how many users were referred by a given referral code.
export async function countReferrals(referralCode: string): Promise<number> {
  return db.user.count({ where: { referredBy: referralCode } });
}
