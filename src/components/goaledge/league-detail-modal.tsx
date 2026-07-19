"use client";

import { useEffect, useState } from "react";
import {
  X,
  Trophy,
  Target,
  TrendingUp,
  Crown,
} from "lucide-react";
import { apiAnalytics, apiPredictions, type Analytics } from "@/lib/api-client";
import type { ClientPrediction } from "@/lib/types";
import { cn, formatDateTime, timeUntil, isPast } from "@/lib/utils";
import { STATUS_CONFIG, LEAGUES, type StatusKey } from "@/lib/constants";
import { Spinner } from "./ui";
import { useGoalEdge } from "@/hooks/use-goal-edge";

export function LeagueDetailModal({
  league,
  open,
  onClose,
}: {
  league: string | null;
  open: boolean;
  onClose: () => void;
}) {
  const { openDetail } = useGoalEdge();
  const [analytics, setAnalytics] = useState<Analytics | null>(null);
  const [tips, setTips] = useState<ClientPrediction[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open || !league) return;
    let active = true;
    setLoading(true);
    (async () => {
      try {
        const [a, p] = await Promise.all([
          apiAnalytics(),
          apiPredictions({ league, limit: 50 }),
        ]);
        if (!active) return;
        setAnalytics(a);
        setTips(p.predictions);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [open, league]);

  if (!open || !league) return null;

  const leagueData = analytics?.byLeague.find((l) => l.league === league);
  const leagueInfo = LEAGUES.find((l) => l.name === league);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        {/* Header */}
        <div className="bg-pitch relative px-6 pb-5 pt-5 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{leagueInfo?.icon ?? "⚽"}</span>
            <div>
              <h2 className="text-2xl font-bold">{league}</h2>
              <p className="text-sm text-slate-300">{leagueInfo?.country ?? "International"}</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Spinner className="h-6 w-6 text-emerald-500" />
            </div>
          ) : !leagueData ? (
            <div className="py-12 text-center text-sm text-slate-500">
              No data available for this league.
            </div>
          ) : (
            <>
              {/* League stats grid */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <LeagueStat
                  icon={<Target className="h-4 w-4" />}
                  label="Total tips"
                  value={leagueData.total}
                  accent="emerald"
                />
                <LeagueStat
                  icon={<Trophy className="h-4 w-4" />}
                  label="Win rate"
                  value={`${leagueData.winRate}%`}
                  accent="amber"
                />
                <LeagueStat
                  icon={<TrendingUp className="h-4 w-4" />}
                  label="Won / Lost"
                  value={`${leagueData.won}W / ${leagueData.lost}L`}
                  accent="sky"
                />
                <LeagueStat
                  icon={<Crown className="h-4 w-4" />}
                  label="Upcoming"
                  value={leagueData.pending}
                  accent="rose"
                />
              </div>

              {/* Win rate bar */}
              <div className="mt-5">
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-500">Settled performance</span>
                  <span className="font-bold text-emerald-600">{leagueData.winRate}%</span>
                </div>
                <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all"
                    style={{ width: `${leagueData.winRate}%` }}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {leagueData.won} won · {leagueData.lost} lost · {leagueData.pending} upcoming
                </p>
              </div>

              {/* Tips list */}
              <div className="mt-6">
                <h3 className="mb-3 text-sm font-bold text-slate-900">
                  Tips in {league}
                </h3>
                {tips.length === 0 ? (
                  <p className="text-sm text-slate-500">No tips found.</p>
                ) : (
                  <div className="max-h-72 space-y-2 overflow-y-auto pr-1">
                    {tips.map((p) => {
                      const sc = STATUS_CONFIG[p.status as StatusKey] ?? STATUS_CONFIG.upcoming;
                      const started = isPast(p.kickoffAt);
                      const hasScore = p.scoreHome != null && p.scoreAway != null;
                      return (
                        <button
                          key={p.id}
                          onClick={() => {
                            onClose();
                            openDetail(p.id, p);
                          }}
                          className="flex w-full items-center gap-3 rounded-xl border border-slate-100 bg-white p-3 text-left transition hover:border-slate-300 hover:shadow-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-sm font-bold text-slate-900">
                              {p.homeTeam} <span className="text-slate-300">v</span> {p.awayTeam}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {p.tip} · {p.odds.toFixed(2)}
                            </p>
                            <p className="text-xs text-slate-400">{formatDateTime(p.kickoffAt)}</p>
                          </div>
                          <div className="shrink-0 text-right">
                            {hasScore ? (
                              <span className="rounded-md bg-slate-100 px-2 py-0.5 text-xs font-bold text-slate-600">
                                {p.scoreHome}-{p.scoreAway}
                              </span>
                            ) : !started ? (
                              <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-600">
                                {timeUntil(p.kickoffAt)}
                              </span>
                            ) : null}
                            <span
                              className={cn(
                                "ml-1 inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-bold",
                                sc.badge,
                              )}
                            >
                              {sc.label}
                            </span>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

function LeagueStat({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent: "emerald" | "sky" | "amber" | "rose";
}) {
  const map = {
    emerald: "bg-emerald-100 text-emerald-600",
    sky: "bg-sky-100 text-sky-600",
    amber: "bg-amber-100 text-amber-600",
    rose: "bg-rose-100 text-rose-600",
  } as const;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", map[accent])}>
        {icon}
      </span>
      <p className="mt-2 text-lg font-bold text-slate-900">{value}</p>
      <p className="text-xs text-slate-500">{label}</p>
    </div>
  );
}
