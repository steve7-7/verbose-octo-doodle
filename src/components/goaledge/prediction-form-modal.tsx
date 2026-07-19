"use client";

import { useEffect, useState } from "react";
import { X, Save, Trash2 } from "lucide-react";
import { LEAGUES, MARKETS, RISK_LEVELS } from "@/lib/constants";
import type { ClientPrediction } from "@/lib/types";
import {
  apiCreatePrediction,
  apiUpdatePrediction,
  apiDeletePrediction,
} from "@/lib/api-client";
import { Button, Spinner } from "./ui";
import { useToast } from "@/hooks/use-toast";

type FormState = {
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueIcon: string;
  country: string;
  kickoffAt: string; // datetime-local
  tip: string;
  market: string;
  odds: string;
  confidence: number;
  risk: "low" | "medium" | "high";
  analysis: string;
  isPremium: boolean;
  status: "upcoming" | "won" | "lost" | "void";
  scoreHome: string;
  scoreAway: string;
  tipster: string;
};

function toLocalInput(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyForm(): FormState {
  return {
    homeTeam: "",
    awayTeam: "",
    league: "Premier League",
    leagueIcon: "🦁",
    country: "England",
    kickoffAt: toLocalInput(new Date(Date.now() + 6 * 3600 * 1000)),
    tip: "",
    market: "Match Result",
    odds: "1.80",
    confidence: 75,
    risk: "medium",
    analysis: "",
    isPremium: false,
    status: "upcoming",
    scoreHome: "",
    scoreAway: "",
    tipster: "Arena Tipster",
  };
}

function fromPrediction(p: ClientPrediction): FormState {
  return {
    homeTeam: p.homeTeam,
    awayTeam: p.awayTeam,
    league: p.league,
    leagueIcon: p.leagueIcon,
    country: p.country,
    kickoffAt: toLocalInput(new Date(p.kickoffAt)),
    tip: p.tip,
    market: p.market,
    odds: String(p.odds),
    confidence: p.confidence,
    risk: p.risk,
    analysis: p.analysis ?? "",
    isPremium: p.isPremium,
    status: p.status,
    scoreHome: p.scoreHome != null ? String(p.scoreHome) : "",
    scoreAway: p.scoreAway != null ? String(p.scoreAway) : "",
    tipster: p.tipster,
  };
}

export function PredictionFormModal({
  open,
  editing,
  onClose,
  onSaved,
}: {
  open: boolean;
  editing: ClientPrediction | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<FormState>(emptyForm());
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      setForm(editing ? fromPrediction(editing) : emptyForm());
      setErr(null);
    }
  }, [open, editing]);

  if (!open) return null;

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  // Auto-sync league icon + country when league changes
  function onLeagueChange(name: string) {
    const l = LEAGUES.find((x) => x.name === name);
    setForm((f) => ({
      ...f,
      league: name,
      leagueIcon: l?.icon ?? f.leagueIcon,
      country: l?.country ?? f.country,
    }));
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      const payload = {
        homeTeam: form.homeTeam.trim(),
        awayTeam: form.awayTeam.trim(),
        league: form.league,
        leagueIcon: form.leagueIcon,
        country: form.country,
        kickoffAt: new Date(form.kickoffAt).toISOString(),
        tip: form.tip.trim(),
        market: form.market,
        odds: parseFloat(form.odds),
        confidence: Number(form.confidence),
        risk: form.risk,
        analysis: form.analysis.trim() || null,
        isPremium: form.isPremium,
        status: form.status,
        scoreHome: form.scoreHome === "" ? null : Number(form.scoreHome),
        scoreAway: form.scoreAway === "" ? null : Number(form.scoreAway),
        tipster: form.tipster.trim(),
      };
      if (editing) {
        await apiUpdatePrediction(editing.id, payload);
        toast({
          title: "Prediction updated",
          description: `${payload.homeTeam} vs ${payload.awayTeam}`,
        });
      } else {
        await apiCreatePrediction(payload);
        toast({
          title: "Prediction created",
          description: `${payload.homeTeam} vs ${payload.awayTeam}`,
        });
      }
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Save failed");
      toast({
        title: "Save failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function remove() {
    if (!editing) return;
    if (!confirm(`Delete "${editing.homeTeam} vs ${editing.awayTeam}"? This cannot be undone.`)) return;
    setBusy(true);
    try {
      await apiDeletePrediction(editing.id);
      toast({
        title: "Prediction deleted",
        description: `${editing.homeTeam} vs ${editing.awayTeam}`,
        variant: "destructive",
      });
      onSaved();
      onClose();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Delete failed");
      toast({
        title: "Delete failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose} aria-hidden />
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="text-lg font-bold text-slate-900">
            {editing ? "Edit prediction" : "New prediction"}
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={save} className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Home team">
              <input
                value={form.homeTeam}
                onChange={(e) => set("homeTeam", e.target.value)}
                required
                className={inputCls}
                placeholder="Manchester City"
              />
            </Field>
            <Field label="Away team">
              <input
                value={form.awayTeam}
                onChange={(e) => set("awayTeam", e.target.value)}
                required
                className={inputCls}
                placeholder="Arsenal"
              />
            </Field>
            <Field label="League">
              <select
                value={form.league}
                onChange={(e) => onLeagueChange(e.target.value)}
                className={inputCls}
              >
                {LEAGUES.map((l) => (
                  <option key={l.name} value={l.name}>
                    {l.icon} {l.name}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Kickoff">
              <input
                type="datetime-local"
                value={form.kickoffAt}
                onChange={(e) => set("kickoffAt", e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Tip">
              <input
                value={form.tip}
                onChange={(e) => set("tip", e.target.value)}
                required
                className={inputCls}
                placeholder="Over 2.5 Goals"
              />
            </Field>
            <Field label="Market">
              <select
                value={form.market}
                onChange={(e) => set("market", e.target.value)}
                className={inputCls}
              >
                {MARKETS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Odds">
              <input
                type="number"
                step="0.01"
                min="1.01"
                value={form.odds}
                onChange={(e) => set("odds", e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label={`Confidence — ${form.confidence}%`}>
              <input
                type="range"
                min={1}
                max={99}
                value={form.confidence}
                onChange={(e) => set("confidence", Number(e.target.value))}
                className="mt-2 h-2 w-full cursor-pointer appearance-none rounded-full bg-slate-200 accent-emerald-500"
              />
            </Field>
            <Field label="Risk">
              <select
                value={form.risk}
                onChange={(e) => set("risk", e.target.value as FormState["risk"])}
                className={inputCls}
              >
                {RISK_LEVELS.map((r) => (
                  <option key={r} value={r}>
                    {r[0]!.toUpperCase()}
                    {r.slice(1)} risk
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Status">
              <select
                value={form.status}
                onChange={(e) => set("status", e.target.value as FormState["status"])}
                className={inputCls}
              >
                <option value="upcoming">Upcoming</option>
                <option value="won">Won</option>
                <option value="lost">Lost</option>
                <option value="void">Void</option>
              </select>
            </Field>
            <Field label="Score (home)">
              <input
                type="number"
                min={0}
                value={form.scoreHome}
                onChange={(e) => set("scoreHome", e.target.value)}
                className={inputCls}
                placeholder="—"
              />
            </Field>
            <Field label="Score (away)">
              <input
                type="number"
                min={0}
                value={form.scoreAway}
                onChange={(e) => set("scoreAway", e.target.value)}
                className={inputCls}
                placeholder="—"
              />
            </Field>
            <Field label="Tipster">
              <input
                value={form.tipster}
                onChange={(e) => set("tipster", e.target.value)}
                required
                className={inputCls}
              />
            </Field>
            <Field label="Premium pick">
              <label className="flex h-11 cursor-pointer items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3">
                <input
                  type="checkbox"
                  checked={form.isPremium}
                  onChange={(e) => set("isPremium", e.target.checked)}
                  className="h-4 w-4 accent-emerald-500"
                />
                <span className="text-sm text-slate-700">
                  Mark as premium (locked for free users)
                </span>
              </label>
            </Field>
          </div>

          <Field label="Analysis" className="mt-4">
            <textarea
              value={form.analysis}
              onChange={(e) => set("analysis", e.target.value)}
              rows={4}
              className={inputCls + " resize-none"}
              placeholder="Brief reasoning, form, head-to-head, value angle..."
            />
          </Field>

          {err && (
            <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              {err}
            </div>
          )}

          <div className="mt-6 flex items-center justify-between gap-2 border-t border-slate-100 pt-4">
            {editing ? (
              <Button
                type="button"
                variant="danger"
                onClick={remove}
                disabled={busy}
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
            ) : (
              <span />
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={onClose} disabled={busy}>
                Cancel
              </Button>
              <Button type="submit" disabled={busy}>
                {busy ? <Spinner /> : (
                  <>
                    <Save className="h-4 w-4" />
                    {editing ? "Save changes" : "Create tip"}
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-slate-50 px-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100";

function Field({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className ?? ""}`}>
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      {children}
    </label>
  );
}
