"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Trophy,
  Target,
  Crown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { apiPredictions, apiStats } from "@/lib/api-client";
import type { ClientPrediction, Stats } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { StatCard } from "./stat-card";
import { PredictionCard } from "./prediction-card";
import { SkeletonGrid, SkeletonStatRow, EmptyState } from "./empty-state";
import { StaggerGrid, StaggerItem } from "./motion";
import { LiveMatches } from "./live-matches";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export function OverviewTab() {
  const { user, isPremium, setTab, openDetail } = useGoalEdge();
  const [stats, setStats] = useState<Stats | null>(null);
  const [upcoming, setUpcoming] = useState<ClientPrediction[]>([]);
  const [results, setResults] = useState<ClientPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, up, won, lost] = await Promise.all([
          apiStats(),
          apiPredictions({ status: "upcoming", limit: 6 }),
          apiPredictions({ status: "won", limit: 8 }),
          apiPredictions({ status: "lost", limit: 8 }),
        ]);
        if (!active) return;
        setStats(s.stats);
        setUpcoming(up.predictions);
        const merged = [...won.predictions, ...lost.predictions].sort(
          (a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime(),
        );
        setResults(merged.slice(0, 6));
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isPremium]);

  if (!user) return null;
  const firstName = user.name.split(" ")[0] ?? user.name;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          {greeting()}, {firstName} 👋
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s your snapshot of today&apos;s football action.
        </p>
      </div>

      {/* Stats grid */}
      {loading && !stats ? (
        <SkeletonStatRow />
      ) : (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <StatCard
            icon={<Target className="h-5 w-5" />}
            label="Active tips"
            value={stats?.upcoming ?? "—"}
            sub="Upcoming matches"
            accent="emerald"
          />
          <StatCard
            icon={<Trophy className="h-5 w-5" />}
            label="Win rate"
            value={stats ? `${stats.winRate}%` : "—"}
            sub={stats ? `${stats.won}W · ${stats.lost}L settled` : "—"}
            accent="amber"
          />
          <StatCard
            icon={<TrendingUp className="h-5 w-5" />}
            label="Total tips"
            value={stats?.total ?? "—"}
            sub="All-time predictions"
            accent="sky"
          />
          <StatCard
            icon={<Crown className="h-5 w-5" />}
            label="Premium picks"
            value={stats?.premium ?? "—"}
            sub="High-value tips"
            accent="rose"
          />
        </div>
      )}

      {/* Upgrade banner */}
      {!isPremium && (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-600/20 sm:p-7">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-lg font-bold">Unlock Premium predictions</h2>
              </div>
              <p className="mt-1 max-w-lg text-sm text-emerald-50">
                Get unlimited access to in-depth analysis, accumulator slips and real-time value
                alerts. Just KES 100 for 24 hours.
              </p>
            </div>
            <button
              onClick={() => setTab("subscription")}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              <Crown className="h-4 w-4" />
              Upgrade now
            </button>
          </div>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Upcoming tips */}
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming tips</h2>
            <button
              onClick={() => setTab("predictions")}
              className="inline-flex items-center gap-1 text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              See all <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          {loading ? (
            <SkeletonGrid count={4} className="sm:grid-cols-2" />
          ) : upcoming.length === 0 ? (
            <EmptyState
              icon={<Target className="h-7 w-7" />}
              title="No upcoming tips right now"
              description="New predictions drop daily. Check back soon for fresh picks."
            />
          ) : (
            <StaggerGrid className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((p) => (
                <StaggerItem key={p.id}>
                  <PredictionCard
                    prediction={p}
                    onUnlock={() => setTab("subscription")}
                    onView={(id) => openDetail(id, p)}
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          )}
        </section>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Live matches widget */}
          <LiveMatches />

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Recent form</h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {results.length === 0 && (
                <p className="text-sm text-slate-400">No settled tips yet.</p>
              )}
              {results.map((r) => (
                <span
                  key={r.id}
                  title={`${r.homeTeam} vs ${r.awayTeam}`}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white",
                    r.status === "won" ? "bg-emerald-500" : "bg-rose-500",
                  )}
                >
                  {r.status === "won" ? "W" : "L"}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {results.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {r.homeTeam} v {r.awayTeam}
                    </p>
                    <p className="text-xs text-slate-400">{formatDateTime(r.kickoffAt)}</p>
                  </div>
                  {r.status === "won" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Performance</h3>
            <div className="mt-4 space-y-3">
              <PerfRow
                label="Wins"
                value={stats?.won ?? 0}
                total={stats?.settled ?? 0}
                color="bg-emerald-500"
              />
              <PerfRow
                label="Losses"
                value={stats?.lost ?? 0}
                total={stats?.settled ?? 0}
                color="bg-rose-500"
              />
            </div>
            <p className="mt-4 text-xs text-slate-400">
              {stats?.winRate ?? 0}% hit rate across {stats?.settled ?? 0} settled tips.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}

function PerfRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
