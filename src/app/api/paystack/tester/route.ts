import { NextResponse, type NextRequest } from "next/server";
import { cacheServer } from "@/lib/cache-server";
import { getStats, listPredictions } from "@/lib/queries";

export const dynamic = "force-dynamic";

export async function GET() {
  const stats = cacheServer.getStats();
  return NextResponse.json({
    ok: true,
    cache: stats,
    status: "active",
    engine: "GoalEdge High-Performance Memory Cache",
  });
}

export async function POST(req: NextRequest) {
  let body: { action?: string; tags?: string[] } = {};
  try {
    body = await req.json();
  } catch {
    // default
  }

  const action = body.action || "warmup";

  if (action === "purge") {
    cacheServer.purgeAll();
    return NextResponse.json({ ok: true, message: "Cache purged successfully.", stats: cacheServer.getStats() });
  }

  if (action === "warmup") {
    const t0 = performance.now();
    // Execute multiple reads in parallel to warm the cache server
    await Promise.all([
      getStats(),
      listPredictions({}, false, 10),
      listPredictions({}, true, 10),
      listPredictions({ status: "upcoming" }, false, 6),
      listPredictions({ status: "won" }, false, 8),
      listPredictions({ status: "lost" }, false, 8),
    ]);
    const durationMs = Math.round((performance.now() - t0) * 10) / 10;
    return NextResponse.json({
      ok: true,
      message: `Cache warmed up across 6 core endpoints in ${durationMs}ms!`,
      stats: cacheServer.getStats(),
    });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
