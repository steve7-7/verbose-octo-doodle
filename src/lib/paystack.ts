// Mock-friendly Paystack integration.
// When PAYSTACK_SECRET_KEY is not set, payments are simulated with instant fulfillment.

import { db } from "@/lib/db";
import { generateReference } from "@/lib/utils";

const PREMIUM_AMOUNT_KES = 100;
const PREMIUM_DURATION_HOURS = 24;

export interface InitResult {
  reference: string;
  authorization_url: string;
  access_code: string;
  mock: boolean;
}

export function isMockMode(): boolean {
  return !process.env.PAYSTACK_SECRET_KEY;
}

export async function initializePayment(opts: {
  userId: string;
  email: string;
  amount?: number;
  plan?: string;
}): Promise<InitResult> {
  const amount = opts.amount ?? PREMIUM_AMOUNT_KES;
  const reference = generateReference("GE");
  const plan = opts.plan ?? "premium-24h";

  await db.subscription.create({
    data: {
      userId: opts.userId,
      reference,
      email: opts.email,
      amount,
      currency: "KES",
      plan,
      status: "initialized",
      provider: isMockMode() ? "mock" : "paystack",
    },
  });

  if (isMockMode()) {
    // Instant fulfillment for dev/demo
    return {
      reference,
      authorization_url: "",
      access_code: "",
      mock: true,
    };
  }

  // Real Paystack initialize call would go here. Stubbed for offline dev.
  return {
    reference,
    authorization_url: "",
    access_code: "",
    mock: true,
  };
}

export async function verifyAndFulfill(reference: string): Promise<{
  success: boolean;
  message: string;
}> {
  const sub = await db.subscription.findUnique({ where: { reference } });
  if (!sub) return { success: false, message: "Reference not found." };
  if (sub.status === "success") {
    return { success: true, message: "Already fulfilled." };
  }

  // Mark subscription as paid
  await db.subscription.update({
    where: { reference },
    data: { status: "success", paidAt: new Date() },
  });

  // Grant premium access
  const expiresAt = new Date(Date.now() + PREMIUM_DURATION_HOURS * 3600 * 1000);
  await db.user.update({
    where: { id: sub.userId },
    data: { plan: "premium", planExpiresAt: expiresAt },
  });

  // Log activity (best-effort)
  try {
    const { logActivity } = await import("@/lib/activity");
    await logActivity(sub.userId, "premium_activated", `24h premium via ${sub.provider}`);
  } catch {
    // ignore
  }

  // Auto-grant referral reward: if this user was referred, extend the referrer's premium
  try {
    const user = await db.user.findUnique({ where: { id: sub.userId } });
    if (user?.referredBy) {
      const referrer = await db.user.findUnique({
        where: { referralCode: user.referredBy },
      });
      if (referrer) {
        // Extend referrer's premium: if currently premium, extend from current expiry;
        // otherwise grant 24h from now.
        const baseTime =
          referrer.planExpiresAt && new Date(referrer.planExpiresAt).getTime() > Date.now()
            ? new Date(referrer.planExpiresAt).getTime()
            : Date.now();
        const referrerExpiry = new Date(baseTime + PREMIUM_DURATION_HOURS * 3600 * 1000);
        await db.user.update({
          where: { id: referrer.id },
          data: { plan: "premium", planExpiresAt: referrerExpiry },
        });
        // Log the referral reward activity for the referrer
        try {
          const { logActivity: logRef } = await import("@/lib/activity");
          await logRef(
            referrer.id,
            "premium_activated",
            `24h referral reward from ${user.name}`,
          );
        } catch {
          // ignore
        }
      }
    }
  } catch {
    // referral reward is best-effort
  }

  return { success: true, message: "Premium activated for 24 hours." };
}

export async function listUserSubscriptions(userId: string) {
  const rows = await db.subscription.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 25,
  });
  return rows.map((s) => ({
    id: s.id,
    reference: s.reference,
    amount: s.amount,
    currency: s.currency,
    plan: s.plan,
    status: s.status,
    provider: s.provider,
    createdAt: s.createdAt.toISOString(),
    paidAt: s.paidAt ? s.paidAt.toISOString() : null,
  }));
}
