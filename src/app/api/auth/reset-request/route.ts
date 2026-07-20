import { NextResponse } from "next/server";
import { z } from "zod";
import { randomBytes } from "crypto";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST — request a password reset token.
// In production this would send an email; in demo mode it returns the token directly.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!email || !z.string().email().safeParse(email).success) {
      return NextResponse.json({ error: "Valid email required" }, { status: 400 });
    }

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      // Don't reveal whether the email exists — return success either way
      return NextResponse.json({
        ok: true,
        message: "If an account exists for that email, a reset link has been sent.",
      });
    }

    // Generate a random token
    const token = randomBytes(32).toString("hex");
    const expiresAt = new Date(Date.now() + 3600 * 1000); // 1 hour

    // Invalidate any previous unused tokens for this user
    await db.passwordReset.updateMany({
      where: { userId: user.id, usedAt: null },
      data: { usedAt: new Date() },
    });

    // Create the new token
    await db.passwordReset.create({
      data: {
        userId: user.id,
        token,
        expiresAt,
      },
    });

    // In development/demo mode, return the token so the UI can display it.
    // In production, send an email with a link like:
    //   https://yourdomain.com/reset-password?token=XXX
    const isDev = process.env.NODE_ENV !== "production";
    return NextResponse.json({
      ok: true,
      message: isDev
        ? "Reset link generated. In production, this would be emailed to you."
        : "If an account exists for that email, a reset link has been sent.",
      // Only expose the token in development for the demo UI flow.
      ...(isDev ? { demoToken: token } : {}),
    });
  } catch (e) {
    console.error("[reset-request]", e);
    return NextResponse.json({ error: "Request failed" }, { status: 500 });
  }
}
