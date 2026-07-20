import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// DELETE — unfollow a tipster (by name)
export async function DELETE(_req: Request, ctx: { params: Promise<{ tipster: string }> }) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const { tipster } = await ctx.params;
  const decoded = decodeURIComponent(tipster);
  try {
    await db.follow.deleteMany({
      where: { followerId: user.id, followeeId: decoded },
    });
    return NextResponse.json({ ok: true, following: false });
  } catch {
    return NextResponse.json({ error: "Unfollow failed" }, { status: 500 });
  }
}
