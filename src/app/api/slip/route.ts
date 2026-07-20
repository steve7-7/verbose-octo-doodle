import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — fetch the current user's server-side slip (prediction IDs + full prediction data)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const slip = await db.betSlip.findUnique({ where: { userId: user.id } });
  let ids: number[] = [];
  if (slip) {
    try {
      ids = JSON.parse(slip.predictionIds) as number[];
    } catch {
      ids = [];
    }
  }
  // Fetch full prediction data for the stored IDs
  const predictions =
    ids.length > 0
      ? await db.prediction.findMany({ where: { id: { in: ids } } })
      : [];
  // Sort by the order in the stored IDs array
  const ordered = ids
    .map((id) => predictions.find((p) => p.id === id))
    .filter((p): p is NonNullable<typeof p> => p != null);
  return NextResponse.json({
    predictionIds: ids,
    predictions: ordered.map((p) => ({
      id: p.id,
      homeTeam: p.homeTeam,
      awayTeam: p.awayTeam,
      league: p.league,
      leagueIcon: p.leagueIcon,
      tip: p.tip,
      market: p.market,
      odds: p.odds,
      kickoffAt: p.kickoffAt.toISOString(),
      isPremium: p.isPremium,
      status: p.status,
    })),
  });
}

// PUT — replace the entire slip with a new set of prediction IDs
export async function PUT(req: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  const body = await req.json().catch(() => ({}));
  const ids: unknown = body?.predictionIds;
  if (!Array.isArray(ids)) {
    return NextResponse.json({ error: "predictionIds must be an array" }, { status: 400 });
  }
  const clean = Array.from(
    new Set(
      ids
        .map((x) => (typeof x === "number" ? x : parseInt(String(x), 10)))
        .filter((n) => Number.isFinite(n) && n > 0),
    ),
  ).slice(0, 50); // Cap at 50 picks to prevent abuse
  const json = JSON.stringify(clean);
  await db.betSlip.upsert({
    where: { userId: user.id },
    create: { userId: user.id, predictionIds: json },
    update: { predictionIds: json },
  });
  return NextResponse.json({ predictionIds: clean });
}

// DELETE — clear the slip
export async function DELETE() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  await db.betSlip.deleteMany({ where: { userId: user.id } });
  return NextResponse.json({ ok: true });
}
