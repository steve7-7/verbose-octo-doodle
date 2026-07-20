import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";
import { setSessionCookie } from "@/lib/auth";
import { registerSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const { name, email, password } = parsed.data;
    const referralCode = typeof body.referralCode === "string" ? body.referralCode.trim().toUpperCase() : null;

    const existing = await db.user.findUnique({ where: { email: email.toLowerCase() } });
    if (existing) {
      return NextResponse.json({ error: "Email already registered" }, { status: 409 });
    }

    // Validate referral code if provided
    let referredBy: string | null = null;
    if (referralCode) {
      const referrer = await db.user.findUnique({ where: { referralCode } });
      if (referrer) {
        referredBy = referralCode;
      }
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const palette = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
    const avatarColor = palette[Math.floor(Math.random() * palette.length)]!;

    const user = await db.user.create({
      data: {
        name,
        email: email.toLowerCase(),
        passwordHash,
        role: "user",
        plan: "free",
        avatarColor,
        referredBy,
      },
    });

    await setSessionCookie({
      sub: user.id,
      email: user.email,
      role: "user",
      plan: "free",
    });

    // Log activity (best-effort)
    try {
      const { logActivity } = await import("@/lib/activity");
      await logActivity(user.id, "register", referredBy ? `Joined via referral ${referredBy}` : undefined);
    } catch {
      // ignore
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        plan: user.plan,
        avatarColor: user.avatarColor,
        planExpiresAt: user.planExpiresAt ? user.planExpiresAt.toISOString() : null,
        createdAt: user.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[register]", e);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
