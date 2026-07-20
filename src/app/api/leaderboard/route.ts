import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Tipster leaderboard — ranks tipsters by win rate, tips count, avg confidence, avg odds.
export async function GET() {
  const all = await db.prediction.findMany();

  const map = new Map<
    string,
    {
      name: string;
      total: number;
      won: number;
      lost: number;
      void: number;
      settled: number;
      upcoming: number;
      premium: number;
      confSum: number;
      oddsSum: number;
    }
  >();

  for (const p of all) {
    const t = p.tipster;
    const e =
      map.get(t) ?? {
        name: t,
        total: 0,
        won: 0,
        lost: 0,
        void: 0,
        settled: 0,
        upcoming: 0,
        premium: 0,
        confSum: 0,
        oddsSum: 0,
      };
    e.total++;
    e.confSum += p.confidence;
    e.oddsSum += p.odds;
    if (p.isPremium) e.premium++;
    if (p.status === "won") {
      e.won++;
      e.settled++;
    } else if (p.status === "lost") {
      e.lost++;
      e.settled++;
    } else if (p.status === "void") {
      e.void++;
    } else {
      e.upcoming++;
    }
    map.set(t, e);
  }

  const rows = Array.from(map.values())
    .map((e) => ({
      name: e.name,
      total: e.total,
      won: e.won,
      lost: e.lost,
      void: e.void,
      settled: e.settled,
      upcoming: e.upcoming,
      premium: e.premium,
      winRate: e.settled > 0 ? Math.round((e.won / e.settled) * 100) : 0,
      avgConfidence: e.total > 0 ? Math.round(e.confSum / e.total) : 0,
      avgOdds: e.total > 0 ? Math.round((e.oddsSum / e.total) * 100) / 100 : 0,
    }))
    .sort((a, b) => {
      // Sort by win rate desc, then settled desc, then total desc
      if (b.winRate !== a.winRate) return b.winRate - a.winRate;
      if (b.settled !== a.settled) return b.settled - a.settled;
      return b.total - a.total;
    });

  return NextResponse.json({ tipsters: rows });
}
