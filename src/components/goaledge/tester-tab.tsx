"use client";

import { useEffect, useState } from "react";
import { Gauge, Zap, Database, RefreshCw, TrendingUp, Activity } from "lucide-react";
import { apiTester, apiBenchmark } from "@/lib/api-client";
import { Button, Spinner } from "./ui";
import { cn } from "@/lib/utils";

type Stats = {
  hits: number;
  misses: number;
  stale: number;
  sets: number;
  invalidations: number;
  entries: number;
  hitRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
};

type Bench = {
  stats: { cachedMs: number; uncachedMs: number; speedup: number };
  predictions: { cachedMs: number; uncachedMs: number; speedup: number };
};

export function TesterTab() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [bench, setBench] = useState<Bench | null>(null);
  const [loadingStats, setLoadingStats] = useState(true);
  const [runningBench, setRunningBench] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function refresh() {
    setLoadingStats(true);
    setErr(null);
    try {
      const s = await apiTester();
      setStats(s);
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Failed to load stats");
    } finally {
      setLoadingStats(false);
    }
  }

  async function runBench() {
    setRunningBench(true);
    setErr(null);
    try {
      const b = await apiBenchmark();
      setBench(b);
      await refresh();
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Benchmark failed");
    } finally {
      setRunningBench(false);
    }
  }

  useEffect(() => {
    refresh();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Performance tester
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Live telemetry for the in-memory cache server. See stale-while-revalidate in action.
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={refresh} disabled={loadingStats}>
            <RefreshCw className={cn("h-4 w-4", loadingStats && "animate-spin")} />
            Refresh
          </Button>
          <Button onClick={runBench} disabled={runningBench}>
            {runningBench ? <Spinner /> : (
              <>
                <Zap className="h-4 w-4" />
                Run benchmark
              </>
            )}
          </Button>
        </div>
      </div>

      {err && (
        <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
          {err}
        </div>
      )}

      {/* Hit rate hero */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Metric
          icon={<TrendingUp className="h-5 w-5" />}
          label="Hit rate"
          value={stats ? `${stats.hitRate}%` : "—"}
          accent="emerald"
        />
        <Metric
          icon={<Activity className="h-5 w-5" />}
          label="Avg latency"
          value={stats ? `${stats.avgLatencyMs}ms` : "—"}
          accent="sky"
        />
        <Metric
          icon={<Gauge className="h-5 w-5" />}
          label="p95 latency"
          value={stats ? `${stats.p95LatencyMs}ms` : "—"}
          accent="amber"
        />
        <Metric
          icon={<Database className="h-5 w-5" />}
          label="Cached entries"
          value={stats?.entries ?? "—"}
          accent="rose"
        />
      </div>

      {/* Detailed stats */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Cache counters</h3>
          {loadingStats ? (
            <div className="flex justify-center py-8">
              <Spinner className="h-5 w-5 text-emerald-500" />
            </div>
          ) : stats ? (
            <dl className="mt-4 grid grid-cols-2 gap-4">
              <Stat label="Hits" value={stats.hits} color="text-emerald-600" />
              <Stat label="Misses" value={stats.misses} color="text-rose-600" />
              <Stat label="Stale-while-revalidate" value={stats.stale} color="text-amber-600" />
              <Stat label="Sets" value={stats.sets} color="text-sky-600" />
              <Stat label="Invalidations" value={stats.invalidations} color="text-slate-600" />
              <Stat label="Live entries" value={stats.entries} color="text-slate-900" />
            </dl>
          ) : (
            <p className="mt-4 text-sm text-slate-400">No data.</p>
          )}
          <div className="mt-5 border-t border-slate-100 pt-4 text-xs text-slate-400">
            Fresh window: 15-30s · Stale-while-revalidate: 1-5min · Tag-based invalidation on mutations.
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="text-sm font-semibold text-slate-700">Benchmark results</h3>
          {!bench ? (
            <div className="mt-4 flex flex-col items-center justify-center py-8 text-center">
              <Zap className="h-8 w-8 text-slate-300" />
              <p className="mt-2 text-sm text-slate-500">
                Run the benchmark to compare cached vs uncached read latency.
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              <BenchRow
                title="Stats query"
                cached={bench.stats.cachedMs}
                uncached={bench.stats.uncachedMs}
                speedup={bench.stats.speedup}
              />
              <BenchRow
                title="Predictions list (50 rows)"
                cached={bench.predictions.cachedMs}
                uncached={bench.predictions.uncachedMs}
                speedup={bench.predictions.speedup}
              />
            </div>
          )}
        </div>
      </div>

      {/* How it works */}
      <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-6">
        <h3 className="flex items-center gap-2 text-sm font-semibold text-slate-700">
          <Database className="h-4 w-4 text-emerald-500" />
          How the cache works
        </h3>
        <ul className="mt-3 grid gap-2 text-sm text-slate-600 sm:grid-cols-2">
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span><b>Stale-while-revalidate:</b> returns cached data instantly while refreshing in the background.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span><b>Tag-based invalidation:</b> creating, editing or deleting a prediction clears related caches.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span><b>Telemetry:</b> hit rate, avg/p95 latency and counters update live on this page.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
            <span><b>Benchmark:</b> forces a cold read then a warm read to measure the speedup.</span>
          </li>
        </ul>
      </div>
    </div>
  );
}

function Metric({
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
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl", map[accent])}>
        {icon}
      </span>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className={cn("mt-0.5 text-xl font-bold", color)}>{value}</dd>
    </div>
  );
}

function BenchRow({
  title,
  cached,
  uncached,
  speedup,
}: {
  title: string;
  cached: number;
  uncached: number;
  speedup: number;
}) {
  return (
    <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-4">
      <p className="text-sm font-semibold text-slate-700">{title}</p>
      <div className="mt-3 grid grid-cols-3 gap-2 text-center">
        <div>
          <p className="text-xs text-slate-400">Uncached</p>
          <p className="text-lg font-bold text-rose-600">{uncached}ms</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Cached</p>
          <p className="text-lg font-bold text-emerald-600">{cached}ms</p>
        </div>
        <div>
          <p className="text-xs text-slate-400">Speedup</p>
          <p className="text-lg font-bold text-slate-900">{speedup}x</p>
        </div>
      </div>
    </div>
  );
}
