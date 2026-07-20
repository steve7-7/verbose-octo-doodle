import { NextResponse } from "next/server";
import { getTodaysMatches, isHighlightlyConfigured, type HighlightlyMatch } from "@/lib/highlightly-api";

export const dynamic = "force-dynamic";

// GET /api/matches/today — fetch today's live/upcoming matches from Highlightly.
// Returns a graceful "not configured" response if no API key is set.
export async function GET() {
  if (!isHighlightlyConfigured()) {
    return NextResponse.json(
      {
        configured: false,
        matches: [],
        message: "Highlightly API key not configured. Set HIGHLIGHTLY_API_KEY in .env",
      },
      { status: 200 },
    );
  }

  try {
    const matches = await getTodaysMatches();
    return NextResponse.json({
      configured: true,
      matches: matches.map((m) => ({
        id: m.id,
        date: m.date,
        homeTeam: m.homeTeam.name,
        awayTeam: m.awayTeam.name,
        homeLogo: m.homeTeam.logo ?? null,
        awayLogo: m.awayTeam.logo ?? null,
        league: m.league.name,
        leagueLogo: m.league.logo ?? null,
        status: m.state.description,
        score: m.state.score.current,
        halftime: m.state.score.halftime ?? null,
        fulltime: m.state.score.fulltime ?? null,
        stadium: m.stadium?.name ?? null,
      })),
    });
  } catch (e) {
    console.error("[matches/today]", e);
    return NextResponse.json(
      {
        configured: true,
        matches: [],
        error: e instanceof Error ? e.message : "Failed to fetch matches",
      },
      { status: 200 },
    );
  }
}
