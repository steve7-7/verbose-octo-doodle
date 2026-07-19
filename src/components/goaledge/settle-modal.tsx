"use client";

import { useState } from "react";
import { X, Check, XCircle, Ban, Zap, Trophy } from "lucide-react";
import type { ClientPrediction } from "@/lib/types";
import { apiUpdatePrediction } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Button, Spinner } from "./ui";
import { useToast } from "@/hooks/use-toast";

type Outcome = "won" | "lost" | "void";

export function SettleModal({
  open,
  prediction,
  onClose,
  onSettled,
}: {
  open: boolean;
  prediction: ClientPrediction | null;
  onClose: () => void;
  onSettled: () => void;
}) {
  if (!open || !prediction) return null;
  // Remount inner component per-prediction so state resets cleanly
  return (
    <SettleModalInner
      key={prediction.id}
      prediction={prediction}
      onClose={onClose}
      onSettled={onSettled}
    />
  );
}

function SettleModalInner({
  prediction,
  onClose,
  onSettled,
}: {
  prediction: ClientPrediction;
  onClose: () => void;
  onSettled: () => void;
}) {
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [scoreHome, setScoreHome] = useState(
    prediction.scoreHome != null ? String(prediction.scoreHome) : "",
  );
  const [scoreAway, setScoreAway] = useState(
    prediction.scoreAway != null ? String(prediction.scoreAway) : "",
  );
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { toast } = useToast();

  async function settle() {
    if (!outcome) return;
    setBusy(true);
    setErr(null);
    try {
      await apiUpdatePrediction(prediction.id, {
        status: outcome,
        scoreHome: scoreHome === "" ? null : Number(scoreHome),
        scoreAway: scoreAway === "" ? null : Number(scoreAway),
      });
      toast({
        title: "Tip settled",
        description: `${prediction.homeTeam} vs ${prediction.awayTeam} → ${outcome.toUpperCase()}${
          scoreHome !== "" && scoreAway !== "" ? ` (${scoreHome}-${scoreAway})` : ""
        }`,
      });
      onSettled();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Settle failed");
      toast({
        title: "Settle failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  const outcomes: {
    key: Outcome;
    label: string;
    icon: typeof Trophy;
    color: string;
    activeColor: string;
  }[] = [
    {
      key: "won",
      label: "Won",
      icon: Check,
      color: "text-emerald-600 border-slate-200 hover:border-emerald-300 hover:bg-emerald-50",
      activeColor: "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200",
    },
    {
      key: "lost",
      label: "Lost",
      icon: XCircle,
      color: "text-rose-600 border-slate-200 hover:border-rose-300 hover:bg-rose-50",
      activeColor: "border-rose-500 bg-rose-50 text-rose-700 ring-2 ring-rose-200",
    },
    {
      key: "void",
      label: "Void",
      icon: Ban,
      color: "text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50",
      activeColor: "border-slate-500 bg-slate-50 text-slate-700 ring-2 ring-slate-200",
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        {/* Header */}
        <div className="bg-pitch relative px-6 pb-5 pt-5 text-white">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 ring-1 ring-white/20">
              <Zap className="h-5 w-5 text-emerald-300" />
            </span>
            <div>
              <h2 className="text-lg font-bold">Quick settle</h2>
              <p className="text-xs text-slate-300">Mark the result in seconds</p>
            </div>
          </div>
          <p className="mt-3 text-sm font-semibold text-white">
            {prediction.homeTeam} <span className="text-slate-400">vs</span> {prediction.awayTeam}
          </p>
          <p className="text-xs text-slate-300">
            {prediction.leagueIcon} {prediction.league} · Tip: {prediction.tip}
          </p>
        </div>

        {/* Body */}
        <div className="px-6 py-5">
          <p className="mb-2 text-sm font-semibold text-slate-700">Result</p>
          <div className="grid grid-cols-3 gap-2">
            {outcomes.map((o) => {
              const active = outcome === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setOutcome(o.key)}
                  className={cn(
                    "flex flex-col items-center gap-1.5 rounded-xl border-2 px-2 py-3 text-sm font-bold transition",
                    active ? o.activeColor : cn("bg-white text-slate-700", o.color),
                  )}
                >
                  <o.icon className="h-5 w-5" />
                  {o.label}
                </button>
              );
            })}
          </div>

          {/* Score */}
          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold text-slate-700">
              Final score <span className="font-normal text-slate-400">(optional)</span>
            </p>
            <div className="flex items-center justify-center gap-3">
              <div className="flex-1">
                <label className="mb-1 block truncate text-center text-xs text-slate-400">
                  {prediction.homeTeam}
                </label>
                <input
                  type="number"
                  min={0}
                  value={scoreHome}
                  onChange={(e) => setScoreHome(e.target.value)}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder="–"
                />
              </div>
              <span className="pt-6 text-lg font-medium text-slate-300">:</span>
              <div className="flex-1">
                <label className="mb-1 block truncate text-center text-xs text-slate-400">
                  {prediction.awayTeam}
                </label>
                <input
                  type="number"
                  min={0}
                  value={scoreAway}
                  onChange={(e) => setScoreAway(e.target.value)}
                  className="h-14 w-full rounded-xl border border-slate-200 bg-slate-50 text-center text-2xl font-bold text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                  placeholder="–"
                />
              </div>
            </div>
          </div>

          {err && (
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              {err}
            </div>
          )}

          <div className="mt-6 flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button variant="outline" onClick={onClose} disabled={busy}>
              Cancel
            </Button>
            <Button onClick={settle} disabled={busy || !outcome}>
              {busy ? <Spinner /> : (
                <>
                  <Trophy className="h-4 w-4" />
                  Settle tip
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
