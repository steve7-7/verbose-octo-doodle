import { NextResponse } from "next/server";
import { cacheStats } from "@/lib/cache-server";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET — cache telemetry (admin only)
export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthenticated" }, { status: 401 });
  }
  if (user.role !== "admin") {
    return NextResponse.json({ error: "Admins only" }, { status: 403 });
  }
  return NextResponse.json(cacheStats());
}
