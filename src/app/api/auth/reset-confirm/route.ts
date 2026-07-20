import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// POST — confirm a password reset using the token + new password.
export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const token = typeof body.token === "string" ? body.token.trim() : "";
    const password = typeof body.password === "string" ? body.password : "";

    if (!token) {
      return NextResponse.json({ error: "Reset token required" }, { status: 400 });
    }
    const pwCheck = z.string().min(6, "Password must be at least 6 characters").safeParse(password);
    if (!pwCheck.success) {
      return NextResponse.json(
        { error: pwCheck.error.issues[0]?.message ?? "Invalid password" },
        { status: 400 },
      );
    }

    // Find the token
    const reset = await db.passwordReset.findUnique({
      where: { token },
    });
    if (!reset) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
    }
    if (reset.usedAt) {
      return NextResponse.json({ error: "This reset link has already been used" }, { status: 400 });
    }
    if (new Date(reset.expiresAt).getTime() < Date.now()) {
      return NextResponse.json({ error: "This reset link has expired" }, { status: 400 });
    }

    // Update the password
    const passwordHash = await bcrypt.hash(password, 10);
    await db.user.update({
      where: { id: reset.userId },
      data: { passwordHash },
    });

    // Mark token as used
    await db.passwordReset.update({
      where: { id: reset.id },
      data: { usedAt: new Date() },
    });

    return NextResponse.json({ ok: true, message: "Password updated. You can now sign in." });
  } catch (e) {
    console.error("[reset-confirm]", e);
    return NextResponse.json({ error: "Reset failed" }, { status: 500 });
  }
}
