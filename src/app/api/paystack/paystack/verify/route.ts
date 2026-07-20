import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUser } from "@/lib/auth";
import { fulfillPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

const schema = z.object({ reference: z.string().min(1) });

/** Preview a transaction by reference (used by the mock checkout page). */
export async function GET(req: NextRequest) {
  const reference = new URL(req.url).searchParams.get("reference");
  if (!reference) {
    return NextResponse.json({ error: "Reference required" }, { status: 400 });
  }
  const [sub] = await db
    .select({
      reference: subscriptions.reference,
      amount: subscriptions.amount,
      currency: subscriptions.currency,
      plan: subscriptions.plan,
      email: subscriptions.email,
      status: subscriptions.status,
    })
    .from(subscriptions)
    .where(eq(subscriptions.reference, reference))
    .limit(1);

  if (!sub) {
    return NextResponse.json({ error: "Reference not found" }, { status: 404 });
  }
  return NextResponse.json({ subscription: sub });
}

/** Fulfil a transaction after the user completes payment. */
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
      { error: parsed.error.issues[0]?.message ?? "Reference required" },
      { status: 400 },
    );
  }

  const result = await fulfillPayment(parsed.data.reference);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
