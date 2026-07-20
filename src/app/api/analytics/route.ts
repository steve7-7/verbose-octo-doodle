import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// Aggregated analytics for the Analytics dashboard tab.
export async function GET() {
  const all = await db.prediction.findMany({
    orderBy: { kickoffAt: "asc" },
  });

  // League breakdown (count + win rate per league)
  const leagueMap = new Map<string, { league: string; total: number; won: number; lost: number; pending: number }>();
  for (const p of all) {
    const e = leagueMap.get(p.league) ?? { league: p.league, total: 0, won: 0, lost: 0, pending: 0 };
    e.total++;
    if (p.status === "won") e.won++;
    else if (p.status === "lost") e.lost++;
    else e.pending++;
    leagueMap.set(p.league, e);
  }
  const byLeague = Array.from(leagueMap.values())
    .map((e) => ({
      ...e,
      winRate: e.won + e.lost > 0 ? Math.round((e.won / (e.won + e.lost)) * 100) : 0,
    }))
    .sort((a, b) => b.total - a.total);

  // Confidence distribution (buckets)
  const confBuckets = [
    { range: "1-40%", min: 1, max: 40, count: 0 },
    { range: "41-55%", min: 41, max: 55, count: 0 },
    { range: "56-70%", min: 56, max: 70, count: 0 },
    { range: "71-85%", min: 71, max: 85, count: 0 },
    { range: "86-99%", min: 86, max: 99, count: 0 },
  ];
  for (const p of all) {
    const b = confBuckets.find((x) => p.confidence >= x.min && p.confidence <= x.max);
    if (b) b.count++;
  }

  // Risk breakdown
  const risk = { low: 0, medium: 0, high: 0 };
  for (const p of all) {
    if (p.risk === "low") risk.low++;
    else if (p.risk === "medium") risk.medium++;
    else if (p.risk === "high") risk.high++;
  }

  // Market breakdown
  const marketMap = new Map<string, number>();
  for (const p of all) {
    marketMap.set(p.market, (marketMap.get(p.market) ?? 0) + 1);
  }
  const byMarket = Array.from(marketMap.entries())
    .map(([market, count]) => ({ market, count }))
    .sort((a, b) => b.count - a.count);

  // Cumulative win-rate trend over time — sort settled by kickoff and compute running win rate.
  // Produces a meaningful "how is the model performing over time" chart.
  const settled = all.filter((p) => p.status === "won" || p.status === "lost");
  const settledSorted = settled
    .slice()
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime());
  let runWon = 0;
  let runTotal = 0;
  const cumulative: { label: string; winRate: number; settled: number; won: number }[] = [];
  for (const p of settledSorted) {
    runTotal++;
    if (p.status === "won") runWon++;
    const d = new Date(p.kickoffAt);
    cumulative.push({
      label: `${d.getDate()}/${d.getMonth() + 1}`,
      winRate: Math.round((runWon / runTotal) * 100),
      settled: runTotal,
      won: runWon,
    });
  }
  // Always provide at least a couple of points so the chart isn't empty
  const trend =
    cumulative.length > 0
      ? cumulative
      : [
          { label: "—", winRate: 0, settled: 0, won: 0 },
          { label: "—", winRate: 0, settled: 0, won: 0 },
        ];

  // Odds vs outcome (average odds for won vs lost)
  const wonOdds = settled.filter((p) => p.status === "won").map((p) => p.odds);
  const lostOdds = settled.filter((p) => p.status === "lost").map((p) => p.odds);
  const avg = (arr: number[]) => (arr.length ? Math.round((arr.reduce((a, b) => a + b, 0) / arr.length) * 100) / 100 : 0);

  // Confidence vs outcome (avg confidence for won vs lost)
  const wonConf = settled.filter((p) => p.status === "won").map((p) => p.confidence);
  const lostConf = settled.filter((p) => p.status === "lost").map((p) => p.confidence);
  const avgInt = (arr: number[]) => (arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : 0);

  return NextResponse.json({
    totals: {
      total: all.length,
      won: settled.filter((p) => p.status === "won").length,
      lost: settled.filter((p) => p.status === "lost").length,
      pending: all.filter((p) => p.status === "upcoming").length,
    },
    byLeague,
    byMarket,
    confidence: confBuckets,
    risk,
    trend,
    insight: {
      avgOddsWon: avg(wonOdds),
      avgOddsLost: avg(lostOdds),
      avgConfWon: avgInt(wonConf),
      avgConfLost: avgInt(lostConf),
    },
  });
}
