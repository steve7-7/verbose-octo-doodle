import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { getCurrentUser } from "@/lib/auth";
import { initializePayment, getPaystackMode } from "@/lib/paystack";
import { PLANS, type PlanId } from "@/lib/constants";
import { generateReference } from "@/lib/utils";

export const dynamic = "force-dynamic";

const schema = z.object({
  plan: z.enum(["premium"]),
});

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json(
      { error: "Authentication required" },
      { status: 401 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
  }

  const parsed = schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message ?? "Invalid plan" },
      { status: 400 },
    );
  }

  const planId = parsed.data.plan as PlanId;
  const plan = PLANS[planId];
  if (!plan) {
    return NextResponse.json({ error: "Unknown plan" }, { status: 400 });
  }

  const reference = generateReference("FP");
  const origin = new URL(req.url).origin;

  await db.insert(subscriptions).values({
    userId: user.id,
    reference,
    email: user.email,
    amount: plan.price,
    currency: "NGN",
    plan: planId,
    status: "initialized",
    provider: getPaystackMode() === "live" ? "paystack" : "mock",
  });

  const result = await initializePayment({
    email: user.email,
    amount: plan.price,
    plan: planId,
    reference,
    requestOrigin: origin,
  });

  return NextResponse.json(result);
}
