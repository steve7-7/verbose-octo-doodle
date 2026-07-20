import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — list all users (admin only)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const users = await db.user.findMany({
    orderBy: { createdAt: "desc" },
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

  // Count subscriptions per user
  const subCounts = await db.subscription.groupBy({
    by: ["userId"],
    _count: { id: true },
    where: { status: "success" },
  });
  const subMap = new Map(subCounts.map((s) => [s.userId, s._count.id]));

  return NextResponse.json({
    users: users.map((u) => ({
      ...u,
      planExpiresAt: u.planExpiresAt ? u.planExpiresAt.toISOString() : null,
      createdAt: u.createdAt.toISOString(),
      paymentCount: subMap.get(u.id) ?? 0,
    })),
  });
}
