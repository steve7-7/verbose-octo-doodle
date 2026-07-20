import { NextResponse } from "next/server";
import { getCurrentUser, isPremiumActive } from "@/lib/auth";
import { createPrediction, listPredictions } from "@/lib/queries";
import { predictionSchema } from "@/lib/validation";

export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const user = await getCurrentUser();
  const isPremium = user ? isPremiumActive(user) : false;
  const url = new URL(req.url);
  const status = url.searchParams.get("status") || undefined;
  const league = url.searchParams.get("league") || undefined;
  const market = url.searchParams.get("market") || undefined;
  const risk = url.searchParams.get("risk") || undefined;
  const q = url.searchParams.get("q") || undefined;
  const limit = parseInt(url.searchParams.get("limit") || "50", 10);

  const rows = await listPredictions(
    { status, league, market, risk, q },
    isPremium,
    Math.min(Math.max(limit || 50, 1), 200),
  );

  return NextResponse.json({
    predictions: rows,
    isPremium,
    isAuthed: !!user,
  });
}

export async function POST(req: Request) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
    }
    if (user.role !== "admin") {
      return NextResponse.json({ error: "Admins only" }, { status: 403 });
    }
    const body = await req.json();
    const parsed = predictionSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message ?? "Invalid input" },
        { status: 400 },
      );
    }
    const created = await createPrediction({
      ...parsed.data,
      kickoffAt: new Date(parsed.data.kickoffAt),
      analysis: parsed.data.analysis ?? null,
      scoreHome: parsed.data.scoreHome ?? null,
      scoreAway: parsed.data.scoreAway ?? null,
    });

    // Log activity (best-effort)
    try {
      const { logActivity } = await import("@/lib/activity");
      await logActivity(user.id, "prediction_created", `${created.homeTeam} vs ${created.awayTeam}`);
    } catch {
      // ignore
    }

    return NextResponse.json({ prediction: created });
  } catch (e) {
    console.error("[predictions POST]", e);
    return NextResponse.json({ error: "Create failed" }, { status: 500 });
  }
}
