import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { profileSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function PATCH(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    const body = await req.json();
    const parsed = profileSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const updated = await db.user.update({
      where: { id: user.id },
      data: {
        name: parsed.data.name,
        avatarColor: parsed.data.avatarColor,
      },
    });
    return NextResponse.json({
      user: {
        id: updated.id,
        name: updated.name,
        email: updated.email,
        role: updated.role,
        plan: updated.plan,
        avatarColor: updated.avatarColor,
        planExpiresAt: updated.planExpiresAt ? updated.planExpiresAt.toISOString() : null,
        createdAt: updated.createdAt.toISOString(),
      },
    });
  } catch (e) {
    console.error("[profile]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
