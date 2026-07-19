"use client";

import { useEffect, useState, useCallback } from "react";
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Search,
  Filter,
  Trophy,
  TrendingDown,
  Target,
  Clock,
} from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { apiPredictions, apiStats } from "@/lib/api-client";
import type { ClientPrediction, Stats } from "@/lib/types";
import { STATUS_CONFIG, type StatusKey } from "@/lib/constants";
import { cn, formatDateTime, formatDate } from "@/lib/utils";
import { Button, Spinner } from "./ui";
import { EmptyState, SkeletonStatRow } from "./empty-state";

type OutcomeFilter = "all" | "won" | "lost";
type DateFilter = "all" | "7d" | "30d";

export function ResultsTab() {
  const { openDetail } = useGoalEdge();
  const [outcome, setOutcome] = useState<OutcomeFilter>("all");
  const [dateFilter, setDateFilter] = useState<DateFilter>("all");
  const [rows, setRows] = useState<ClientPrediction[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch won + lost, then merge + filter client-side for date
      const fetches: Promise<{ predictions: ClientPrediction[] }>[] = [];
      if (outcome === "all" || outcome === "won") {
        fetches.push(apiPredictions({ status: "won", limit: 100 }));
      }
      if (outcome === "all" || outcome === "lost") {
        fetches.push(apiPredictions({ status: "lost", limit: 100 }));
      }
      const results = await Promise.all(fetches);
      let merged = results.flatMap((r) => r.predictions);
      // Sort by kickoff desc (most recent first)
      merged = merged.sort(
        (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime(),
      );
      // Date filter
      if (dateFilter !== "all") {
        const days = dateFilter === "7d" ? 7 : 30;
        const cutoff = Date.now() - days * 86400 * 1000;
        merged = merged.filter((p) => new Date(p.kickoffAt).getTime() >= cutoff);
      }
      setRows(merged);
      const s = await apiStats();
      setStats(s.stats);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [outcome, dateFilter]);

  useEffect(() => {
    const t = setTimeout(load, 150);
    return () => clearTimeout(t);
  }, [load]);

  const wonCount = rows.filter((r) => r.status === "won").length;
  const lostCount = rows.filter((r) => r.status === "lost").length;
  const settledCount = wonCount + lostCount;
  const streakCalc = calcStreak(rows);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Results &amp; history
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Settled tips with final scores and outcomes. Track performance over time.
        </p>
      </div>

      {/* Summary stats */}
      {loading && !stats ? (
        <SkeletonStatRow count={4} />
      ) : stats ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <ResultStat
            icon={<Trophy className="h-5 w-5" />}
            label="Win rate"
            value={`${stats.winRate}%`}
            sub={`${stats.won}W · ${stats.lost}L`}
            accent="emerald"
          />
          <ResultStat
            icon={<CheckCircle2 className="h-5 w-5" />}
            label="Won"
            value={wonCount}
            sub="in current view"
            accent="emerald"
          />
          <ResultStat
            icon={<XCircle className="h-5 w-5" />}
            label="Lost"
            value={lostCount}
            sub="in current view"
            accent="rose"
          />
          <ResultStat
            icon={<TrendingDown className="h-5 w-5" />}
            label="Current streak"
            value={streakCalc.label}
            sub={streakCalc.sub}
            accent={streakCalc.tone}
          />
        </div>
      ) : null}

      {/* Filters */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        {/* Outcome filter */}
        <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
          {(["all", "won", "lost"] as OutcomeFilter[]).map((o) => (
            <button
              key={o}
              onClick={() => setOutcome(o)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-semibold capitalize transition sm:flex-none",
                outcome === o
                  ? o === "won"
                    ? "bg-emerald-500 text-white shadow-sm"
                    : o === "lost"
                      ? "bg-rose-500 text-white shadow-sm"
                      : "bg-slate-900 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {o === "all" ? "All" : o}
            </button>
          ))}
        </div>

        {/* Date filter */}
        <div className="flex gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
          {([
            { key: "all", label: "All time" },
            { key: "7d", label: "7 days" },
            { key: "30d", label: "30 days" },
          ] as { key: DateFilter; label: string }[]).map((d) => (
            <button
              key={d.key}
              onClick={() => setDateFilter(d.key)}
              className={cn(
                "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none",
                dateFilter === d.key
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>

        <div className="hidden flex-1 sm:block" />
        <span className="text-sm text-slate-500">
          {loading ? "Loading…" : `${rows.length} settled tip${rows.length === 1 ? "" : "s"}`}
        </span>
      </div>

      {/* Results list */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6 text-emerald-500" />
        </div>
      ) : rows.length === 0 ? (
        <EmptyState
          icon={<Trophy className="h-7 w-7" />}
          title="No settled tips match your filters"
          description="Try widening the date range or switching to 'All' outcomes to see more results."
        />
      ) : (
        <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1">
          {rows.map((p) => {
            const sc = STATUS_CONFIG[p.status as StatusKey] ?? STATUS_CONFIG.upcoming;
            const won = p.status === "won";
            return (
              <button
                key={p.id}
                onClick={() => openDetail(p.id, p)}
                className={cn(
                  "group flex w-full items-center gap-3 rounded-2xl border bg-white p-4 text-left shadow-sm transition hover:border-slate-300 hover:shadow-md",
                  won ? "border-emerald-100" : "border-rose-100",
                )}
              >
                {/* Outcome icon */}
                <span
                  className={cn(
                    "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
                    won ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600",
                  )}
                >
                  {won ? <CheckCircle2 className="h-6 w-6" /> : <XCircle className="h-6 w-6" />}
                </span>

                {/* Match info */}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{p.leagueIcon}</span>
                    <p className="truncate text-sm font-bold text-slate-900">
                      {p.homeTeam} <span className="text-slate-300">v</span> {p.awayTeam}
                    </p>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    <Target className="mr-1 inline h-3 w-3" />
                    {p.tip} · {p.market} · {p.odds.toFixed(2)}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    <Calendar className="mr-1 inline h-3 w-3" />
                    {formatDateTime(p.kickoffAt)} · by {p.tipster}
                  </p>
                </div>

                {/* Score + badge */}
                <div className="flex shrink-0 flex-col items-end gap-1.5">
                  {p.scoreHome != null && p.scoreAway != null && (
                    <span
                      className={cn(
                        "rounded-lg px-2.5 py-1 text-sm font-bold",
                        won ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700",
                      )}
                    >
                      {p.scoreHome}–{p.scoreAway}
                    </span>
                  )}
                  <span
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold",
                      sc.badge,
                    )}
                  >
                    <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                    {sc.label}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

function ResultStat({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
  accent: "emerald" | "rose" | "amber" | "sky";
}) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-600",
    rose: "bg-rose-100 text-rose-600",
    amber: "bg-amber-100 text-amber-600",
    sky: "bg-sky-100 text-sky-600",
  } as const;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", map[accent])}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

// Calculate current win/loss streak from sorted (most-recent-first) results
function calcStreak(rows: ClientPrediction[]): {
  label: string;
  sub: string;
  tone: "emerald" | "rose" | "amber";
} {
  if (rows.length === 0) {
    return { label: "—", sub: "no settled tips", tone: "amber" };
  }
  // rows are sorted most-recent-first; streak counts from the latest backwards
  const latest = rows[0];
  if (!latest) return { label: "—", sub: "no data", tone: "amber" };
  const type = latest.status; // "won" or "lost"
  let count = 0;
  for (const r of rows) {
    if (r.status === type) count++;
    else break;
  }
  if (type === "won") {
    return {
      label: `${count}W`,
      sub: count >= 3 ? "🔥 on fire" : "winning run",
      tone: "emerald",
    };
  }
  return {
    label: `${count}L`,
    sub: count >= 3 ? "cold streak" : "losing run",
    tone: "rose",
  };
}
