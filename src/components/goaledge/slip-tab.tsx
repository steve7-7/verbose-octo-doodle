"use client";

import {
  Ticket,
  Trash2,
  X,
  Calculator,
  Crown,
  TrendingUp,
  Info,
  Save,
  Download,
  RefreshCw,
  Share2,
  Check,
} from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { cn, formatDateTime, timeUntil, isPast } from "@/lib/utils";
import { Button } from "./ui";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export function SlipTab() {
  const { slip, removeFromSlip, clearSlip, setTab, isPremium } = useGoalEdge();
  const { toast } = useToast();
  const [stake, setStake] = useState("100");
  const [saved, setSaved] = useState(false);
  const [shared, setShared] = useState(false);

  const combinedOdds = slip.reduce((acc, p) => acc * p.odds, 1);
  const stakeNum = parseFloat(stake) || 0;
  const potentialReturn = stakeNum * combinedOdds;
  const potentialProfit = potentialReturn - stakeNum;

  function saveSlip() {
    // Serialize slip to a text file the user can download
    const lines = slip.map(
      (p, i) =>
        `${i + 1}. ${p.homeTeam} vs ${p.awayTeam} — ${p.tip} @ ${p.odds.toFixed(2)} (${p.league})`,
    );
    const text = `GoalEdge Accumulator Slip\nGenerated: ${new Date().toLocaleString()}\n\n${lines.join("\n")}\n\nCombined odds: ${combinedOdds.toFixed(2)}\nStake: KES ${stakeNum}\nPotential return: KES ${potentialReturn.toFixed(2)}\nPotential profit: KES ${potentialProfit.toFixed(2)}\n\n18+ · Please gamble responsibly.`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goaledge-slip-${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  function shareSlip() {
    const lines = slip.map(
      (p, i) =>
        `${i + 1}. ${p.homeTeam} vs ${p.awayTeam} — ${p.tip} @ ${p.odds.toFixed(2)}`,
    );
    const text = `⚽ GoalEdge Accumulator Slip\n\n${lines.join("\n")}\n\n🔥 Combined odds: ${combinedOdds.toFixed(2)}\n💰 Stake: KES ${stakeNum} → Return: KES ${potentialReturn.toFixed(2)}\n\n18+ · Please gamble responsibly.`;
    if (navigator.share) {
      navigator
        .share({ title: "GoalEdge Accumulator", text })
        .catch(() => {});
    } else {
      navigator.clipboard
        .writeText(text)
        .then(() => {
          setShared(true);
          toast({ title: "Slip copied to clipboard", description: "Share it anywhere!" });
          setTimeout(() => setShared(false), 2000);
        })
        .catch(() => {
          toast({ title: "Copy failed", description: "Please try again.", variant: "destructive" });
        });
    }
  }

  if (slip.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bet slip
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Build an accumulator from any upcoming tips and track combined odds in real time.
          </p>
        </div>

        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Ticket className="h-7 w-7" />
          </span>
          <h3 className="mt-4 text-base font-bold text-slate-800">Your slip is empty</h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Browse upcoming tips and tap the <Ticket className="inline h-3.5 w-3.5" /> ticket icon on any
            card to add it here. Combined odds and potential returns update instantly.
          </p>
          <Button onClick={() => setTab("predictions")} className="mt-5">
            <TrendingUp className="h-4 w-4" />
            Browse tips
          </Button>
        </div>

        <SlipTips />
      </div>
    );
  }

  const allPremium = slip.every((p) => !p.isPremium);
  const hasPremium = slip.some((p) => p.isPremium);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Bet slip
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {slip.length} pick{slip.length === 1 ? "" : "s"} on this accumulator.
          </p>
        </div>
        <Button variant="outline" onClick={clearSlip} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
          <Trash2 className="h-4 w-4" />
          Clear all
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Slip list */}
        <div className="space-y-3 lg:col-span-2">
          {slip.map((p, i) => {
            const started = isPast(p.kickoffAt);
            return (
              <div
                key={p.id}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:border-slate-300"
              >
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-sm font-bold text-emerald-700">
                  {i + 1}
                </span>
                <span className="text-xl">{p.leagueIcon}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-slate-900">
                    {p.homeTeam} <span className="text-slate-300">v</span> {p.awayTeam}
                  </p>
                  <p className="truncate text-xs text-slate-500">
                    {p.tip} · {p.market}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">
                    {formatDateTime(p.kickoffAt)}
                    {!started && (
                      <span className="ml-2 rounded bg-emerald-50 px-1.5 py-0.5 font-medium text-emerald-600">
                        in {timeUntil(p.kickoffAt)}
                      </span>
                    )}
                  </p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="rounded-lg bg-emerald-50 px-2 py-1 text-sm font-bold text-emerald-600 ring-1 ring-emerald-200">
                    {p.odds.toFixed(2)}
                  </p>
                  {p.isPremium && (
                    <span className="mt-1 inline-flex items-center gap-0.5 text-[10px] font-semibold text-amber-600">
                      <Crown className="h-2.5 w-2.5" />
                      Premium
                    </span>
                  )}
                </div>
                <button
                  onClick={() => removeFromSlip(p.id)}
                  className="shrink-0 rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                  aria-label="Remove"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            );
          })}

          {hasPremium && !isPremium && (
            <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
              <Crown className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
              <div className="flex-1">
                <p className="text-sm font-semibold text-amber-800">
                  Your slip includes premium picks
                </p>
                <p className="mt-0.5 text-xs text-amber-700">
                  Unlock premium to view the full tips and analysis behind these selections.
                </p>
              </div>
              <Button size="sm" onClick={() => setTab("subscription")}>
                Unlock
              </Button>
            </div>
          )}
        </div>

        {/* Summary panel */}
        <aside className="space-y-4">
          <div className="sticky top-4 space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
              <Calculator className="h-4 w-4 text-emerald-500" />
              Accumulator summary
            </h3>

            <div className="space-y-2 border-y border-slate-100 py-4">
              <Row label="Selections" value={String(slip.length)} />
              <Row
                label="Combined odds"
                value={combinedOdds.toFixed(2)}
                valueClass="text-emerald-600"
                bold
              />
              {allPremium && (
                <Row label="Premium picks" value="None" muted />
              )}
            </div>

            <label className="block">
              <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Stake (KES)
              </span>
              <div className="relative">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400">
                  Ksh
                </span>
                <input
                  type="number"
                  min="1"
                  value={stake}
                  onChange={(e) => setStake(e.target.value)}
                  className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-3 text-sm font-semibold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                />
              </div>
            </label>

            <div className="space-y-2 rounded-xl bg-emerald-50 p-4">
              <Row label="Potential return" value={`KES ${potentialReturn.toFixed(2)}`} valueClass="text-emerald-700" bold />
              <Row
                label="Potential profit"
                value={`KES ${potentialProfit.toFixed(2)}`}
                valueClass="text-emerald-700"
                bold
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <Button variant="outline" onClick={clearSlip}>
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
              <Button variant="outline" onClick={shareSlip}>
                {shared ? (
                  <>
                    <Check className="h-4 w-4" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Share2 className="h-4 w-4" />
                    Share
                  </>
                )}
              </Button>
              <Button onClick={saveSlip}>
                {saved ? (
                  <>
                    <Save className="h-4 w-4" />
                    Saved!
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4" />
                    Save
                  </>
                )}
              </Button>
            </div>

            <p className="flex items-start gap-1.5 text-xs text-slate-400">
              <Info className="mt-0.5 h-3 w-3 shrink-0" />
              Combined odds = product of all selection odds. All legs must win for the accumulator to
              pay out. 18+ · gamble responsibly.
            </p>
          </div>
        </aside>
      </div>

      <SlipTips />
    </div>
  );
}

function Row({
  label,
  value,
  valueClass,
  bold,
  muted,
}: {
  label: string;
  value: string;
  valueClass?: string;
  bold?: boolean;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className={cn(muted ? "text-slate-400" : "text-slate-500")}>{label}</span>
      <span
        className={cn(
          "font-semibold",
          bold ? "text-base" : "",
          valueClass ?? (muted ? "text-slate-400" : "text-slate-800"),
        )}
      >
        {value}
      </span>
    </div>
  );
}

function SlipTips() {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      <Tip
        icon={<TrendingUp className="h-5 w-5" />}
        title="Combine value"
        desc="Stacking 2-4 well-researched picks balances risk and reward better than huge accumulators."
      />
      <Tip
        icon={<Ticket className="h-5 w-5" />}
        title="Mix markets"
        desc="Don't just stack match results — Over/Under and BTTS markets diversify your slip."
      />
      <Tip
        icon={<Info className="h-5 w-5" />}
        title="Check kickoffs"
        desc="All legs must win for the accumulator to pay. Avoid overlapping or risky late picks."
      />
    </div>
  );
}

function Tip({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        {icon}
      </span>
      <h4 className="mt-3 font-bold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}
