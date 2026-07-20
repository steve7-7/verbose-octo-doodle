import { NextResponse } from "next/server";
import { getCurrentUser, isPremiumActive } from "@/lib/auth";
import { deletePrediction, getPrediction, updatePrediction } from "@/lib/queries";
import { predictionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const numId = parseInt(id, 10);
  if (Number.isNaN(numId)) {
    return NextResponse.json({ error: "Invalid id" }, { status: 400 });
  }
  const user = await getCurrentUser();
  const isPremium = user ? isPremiumActive(user) : false;
  const pred = await getPrediction(numId, isPremium);
  if (!pred) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  return NextResponse.json({ prediction: pred });
}

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = predictionSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const data = { ...parsed.data };
    if (data.kickoffAt) {
      (data as { kickoffAt: Date }).kickoffAt = new Date(data.kickoffAt);
    }
    if (data.analysis !== undefined) data.analysis = data.analysis ?? null;
    if (data.scoreHome !== undefined) data.scoreHome = data.scoreHome ?? null;
    if (data.scoreAway !== undefined) data.scoreAway = data.scoreAway ?? null;

    const updated = await updatePrediction(numId, data);
    if (!updated) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ prediction: updated });
  } catch (e) {
    console.error("[prediction PATCH]", e);
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const numId = parseInt(id, 10);
    if (Number.isNaN(numId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    await deletePrediction(numId);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("[prediction DELETE]", e);
    return NextResponse.json({ error: "Delete failed" }, { status: 500 });
  }
}
