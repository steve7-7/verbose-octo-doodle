import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { verifyAndFulfill, listUserSubscriptions } from "@/lib/paystack";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET — list current user's subscriptions
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const rows = await listUserSubscriptions(user.id);
  return NextResponse.json({ subscriptions: rows });
}

// POST — verify & fulfill a payment (mock-mode friendly)
export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const body = await req.json().catch(() => ({}));
    const reference = body?.reference;
    if (!reference) {
      return NextResponse.json({ error: "Reference required" }, { status: 400 });
    }

    // Ownership check: the subscription must belong to the requesting user.
    const sub = await db.subscription.findUnique({ where: { reference } });
    if (!sub) {
      return NextResponse.json({ error: "Reference not found" }, { status: 404 });
    }
    if (sub.userId !== user.id) {
      return NextResponse.json({ error: "Unauthorized: this payment belongs to another user" }, { status: 403 });
    }

    const result = await verifyAndFulfill(reference);
    return NextResponse.json(result);
  } catch (e) {
    console.error("[paystack verify]", e);
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
