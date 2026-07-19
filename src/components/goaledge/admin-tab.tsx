"use client";

import { useEffect, useState, useCallback } from "react";
import { Plus, Pencil, Search, Target, Crown, Gauge, Zap, Download } from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { apiPredictions } from "@/lib/api-client";
import type { ClientPrediction } from "@/lib/types";
import { STATUS_CONFIG, type StatusKey } from "@/lib/constants";
import { cn, formatDateTime } from "@/lib/utils";
import { Button, Spinner, Badge } from "./ui";
import { PredictionFormModal } from "./prediction-form-modal";
import { SettleModal } from "./settle-modal";
import { AdminInsights } from "./admin-insights";
import { AdminUsers } from "./admin-users";

export function AdminTab() {
  const { user } = useGoalEdge();
  const [rows, setRows] = useState<ClientPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ClientPrediction | null>(null);
  const [settling, setSettling] = useState<ClientPrediction | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiPredictions({ q: q || undefined, limit: 200 });
      setRows(res.predictions);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    const t = setTimeout(load, 200);
    return () => clearTimeout(t);
  }, [load]);

  if (!user || user.role !== "admin") {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center">
        <p className="text-sm text-slate-500">Admins only.</p>
      </div>
    );
  }

  function openNew() {
    setEditing(null);
    setModalOpen(true);
  }
  function openEdit(p: ClientPrediction) {
    setEditing(p);
    setModalOpen(true);
  }
  function openSettle(p: ClientPrediction) {
    setSettling(p);
  }

  function exportCSV() {
    const headers = [
      "ID",
      "Home Team",
      "Away Team",
      "League",
      "Country",
      "Kickoff",
      "Tip",
      "Market",
      "Odds",
      "Confidence",
      "Risk",
      "Premium",
      "Status",
      "Score Home",
      "Score Away",
      "Tipster",
      "Created At",
    ];
    const escape = (v: unknown) => {
      const s = v == null ? "" : String(v);
      if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
      return s;
    };
    const lines = [headers.join(",")];
    for (const p of rows) {
      lines.push(
        [
          p.id,
          p.homeTeam,
          p.awayTeam,
          p.league,
          p.country,
          new Date(p.kickoffAt).toISOString(),
          p.tip,
          p.market,
          p.odds,
          p.confidence,
          p.risk,
          p.isPremium ? "Yes" : "No",
          p.status,
          p.scoreHome ?? "",
          p.scoreAway ?? "",
          p.tipster,
          new Date(p.createdAt).toISOString(),
        ]
          .map(escape)
          .join(","),
      );
    }
    const csv = lines.join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `goaledge-predictions-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Manage predictions
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Create, edit and settle tips. Changes are reflected instantly across the app.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={exportCSV}
            disabled={rows.length === 0}
            title="Download all predictions as CSV"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </Button>
          <Button onClick={openNew}>
            <Plus className="h-4 w-4" />
            New prediction
          </Button>
        </div>
      </div>

      {/* Admin insights dashboard */}
      <AdminInsights />

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search predictions..."
          className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
        />
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner className="h-6 w-6 text-emerald-500" />
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
          No predictions yet. Click &ldquo;New prediction&rdquo; to create your first tip.
        </div>
      ) : (
        <div className="max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">Match</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Tip</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Market</th>
                <th className="px-4 py-3 font-semibold">Odds</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Conf.</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rows.map((p) => {
                const sc = STATUS_CONFIG[p.status as StatusKey] ?? STATUS_CONFIG.upcoming;
                return (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{p.leagueIcon}</span>
                        <div className="min-w-0">
                          <p className="truncate font-semibold text-slate-800">
                            {p.homeTeam} <span className="text-slate-300">v</span> {p.awayTeam}
                          </p>
                          <p className="text-xs text-slate-400">
                            {p.league} · {formatDateTime(p.kickoffAt)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="flex items-center gap-1.5">
                        <Target className="h-3.5 w-3.5 text-slate-400" />
                        <span className="font-medium text-slate-700">{p.tip}</span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-slate-500 lg:table-cell">{p.market}</td>
                    <td className="px-4 py-3">
                      <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 font-bold text-emerald-600">
                        {p.odds.toFixed(2)}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 sm:table-cell">
                      <span className="flex items-center gap-1 text-slate-600">
                        <Gauge className="h-3.5 w-3.5 text-slate-400" />
                        {p.confidence}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        {p.isPremium && (
                          <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                            <Crown className="h-3 w-3" />
                          </Badge>
                        )}
                        <Badge className={sc.badge}>
                          <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                          {sc.label}
                        </Badge>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        {p.status === "upcoming" && (
                          <button
                            onClick={() => openSettle(p)}
                            className="inline-flex items-center gap-1 rounded-lg bg-emerald-50 px-2 py-1.5 text-xs font-semibold text-emerald-700 transition hover:bg-emerald-100"
                            title="Quick settle"
                          >
                            <Zap className="h-3.5 w-3.5" />
                            Settle
                          </button>
                        )}
                        <button
                          onClick={() => openEdit(p)}
                          className="rounded-lg p-2 text-slate-400 transition hover:bg-emerald-50 hover:text-emerald-600"
                          aria-label="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <PredictionFormModal
        open={modalOpen}
        editing={editing}
        onClose={() => setModalOpen(false)}
        onSaved={load}
      />

      <SettleModal
        open={!!settling}
        prediction={settling}
        onClose={() => setSettling(null)}
        onSettled={load}
      />

      {/* User management */}
      <AdminUsers />
    </div>
  );
}
