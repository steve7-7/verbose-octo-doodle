import { NextResponse, type NextRequest } from "next/server";
import { fulfillPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Paystack redirects here (server-to-server / "Return to merchant") after a
 * transaction. We fulfil the subscription server-side, then route the user back
 * to their subscription dashboard with a status flag.
 */
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const reference = searchParams.get("reference") || searchParams.get("trxref");
  const base = new URL("/dashboard/subscription", req.url);

  if (!reference) {
    base.searchParams.set("status", "failed");
    return NextResponse.redirect(base);
  }

  const result = await fulfillPayment(reference);
  base.searchParams.set(
    "status",
    result.status === "success" ? "success" : "failed",
  );
  if (result.message) base.searchParams.set("note", result.message);
  return NextResponse.redirect(base);
}
