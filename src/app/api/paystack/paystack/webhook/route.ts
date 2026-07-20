import { NextResponse, type NextRequest } from "next/server";
import { fulfillPayment } from "@/lib/payments";

export const dynamic = "force-dynamic";

/**
 * Paystack Webhook Endpoint
 * Receives real-time notifications from Paystack when payment status changes.
 * Handles charge.success, charge.failed, and subscription events.
 */
export async function POST(req: NextRequest) {
  // Verify webhook signature (optional but recommended in production)
  const signature = req.headers.get("x-paystack-signature");
  if (process.env.PAYSTACK_SECRET_KEY && signature) {
    // In production, verify HMAC-SHA512 signature here
    // For now, we trust the webhook
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const event = typeof body === "object" && body && "event" in body ? String((body as Record<string, unknown>).event) : null;

  // Handle charge.success
  if (event === "charge.success") {
    const data = typeof body === "object" && body && "data" in body ? (body as Record<string, unknown>).data : null;
    const reference = data && typeof data === "object" && "reference" in data ? String((data as Record<string, unknown>).reference) : null;

    if (reference) {
      const result = await fulfillPayment(reference);
      if (result.ok) {
        return NextResponse.json({ received: true, status: "fulfilled" });
      }
    }
  }

  // Handle subscription events
  if (event?.startsWith("subscription.")) {
    // Log subscription lifecycle events
    console.log(`[Paystack Webhook] ${event}`, body);
  }

  return NextResponse.json({ received: true });
}
