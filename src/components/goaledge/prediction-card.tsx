"use client";

import { useEffect, useState } from "react";
import {
  Clock,
  Lock,
  Crown,
  Target,
  ChevronRight,
  Plus,
  Check,
  Ticket,
} from "lucide-react";
import type { ClientPrediction } from "@/lib/types";
import { STATUS_CONFIG, type StatusKey } from "@/lib/constants";
import { cn, formatDateTime, isPast } from "@/lib/utils";
import { ConfidenceBar } from "./confidence-bar";
import { Badge } from "./ui";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { useToast } from "@/hooks/use-toast";

// Live countdown that re-renders every minute
function useLiveCountdown(kickoffAt: string, started: boolean) {
  const [, setTick] = useState(0);
  useEffect(() => {
    if (started) return;
    const i = setInterval(() => setTick((t) => t + 1), 60_000);
    return () => clearInterval(i);
  }, [started]);
}

function fmtCountdown(ms: number): string {
  if (ms <= 0) return "Started";
  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${mins}m`;
  return `${mins}m`;
}

export function PredictionCard({
  prediction,
  onUnlock,
  onView,
  compact = false,
}: {
  prediction: ClientPrediction;
  onUnlock?: () => void;
  onView?: (id: number) => void;
  compact?: boolean;
}) {
  const p = prediction;
  const status = p.status as StatusKey;
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;
  const locked = p.locked;
  const started = isPast(p.kickoffAt);
  const hasScore = p.scoreHome != null && p.scoreAway != null;
  const { inSlip, addToSlip, removeFromSlip } = useGoalEdge();
  const added = inSlip(p.id);
  const canSlip = !locked && p.status === "upcoming";
  const { toast } = useToast();

  useLiveCountdown(p.kickoffAt, started);

  const countdown = fmtCountdown(new Date(p.kickoffAt).getTime() - Date.now());

  function toggleSlip(e: React.MouseEvent) {
    e.stopPropagation();
    if (added) {
      removeFromSlip(p.id);
      toast({
        title: "Removed from slip",
        description: `${p.homeTeam} vs ${p.awayTeam}`,
      });
    } else {
      addToSlip({
        id: p.id,
        homeTeam: p.homeTeam,
        awayTeam: p.awayTeam,
        league: p.league,
        leagueIcon: p.leagueIcon,
        tip: p.tip,
        market: p.market,
        odds: p.odds,
        kickoffAt: p.kickoffAt,
        isPremium: p.isPremium,
      });
      toast({
        title: "Added to slip",
        description: `${p.homeTeam} vs ${p.awayTeam} · ${p.odds.toFixed(2)}`,
      });
    }
  }

  return (
    <div
      onClick={() => !locked && onView?.(p.id)}
      role="button"
      tabIndex={locked ? -1 : 0}
      onKeyDown={(e) => {
        if (!locked && (e.key === "Enter" || e.key === " ")) {
          e.preventDefault();
          onView?.(p.id);
        }
      }}
      className={cn(
        "group relative flex flex-col rounded-2xl border bg-white p-5 shadow-sm shadow-slate-900/[0.03] transition",
        p.isPremium
          ? "border-amber-200 ring-1 ring-amber-100"
          : "border-slate-200",
        !locked && "cursor-pointer hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-lg hover:shadow-emerald-900/[0.06]",
        compact && "p-4",
      )}
    >
      {/* Premium gradient top accent */}
      {p.isPremium && (
        <div className="absolute inset-x-0 top-0 h-1 rounded-t-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-orange-500" />
      )}
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 items-center gap-2">
          <span className="text-lg leading-none">{p.leagueIcon}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700">{p.league}</p>
            <p className="text-xs text-slate-400">{p.country}</p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          {p.isPremium && (
            <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">
              <Crown className="h-3 w-3" />
              Premium
            </Badge>
          )}
          <Badge className={sc.badge}>
            <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
            {sc.label}
          </Badge>
        </div>
      </div>

      <div className="mt-4">
        <p className="text-base font-bold leading-snug text-slate-900">
          {p.homeTeam}{" "}
          <span className="mx-1 text-sm font-medium text-slate-300">vs</span>{" "}
          {p.awayTeam}
        </p>
        <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="inline-flex items-center gap-1">
            <Clock className="h-3.5 w-3.5" />
            {formatDateTime(p.kickoffAt)}
          </span>
          {hasScore ? (
            <span className="rounded-md bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-600">
              FT {p.scoreHome}–{p.scoreAway}
            </span>
          ) : !started ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-600">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
              </span>
              in {countdown}
            </span>
          ) : null}
        </div>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-xl border border-slate-100 bg-slate-50 p-3.5">
        <div className={cn(locked && "select-none blur-[4px]")}>
          <p className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wide text-slate-400">
            <Target className="h-3.5 w-3.5" />
            {p.market}
          </p>
          <div className="mt-1 flex items-center justify-between gap-2">
            <p className="text-sm font-bold text-slate-900">{p.tip}</p>
            <span className="shrink-0 rounded-lg bg-white px-2 py-1 text-sm font-bold text-emerald-600 ring-1 ring-slate-200">
              {p.odds.toFixed(2)}
            </span>
          </div>
        </div>
        {locked && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-50/70">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-amber-100 text-amber-600">
              <Lock className="h-4 w-4" />
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnlock?.();
              }}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition hover:bg-amber-600"
            >
              <Crown className="h-3.5 w-3.5" />
              Unlock with Premium
            </button>
          </div>
        )}
      </div>

      <div className="mt-4">
        <ConfidenceBar value={p.confidence} />
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
        <span className="text-xs font-medium text-slate-400">by {p.tipster}</span>
        <div className="flex items-center gap-1">
          {canSlip && (
            <button
              onClick={toggleSlip}
              className={cn(
                "inline-flex items-center gap-1 rounded-lg px-2 py-1.5 text-xs font-semibold transition",
                added
                  ? "bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                  : "text-slate-500 hover:bg-slate-100 hover:text-slate-700",
              )}
              title={added ? "Remove from slip" : "Add to bet slip"}
            >
              <Ticket className="h-3.5 w-3.5" />
              {added ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
            </button>
          )}
          {!locked && (
            <span className="ml-1 inline-flex items-center gap-0.5 rounded-lg px-2 py-1.5 text-xs font-semibold text-emerald-600 transition group-hover:bg-emerald-50">
              View
              <ChevronRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
