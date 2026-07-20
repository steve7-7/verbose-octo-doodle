import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { initializePayment } from "@/lib/paystack";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const result = await initializePayment({
      userId: user.id,
      email: user.email,
      amount: 100,
      plan: "premium-24h",
    });
    return NextResponse.json(result);
  } catch (e) {
    console.error("[paystack init]", e);
    return NextResponse.json({ error: "Failed to initialize payment" }, { status: 500 });
  }
}
