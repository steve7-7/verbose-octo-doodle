import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// PATCH — update a user's role or plan (admin only)
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const admin = await getCurrentUser();
    if (!admin) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (admin.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }

    const body = await req.json().catch(() => ({}));
    const updates: Record<string, unknown> = {};

    // Look up the target user to enforce server-side protections.
    const targetUser = await db.user.findUnique({ where: { id }, select: { email: true, role: true } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Protect root admin from being demoted.
    if (body.role === "user" && targetUser.email === "admin@goaledge.com") {
      return NextResponse.json({ error: "Cannot demote the root admin" }, { status: 403 });
    }

    // Prevent self-demotion to avoid accidental lockout.
    if (body.role === "user" && id === admin.id) {
      return NextResponse.json({ error: "Cannot demote yourself" }, { status: 403 });
    }

    // Prevent last-admin lockout: count current admins, reject if demotion would leave 0.
    if (body.role === "user" && targetUser.role === "admin") {
      const adminCount = await db.user.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json({ error: "Cannot demote the last admin" }, { status: 403 });
      }
    }

    if (body.role === "admin" || body.role === "user") {
      updates.role = body.role;
    }
    if (body.plan === "premium") {
      updates.plan = "premium";
      updates.planExpiresAt = new Date(Date.now() + 24 * 3600 * 1000); // 24h
    } else if (body.plan === "free") {
      updates.plan = "free";
      updates.planExpiresAt = null;
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id },
      data: updates,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        plan: true,
        avatarColor: true,
        planExpiresAt: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      user: {
        ...updated,
        planExpiresAt: updated.planExpiresAt ? updated.planExpiresAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[admin users PATCH]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
