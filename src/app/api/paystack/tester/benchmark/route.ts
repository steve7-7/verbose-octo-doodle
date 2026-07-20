import { NextResponse, type NextRequest } from "next/server";
import { db } from "@/db";
import { predictions } from "@/db/schema";
import { count, sql } from "drizzle-orm";
import { cacheServer } from "@/lib/cache-server";
import { getStats, listPredictions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let body: { target?: string; iterations?: number } = {};
  try {
    body = await req.json();
  } catch {
    // default
  }

  const target = body.target || "all";
  const iterations = Math.min(Math.max(body.iterations || 3, 1), 10);

  const results: {
    target: string;
    label: string;
    uncachedMs: number;
    cachedMs: number;
    speedupRatio: number;
    payloadBytes: number;
    status: string;
  }[] = [];

  // Test 1: Dashboard Stats Query
  if (target === "all" || target === "stats") {
    // Measure uncached raw SQL
    const t0 = performance.now();
    for (let i = 0; i < iterations; i++) {
      await db.select({ status: predictions.status, count: count() }).from(predictions).groupBy(predictions.status);
    }
    const uncachedAvg = Math.round(((performance.now() - t0) / iterations) * 100) / 100;

    // Ensure cache is warmed
    await getStats();

    // Measure cached fetch
    const t1 = performance.now();
    let statsData;
    for (let i = 0; i < iterations; i++) {
      statsData = await getStats();
    }
    const cachedAvg = Math.round(((performance.now() - t1) / iterations) * 100) / 100;
    const payloadBytes = JSON.stringify(statsData).length;

    results.push({
      target: "stats",
      label: "Dashboard Aggregation Stats (/api/stats)",
      uncachedMs: uncachedAvg,
      cachedMs: Math.max(cachedAvg, 0.1),
      speedupRatio: Math.round((uncachedAvg / Math.max(cachedAvg, 0.1)) * 10) / 10,
      payloadBytes,
      status: cachedAvg < 5 ? "Blazing Fast ⚡" : "Fast",
    });
  }

  // Test 2: Predictions Feed (Upcoming & Settled)
  if (target === "all" || target === "predictions") {
    const t0 = performance.now();
    for (let i = 0; i < iterations; i++) {
      await db.select().from(predictions).orderBy(sql`case when status = 'upcoming' then 0 else 1 end`, predictions.kickoffAt);
    }
    const uncachedAvg = Math.round(((performance.now() - t0) / iterations) * 100) / 100;

    await listPredictions({}, false);

    const t1 = performance.now();
    let feedData;
    for (let i = 0; i < iterations; i++) {
      feedData = await listPredictions({}, false);
    }
    const cachedAvg = Math.round(((performance.now() - t1) / iterations) * 100) / 100;
    const payloadBytes = JSON.stringify(feedData).length;

    results.push({
      target: "predictions",
      label: "Predictions Feed & Board (/api/predictions)",
      uncachedMs: uncachedAvg,
      cachedMs: Math.max(cachedAvg, 0.1),
      speedupRatio: Math.round((uncachedAvg / Math.max(cachedAvg, 0.1)) * 10) / 10,
      payloadBytes,
      status: cachedAvg < 5 ? "Blazing Fast ⚡" : "Fast",
    });
  }

  const totalUncached = results.reduce((acc, r) => acc + r.uncachedMs, 0);
  const totalCached = results.reduce((acc, r) => acc + r.cachedMs, 0);
  const overallSpeedup = Math.round((totalUncached / Math.max(totalCached, 0.1)) * 10) / 10;

  return NextResponse.json({
    ok: true,
    benchmarkTime: new Date().toISOString(),
    iterations,
    overallSpeedup: `${overallSpeedup}x`,
    results,
    cacheStats: cacheServer.getStats(),
  });
}
