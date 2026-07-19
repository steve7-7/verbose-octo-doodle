"use client";

import {
  X,
  Clock,
  Target,
  Crown,
  Lock,
  TrendingUp,
  Shield,
  Calendar,
  User as UserIcon,
  Ticket,
  Plus,
  Check,
  Activity,
  Flame,
  Swords,
  History,
  BarChart3,
} from "lucide-react";
import type { ClientPrediction } from "@/lib/types";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { STATUS_CONFIG, RISK_CONFIG, type StatusKey } from "@/lib/constants";
import { cn, formatDateTime, formatDate } from "@/lib/utils";
import { getTeamForm, getH2H, getStatComparison } from "@/lib/match-stats";
import { ConfidenceBar } from "./confidence-bar";
import { Badge, Spinner } from "./ui";

export function PredictionDetailModal() {
  const {
    detailId,
    detailPrediction,
    detailLoading,
    closeDetail,
    setTab,
    inSlip,
    addToSlip,
    removeFromSlip,
  } = useGoalEdge();

  if (detailId == null) return null;

  const p = detailPrediction;
  const loading = detailLoading;

  function openUnlock() {
    closeDetail();
    setTab("subscription");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={closeDetail}
        aria-hidden
      />
      <div className="relative flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        {/* Header */}
        <div className="bg-pitch relative px-6 pb-5 pt-5 text-white">
          <button
            onClick={closeDetail}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {loading || !p ? (
            <div className="flex items-center gap-3 py-2">
              <Spinner className="h-5 w-5" />
              <span className="text-sm text-slate-300">Loading prediction…</span>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <span className="text-2xl leading-none">{p.leagueIcon}</span>
                <div>
                  <p className="text-sm font-semibold text-white">{p.league}</p>
                  <p className="text-xs text-slate-300">{p.country}</p>
                </div>
                <div className="ml-auto flex items-center gap-1.5 pr-8">
                  {p.isPremium && (
                    <Badge className="bg-amber-400/20 text-amber-200 ring-1 ring-amber-300/30">
                      <Crown className="h-3 w-3" />
                      Premium
                    </Badge>
                  )}
                  <Badge
                    className={cn(
                      "ring-1",
                      STATUS_CONFIG[p.status as StatusKey]?.badge ?? "",
                    )}
                  >
                    <span
                      className={cn(
                        "h-1.5 w-1.5 rounded-full",
                        STATUS_CONFIG[p.status as StatusKey]?.dot,
                      )}
                    />
                    {STATUS_CONFIG[p.status as StatusKey]?.label}
                  </Badge>
                </div>
              </div>
              <h2 className="mt-3 text-2xl font-bold leading-tight">
                {p.homeTeam}{" "}
                <span className="text-base font-medium text-slate-400">vs</span>{" "}
                {p.awayTeam}
              </h2>
              <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-300">
                <span className="inline-flex items-center gap-1">
                  <Calendar className="h-3.5 w-3.5" />
                  {formatDate(p.kickoffAt)}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {formatDateTime(p.kickoffAt)}
                </span>
              </div>
            </>
          )}
        </div>

        {/* Body */}
        {loading || !p ? (
          <div className="flex items-center justify-center py-16">
            <Spinner className="h-6 w-6 text-emerald-500" />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-6 py-5">
            {/* Score / kickoff banner */}
            {p.scoreHome != null && p.scoreAway != null ? (
              <div className="mb-5 flex items-center justify-center gap-6 rounded-2xl border border-slate-200 bg-slate-50 py-5">
                <div className="text-center">
                  <p className="text-xs font-medium uppercase text-slate-400">Home</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-700">
                    {p.homeTeam}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-extrabold text-slate-900">
                    {p.scoreHome}
                  </span>
                  <span className="text-xl text-slate-300">:</span>
                  <span className="text-4xl font-extrabold text-slate-900">
                    {p.scoreAway}
                  </span>
                </div>
                <div className="text-center">
                  <p className="text-xs font-medium uppercase text-slate-400">Away</p>
                  <p className="mt-1 truncate text-sm font-bold text-slate-700">
                    {p.awayTeam}
                  </p>
                </div>
              </div>
            ) : null}

            {/* The tip */}
            <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 p-5">
              <div className={cn(p.locked && "select-none blur-[5px]")}>
                <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
                  <Target className="h-3.5 w-3.5" />
                  {p.market}
                </p>
                <div className="mt-2 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs text-slate-400">Recommended tip</p>
                    <p className="text-xl font-extrabold text-slate-900">{p.tip}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Odds</p>
                    <span className="rounded-xl bg-white px-3 py-1.5 text-lg font-bold text-emerald-600 ring-1 ring-emerald-200">
                      {p.odds.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
              {p.locked && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-slate-50/80">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Lock className="h-5 w-5" />
                  </span>
                  <p className="text-sm font-semibold text-slate-700">
                    Premium prediction locked
                  </p>
                  <button
                    onClick={openUnlock}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-amber-600"
                  >
                    <Crown className="h-4 w-4" />
                    Unlock with Premium · KES 100
                  </button>
                </div>
              )}
            </div>

            {/* Metrics row */}
            <div className="mt-5 grid grid-cols-3 gap-3">
              <Metric
                icon={<TrendingUp className="h-4 w-4" />}
                label="Confidence"
                value={`${p.confidence}%`}
                sub={<ConfidenceBar value={p.confidence} showLabel={false} className="mt-1" />}
              />
              <Metric
                icon={<Shield className="h-4 w-4" />}
                label="Risk"
                value={RISK_CONFIG[p.risk]?.label ?? p.risk}
                valueClass={
                  p.risk === "low"
                    ? "text-emerald-600"
                    : p.risk === "high"
                      ? "text-rose-600"
                      : "text-amber-600"
                }
              />
              <Metric
                icon={<Activity className="h-4 w-4" />}
                label="Status"
                value={STATUS_CONFIG[p.status as StatusKey]?.label ?? p.status}
              />
            </div>

            {/* Analysis */}
            <div className="mt-5">
              <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
                <Flame className="h-4 w-4 text-emerald-500" />
                In-depth analysis
              </h3>
              {p.locked ? (
                <div className="mt-2 rounded-xl border border-dashed border-amber-200 bg-amber-50/50 p-4 text-sm text-amber-700">
                  Full analysis available with Premium. Upgrade to read the reasoning,
                  key stats and value angle behind this pick.
                </div>
              ) : p.analysis ? (
                <p className="mt-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4 text-sm leading-relaxed text-slate-700">
                  {p.analysis}
                </p>
              ) : (
                <p className="mt-2 text-sm text-slate-400">
                  No analysis provided for this tip.
                </p>
              )}
            </div>

            {/* Head-to-head + recent form + stat comparison */}
            <H2HSection home={p.homeTeam} away={p.awayTeam} />

            {/* Tipster */}
            <div className="mt-5 flex items-center justify-between rounded-xl border border-slate-100 bg-white px-4 py-3">
              <div className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                  <UserIcon className="h-4 w-4" />
                </span>
                <div>
                  <p className="text-xs text-slate-400">Tipster</p>
                  <p className="text-sm font-semibold text-slate-800">{p.tipster}</p>
                </div>
              </div>
              <span className="text-xs text-slate-400">
                Posted {formatDate(p.createdAt)}
              </span>
            </div>
          </div>
        )}

        {/* Footer */}
        {!loading && p && !p.locked && (
          <div className="flex items-center justify-between gap-2 border-t border-slate-100 px-6 py-4">
            <p className="text-xs text-slate-400">
              {p.status === "upcoming"
                ? "Add this pick to your accumulator slip."
                : "This tip has already kicked off."}
            </p>
            {p.status === "upcoming" && (
              <SlipButton prediction={p} inSlip={inSlip(p.id)} onAdd={() => addToSlip({
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
              })} onRemove={() => removeFromSlip(p.id)} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function Metric({
  icon,
  label,
  value,
  valueClass,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  valueClass?: string;
  sub?: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3">
      <p className="flex items-center gap-1 text-xs font-medium text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </p>
      <p className={cn("mt-1 text-lg font-bold text-slate-900", valueClass)}>{value}</p>
      {sub}
    </div>
  );
}

function SlipButton({
  prediction: _p,
  inSlip,
  onAdd,
  onRemove,
}: {
  prediction: ClientPrediction;
  inSlip: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  void _p;
  if (inSlip) {
    return (
      <button
        onClick={onRemove}
        className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
      >
        <Check className="h-4 w-4" />
        In slip — remove
      </button>
    );
  }
  return (
    <button
      onClick={onAdd}
      className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-emerald-600"
    >
      <Ticket className="h-4 w-4" />
      <Plus className="h-4 w-4" />
      Add to slip
    </button>
  );
}

// Head-to-head + recent form + stat comparison section.
// Uses deterministic mock data generated from team names.
function H2HSection({ home, away }: { home: string; away: string }) {
  const h2h = getH2H(home, away);
  const homeForm = getTeamForm(home);
  const awayForm = getTeamForm(away);
  const stats = getStatComparison(home, away);

  return (
    <div className="mt-5 space-y-4">
      {/* Recent form */}
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <History className="h-4 w-4 text-emerald-500" />
          Recent form (last 5)
        </h3>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          <FormCard form={homeForm} />
          <FormCard form={awayForm} />
        </div>
      </div>

      {/* Head-to-head */}
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <Swords className="h-4 w-4 text-rose-500" />
          Head-to-head
        </h3>
        <div className="mt-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between text-center text-xs font-semibold">
            <div className="flex-1">
              <p className="text-emerald-600">{h2h.homeWins}</p>
              <p className="truncate text-slate-500">{home}</p>
            </div>
            <div className="flex-1">
              <p className="text-slate-500">{h2h.draws}</p>
              <p className="text-slate-400">Draws</p>
            </div>
            <div className="flex-1">
              <p className="text-rose-600">{h2h.awayWins}</p>
              <p className="truncate text-slate-500">{away}</p>
            </div>
          </div>
          {/* Visual bar */}
          <div className="mt-3 flex h-2 overflow-hidden rounded-full bg-slate-200">
            <div className="bg-emerald-500" style={{ width: `${(h2h.homeWins / 5) * 100}%` }} />
            <div className="bg-slate-300" style={{ width: `${(h2h.draws / 5) * 100}%` }} />
            <div className="bg-rose-500" style={{ width: `${(h2h.awayWins / 5) * 100}%` }} />
          </div>
          {/* Last meetings */}
          <div className="mt-3 space-y-1.5">
            {h2h.matches.slice(0, 3).map((m, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-lg bg-white px-3 py-1.5 text-xs ring-1 ring-slate-100"
              >
                <span className="text-slate-400">{m.date}</span>
                <span className="font-medium text-slate-700">
                  <span className="truncate">{m.home}</span>{" "}
                  <span
                    className={cn(
                      "mx-1 rounded px-1.5 py-0.5 font-bold",
                      m.scoreHome > m.scoreAway
                        ? "bg-emerald-50 text-emerald-700"
                        : m.scoreHome < m.scoreAway
                          ? "bg-rose-50 text-rose-700"
                          : "bg-slate-100 text-slate-600",
                    )}
                  >
                    {m.scoreHome}-{m.scoreAway}
                  </span>
                  <span className="truncate">{m.away}</span>
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stat comparison */}
      <div>
        <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
          <BarChart3 className="h-4 w-4 text-sky-500" />
          Stats comparison
        </h3>
        <div className="mt-2 space-y-2 rounded-xl border border-slate-100 bg-slate-50/60 p-4">
          {stats.map((s) => {
            const total = s.home + s.away || 1;
            const homePct = (s.home / total) * 100;
            const awayPct = (s.away / total) * 100;
            return (
              <div key={s.label}>
                <div className="mb-0.5 flex items-center justify-between text-xs">
                  <span className={cn("font-bold", s.homeBetter ? "text-emerald-600" : "text-slate-500")}>
                    {s.home}
                  </span>
                  <span className="font-medium text-slate-500">{s.label}</span>
                  <span className={cn("font-bold", !s.homeBetter ? "text-emerald-600" : "text-slate-500")}>
                    {s.away}
                  </span>
                </div>
                <div className="flex h-1.5 gap-0.5">
                  <div className="flex flex-1 justify-end overflow-hidden rounded-l-full bg-slate-200">
                    <div
                      className={cn("h-full rounded-l-full", s.homeBetter ? "bg-emerald-500" : "bg-slate-400")}
                      style={{ width: `${homePct}%` }}
                    />
                  </div>
                  <div className="flex flex-1 overflow-hidden rounded-r-full bg-slate-200">
                    <div
                      className={cn("h-full rounded-r-full", !s.homeBetter ? "bg-emerald-500" : "bg-slate-400")}
                      style={{ width: `${awayPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function FormCard({ form }: { form: { team: string; results: ("W" | "D" | "L")[]; goalsFor: number; goalsAgainst: number; cleanSheets: number } }) {
  const colorMap = {
    W: "bg-emerald-500 text-white",
    D: "bg-slate-300 text-slate-700",
    L: "bg-rose-500 text-white",
  } as const;
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/60 p-3.5">
      <p className="truncate text-sm font-bold text-slate-800">{form.team}</p>
      <div className="mt-2 flex gap-1">
        {form.results.map((r, i) => (
          <span
            key={i}
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold",
              colorMap[r],
            )}
            title={r === "W" ? "Win" : r === "D" ? "Draw" : "Loss"}
          >
            {r}
          </span>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-3 gap-1 text-center text-xs">
        <div>
          <p className="font-bold text-slate-700">{form.goalsFor}</p>
          <p className="text-slate-400">GF</p>
        </div>
        <div>
          <p className="font-bold text-slate-700">{form.goalsAgainst}</p>
          <p className="text-slate-400">GA</p>
        </div>
        <div>
          <p className="font-bold text-emerald-600">{form.cleanSheets}</p>
          <p className="text-slate-400">CS</p>
        </div>
      </div>
    </div>
  );
}
