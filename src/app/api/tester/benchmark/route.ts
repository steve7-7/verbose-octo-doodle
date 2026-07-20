import { NextResponse } from "next/server";
import { benchmark } from "@/lib/cache-server";
import { getStats, listPredictions } from "@/lib/queries";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — benchmark cached vs uncached reads (admin only).
// This endpoint wipes and re-populates the cache, so it must be protected.
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }

  const statsBench = await benchmark(() => getStats());
  const predsBench = await benchmark(() => listPredictions({}, false, 50));
  return NextResponse.json({
    stats: statsBench,
    predictions: predsBench,
  });
}
