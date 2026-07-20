import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — list the current user's followed tipsters
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const follows = await db.follow.findMany({
    where: { followerId: user.id },
    orderBy: { createdAt: "desc" },
    select: { followeeId: true, createdAt: true },
  });
  return NextResponse.json({
    following: follows.map((f) => f.followeeId),
  });
}

// POST — follow a tipster (by name)
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const tipster = typeof body.tipster === "string" ? body.tipster.trim() : "";
  if (!tipster) {
    return NextResponse.json({ error: "Tipster name required" }, { status: 400 });
  }
  try {
    await db.follow.upsert({
      where: {
        followerId_followeeId: {
          followerId: user.id,
          followeeId: tipster,
        },
      },
      create: { followerId: user.id, followeeId: tipster },
      update: {},
    });
    return NextResponse.json({ ok: true, following: true });
  } catch (e) {
    return NextResponse.json({ error: "Follow failed" }, { status: 500 });
  }
}
