"use client";

import { useEffect, useState, useCallback } from "react";
import { Search, SlidersHorizontal, Clock, X, Star, UserCheck } from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { useFavorites } from "@/hooks/use-favorites";
import { useFollowing } from "@/hooks/use-following";
import { apiPredictions } from "@/lib/api-client";
import type { ClientPrediction } from "@/lib/types";
import { LEAGUES, MARKETS, RISK_LEVELS, STATUS_CONFIG, type StatusKey } from "@/lib/constants";
import { cn } from "@/lib/utils";
import { PredictionCard } from "./prediction-card";
import { Button, Spinner } from "./ui";
import { SkeletonGrid, EmptyState } from "./empty-state";
import { StaggerGrid, StaggerItem } from "./motion";

const STATUS_TABS: { key: StatusKey; label: string }[] = [
  { key: "upcoming", label: "Upcoming" },
  { key: "won", label: "Won" },
  { key: "lost", label: "Lost" },
  { key: "void", label: "Void" },
];

export function PredictionsTab() {
  const { isPremium, setTab, openDetail } = useGoalEdge();
  const { favorites, toggle, isFavorite } = useFavorites();
  const { following, load: loadFollowing, isFollowingTipster } = useFollowing();
  const [status, setStatus] = useState<StatusKey>("upcoming");
  const [league, setLeague] = useState<string>("");
  const [market, setMarket] = useState<string>("");
  const [risk, setRisk] = useState<string>("");
  const [q, setQ] = useState<string>("");
  const [rows, setRows] = useState<ClientPrediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [favOnly, setFavOnly] = useState(false);
  const [followingOnly, setFollowingOnly] = useState(false);

  // Load followed tipsters on mount
  useEffect(() => {
    loadFollowing();
  }, [loadFollowing]);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiPredictions({
        status,
        league: league || undefined,
        market: market || undefined,
        risk: risk || undefined,
        q: q || undefined,
        limit: 100,
      });
      setRows(res.predictions);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [status, league, market, risk, q]);

  useEffect(() => {
    const t = setTimeout(load, 200); // debounce search
    return () => clearTimeout(t);
  }, [load]);

  const activeFilters = [league, market, risk].filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Predictions board
        </h1>
        <p className="text-sm text-slate-500">
          Browse every tip. Premium picks are blurred until you upgrade.
        </p>
      </div>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-slate-200 bg-white p-1.5">
        {STATUS_TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setStatus(t.key)}
            className={cn(
              "flex-1 rounded-lg px-3 py-2 text-sm font-semibold transition sm:flex-none",
              status === t.key
                ? "bg-emerald-500 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Following + Favorites quick-filter bar */}
      {(following.length > 0 || favorites.length > 0) && (
        <div className="flex flex-wrap items-center gap-2">
          {following.length > 0 && (
            <button
              onClick={() => setFollowingOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                followingOnly
                  ? "bg-emerald-500 text-white shadow-sm"
                  : "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100",
              )}
            >
              <UserCheck className={cn("h-3.5 w-3.5", followingOnly && "fill-white")} />
              Following ({following.length})
            </button>
          )}
          {following.length > 0 && favorites.length > 0 && (
            <span className="text-xs text-slate-400">·</span>
          )}
          {favorites.length > 0 && (
            <button
              onClick={() => setFavOnly((v) => !v)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition",
                favOnly
                  ? "bg-amber-400 text-white shadow-sm"
                  : "bg-amber-50 text-amber-700 ring-1 ring-amber-200 hover:bg-amber-100",
              )}
            >
              <Star className={cn("h-3.5 w-3.5", favOnly && "fill-white")} />
              Favorites only
            </button>
          )}
          {favorites.length > 0 && (
            <>
              <span className="text-xs text-slate-400">·</span>
              {favorites.map((l) => {
            const leagueInfo = LEAGUES.find((x) => x.name === l);
            return (
              <div
                key={l}
                role="button"
                tabIndex={0}
                onClick={() => {
                  setLeague(league === l ? "" : l);
                  setFavOnly(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setLeague(league === l ? "" : l);
                    setFavOnly(false);
                  }
                }}
                className={cn(
                  "inline-flex cursor-pointer items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium transition",
                  league === l
                    ? "bg-emerald-500 text-white shadow-sm"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200",
                )}
              >
                <span>{leagueInfo?.icon ?? "⚽"}</span>
                {l}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggle(l);
                  }}
                  className="ml-0.5 text-amber-400 hover:text-amber-600"
                  aria-label={`Remove ${l} from favorites`}
                >
                  <Star className="h-3 w-3 fill-amber-400" />
                </button>
              </div>
            );
          })}
            </>
          )}
        </div>
      )}

      {/* Search + filter toggle */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search teams, leagues..."
            className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-9 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
          />
          {q && (
            <button
              onClick={() => setQ("")}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button
          variant={showFilters ? "primary" : "outline"}
          size="md"
          onClick={() => setShowFilters((s) => !s)}
          className="sm:w-auto"
        >
          <SlidersHorizontal className="h-4 w-4" />
          Filters
          {activeFilters > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-1.5 text-xs">
              {activeFilters}
            </span>
          )}
        </Button>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="space-y-4 rounded-2xl border border-slate-200 bg-white p-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <FilterSelect
              label="League"
              value={league}
              onChange={setLeague}
              options={LEAGUES.map((l) => ({ value: l.name, label: `${l.icon} ${l.name}` }))}
            />
            <FilterSelect
              label="Market"
              value={market}
              onChange={setMarket}
              options={MARKETS.map((m) => ({ value: m, label: m }))}
            />
            <FilterSelect
              label="Risk"
              value={risk}
              onChange={setRisk}
              options={RISK_LEVELS.map((r) => ({ value: r, label: `${r[0]!.toUpperCase()}${r.slice(1)} risk` }))}
            />
          </div>
          {/* Favorite leagues multi-toggle */}
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <Star className="h-3.5 w-3.5 text-amber-400" />
              Favorite leagues
            </p>
            <div className="flex flex-wrap gap-1.5">
              {LEAGUES.map((l) => {
                const fav = isFavorite(l.name);
                return (
                  <button
                    key={l.name}
                    onClick={() => toggle(l.name)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition",
                      fav
                        ? "bg-amber-50 text-amber-700 ring-1 ring-amber-300"
                        : "bg-slate-100 text-slate-500 hover:bg-slate-200",
                    )}
                  >
                    <span>{l.icon}</span>
                    {l.name}
                    <Star className={cn("h-3 w-3", fav && "fill-amber-400 text-amber-400")} />
                  </button>
                );
              })}
            </div>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setLeague("");
                setMarket("");
                setRisk("");
                setFavOnly(false);
                setFollowingOnly(false);
              }}
              className="text-left text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              Clear all filters
            </button>
          )}
        </div>
      )}

      {/* Results */}
      {loading ? (
        <SkeletonGrid count={6} />
      ) : (() => {
        let displayed = rows;
        if (followingOnly) {
          displayed = displayed.filter((p) => isFollowingTipster(p.tipster));
        }
        if (favOnly) {
          displayed = displayed.filter((p) => favorites.includes(p.league));
        }
        if (displayed.length === 0) {
          return (
            <EmptyState
              icon={<Search className="h-7 w-7" />}
              title="No tips match your filters"
              description="Try adjusting your search, switching the status tab, or clearing filters to see more predictions."
            />
          );
        }
        return (
          <>
            <p className="text-sm text-slate-500">
              Showing <span className="font-semibold text-slate-700">{displayed.length}</span> tip
              {displayed.length === 1 ? "" : "s"}
              {followingOnly && <span className="ml-1 text-emerald-600">· following</span>}
              {favOnly && <span className="ml-1 text-amber-600">· favorites only</span>}
            </p>
            <StaggerGrid className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayed.map((p) => (
                <StaggerItem key={p.id}>
                  <PredictionCard
                    prediction={p}
                    onUnlock={() => setTab("subscription")}
                    onView={(id) => openDetail(id, p)}
                  />
                </StaggerItem>
              ))}
            </StaggerGrid>
          </>
        );
      })()}
    </div>
  );
}

function FilterSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100"
      >
        <option value="">All</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </label>
  );
}
