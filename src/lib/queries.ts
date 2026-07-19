import { db } from "@/lib/db";
import { cached, invalidateTag } from "@/lib/cache-server";
import { isPremiumActive } from "@/lib/auth";
import type { SafeUser, ClientPrediction, Prediction, Stats } from "@/lib/types";

function attachLocked(p: Prediction, viewerIsPremium: boolean): ClientPrediction {
  const locked = p.isPremium && !viewerIsPremium;
  if (locked) {
    // Strip premium-only fields server-side so they can't be read via API.
    // Match metadata (teams, league, market, odds, confidence) is still visible
    // to entice upgrading, but the actual tip + analysis + scores are hidden.
    return {
      ...p,
      tip: "🔒 Premium tip — unlock to view",
      analysis: null,
      scoreHome: null,
      scoreAway: null,
      locked: true,
    };
  }
  return { ...p, locked: false };
}

function serialize(p: {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueIcon: string;
  country: string;
  kickoffAt: Date;
  tip: string;
  market: string;
  odds: number;
  confidence: number;
  risk: string;
  analysis: string | null;
  isPremium: boolean;
  status: string;
  scoreHome: number | null;
  scoreAway: number | null;
  tipster: string;
  createdAt: Date;
}): Prediction {
  return {
    id: p.id,
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    league: p.league,
    leagueIcon: p.leagueIcon,
    country: p.country,
    kickoffAt: p.kickoffAt.toISOString(),
    tip: p.tip,
    market: p.market,
    odds: p.odds,
    confidence: p.confidence,
    risk: p.risk as "low" | "medium" | "high",
    analysis: p.analysis,
    isPremium: p.isPremium,
    status: p.status as Prediction["status"],
    scoreHome: p.scoreHome,
    scoreAway: p.scoreAway,
    tipster: p.tipster,
    createdAt: p.createdAt.toISOString(),
  };
}

export async function listPredictions(
  filters: { status?: string; league?: string; market?: string; risk?: string; q?: string },
  viewerIsPremium: boolean,
  limit = 50,
): Promise<ClientPrediction[]> {
  const key = `preds:${JSON.stringify({ ...filters, viewerIsPremium, limit })}`;
  const rows = await cached(
    key,
    ["predictions"],
    async () => {
      const where: Record<string, unknown> = {};
      if (filters.status) where.status = filters.status;
      if (filters.league) where.league = filters.league;
      if (filters.market) where.market = filters.market;
      if (filters.risk) where.risk = filters.risk;
      if (filters.q) {
        where.OR = [
          { homeTeam: { contains: filters.q } },
          { awayTeam: { contains: filters.q } },
          { league: { contains: filters.q } },
        ];
      }
      const result = await db.prediction.findMany({
        where,
        orderBy: [{ status: "asc" }, { kickoffAt: "asc" }],
        take: limit,
      });
      return result.map(serialize);
    },
    { freshMs: 15_000, staleMs: 60_000 },
  );
  return rows.map((p) => attachLocked(p, viewerIsPremium));
}

export async function getPrediction(
  id: number,
  viewerIsPremium: boolean,
): Promise<ClientPrediction | null> {
  const key = `pred:${id}`;
  const row = await cached(
    key,
    ["predictions", `pred:${id}`],
    async () => {
      const p = await db.prediction.findUnique({ where: { id } });
      return p ? serialize(p) : null;
    },
    { freshMs: 15_000, staleMs: 60_000 },
  );
  if (!row) return null;
  return attachLocked(row, viewerIsPremium);
}

export async function getStats(): Promise<Stats> {
  return cached(
    "stats",
    ["predictions", "stats"],
    async () => {
      const [total, upcoming, won, lost, voided, premium] = await Promise.all([
        db.prediction.count(),
        db.prediction.count({ where: { status: "upcoming" } }),
        db.prediction.count({ where: { status: "won" } }),
        db.prediction.count({ where: { status: "lost" } }),
        db.prediction.count({ where: { status: "void" } }),
        db.prediction.count({ where: { isPremium: true } }),
      ]);
      const settled = won + lost;
      const wr = settled === 0 ? 0 : Math.round((won / settled) * 100);
      return {
        total,
        upcoming,
        won,
        lost,
        void: voided,
        settled,
        premium,
        winRate: wr,
      } satisfies Stats;
    },
    { freshMs: 30_000, staleMs: 5 * 60_000 },
  );
}

export async function createPrediction(
  input: Omit<Prediction, "id" | "createdAt"> & { kickoffAt: Date },
): Promise<Prediction> {
  const created = await db.prediction.create({
    data: {
      homeTeam: input.homeTeam,
      awayTeam: input.awayTeam,
      league: input.league,
      leagueIcon: input.leagueIcon,
      country: input.country,
      kickoffAt: input.kickoffAt,
      tip: input.tip,
      market: input.market,
      odds: input.odds,
      confidence: input.confidence,
      risk: input.risk,
      analysis: input.analysis,
      isPremium: input.isPremium,
      status: input.status,
      scoreHome: input.scoreHome,
      scoreAway: input.scoreAway,
      tipster: input.tipster,
    },
  });
  invalidateTag("predictions");
  invalidateTag("stats");
  return serialize(created);
}

export async function updatePrediction(
  id: number,
  input: Partial<Omit<Prediction, "id" | "createdAt">> & { kickoffAt?: Date },
): Promise<Prediction | null> {
  const updated = await db.prediction.update({
    where: { id },
    data: {
      ...(input.homeTeam !== undefined && { homeTeam: input.homeTeam }),
      ...(input.awayTeam !== undefined && { awayTeam: input.awayTeam }),
      ...(input.league !== undefined && { league: input.league }),
      ...(input.leagueIcon !== undefined && { leagueIcon: input.leagueIcon }),
      ...(input.country !== undefined && { country: input.country }),
      ...(input.kickoffAt !== undefined && { kickoffAt: input.kickoffAt }),
      ...(input.tip !== undefined && { tip: input.tip }),
      ...(input.market !== undefined && { market: input.market }),
      ...(input.odds !== undefined && { odds: input.odds }),
      ...(input.confidence !== undefined && { confidence: input.confidence }),
      ...(input.risk !== undefined && { risk: input.risk }),
      ...(input.analysis !== undefined && { analysis: input.analysis }),
      ...(input.isPremium !== undefined && { isPremium: input.isPremium }),
      ...(input.status !== undefined && { status: input.status }),
      ...(input.scoreHome !== undefined && { scoreHome: input.scoreHome }),
      ...(input.scoreAway !== undefined && { scoreAway: input.scoreAway }),
      ...(input.tipster !== undefined && { tipster: input.tipster }),
    },
  });
  invalidateTag("predictions");
  invalidateTag("stats");
  invalidateTag(`pred:${id}`);
  return serialize(updated);
}

export async function deletePrediction(id: number): Promise<void> {
  await db.prediction.delete({ where: { id } });
  invalidateTag("predictions");
  invalidateTag("stats");
  invalidateTag(`pred:${id}`);
}

export function isPremiumUser(user: SafeUser): boolean {
  return isPremiumActive(user);
}
