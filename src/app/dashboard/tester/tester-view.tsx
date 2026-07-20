"use client";

import { useState, useEffect } from "react";
import {
  Zap,
  Gauge,
  Database,
  RefreshCw,
  Trash2,
  CheckCircle2,
  Eye,
  Lock,
  Crown,
  ShieldCheck,
  TrendingUp,
  Clock,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/kit";
import { toast } from "@/components/toaster";
import { PredictionCard } from "@/components/prediction-card";
import type { ClientPrediction } from "@/lib/types";

interface BenchmarkResult {
  target: string;
  label: string;
  uncachedMs: number;
  cachedMs: number;
  speedupRatio: number;
  payloadBytes: number;
  status: string;
}

interface CacheTelemetry {
  hits: number;
  misses: number;
  keysCount: number;
  totalSavedMs: number;
  hitRate: number;
  storeEntries?: { key: string; tags: string[]; ageMs: number }[];
}

export function TesterView({ samplePredictions }: { samplePredictions: ClientPrediction[] }) {
  const [activeTab, setActiveTab] = useState<"speed" | "cache" | "preview">("speed");

  // Speed Tester state
  const [benchmarking, setBenchmarking] = useState(false);
  const [benchmarkResults, setBenchmarkResults] = useState<BenchmarkResult[] | null>(null);
  const [overallSpeedup, setOverallSpeedup] = useState<string | null>(null);

  // Cache Monitor state
  const [cacheData, setCacheData] = useState<CacheTelemetry | null>(null);
  const [cacheLoading, setCacheLoading] = useState(false);

  // Preview Studio state
  const [previewRole, setPreviewRole] = useState<"free" | "premium" | "admin">("free");

  useEffect(() => {
    fetchCacheStats();
  }, []);

  async function fetchCacheStats() {
    setCacheLoading(true);
    try {
      const res = await fetch("/api/tester");
      const json = await res.json();
      if (json.ok && json.cache) setCacheData(json.cache);
    } catch {
      // ignore
    } finally {
      setCacheLoading(false);
    }
  }

  async function runSpeedTest() {
    setBenchmarking(true);
    try {
      const res = await fetch("/api/tester/benchmark", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ target: "all", iterations: 3 }),
      });
      const json = await res.json();
      if (json.ok) {
        setBenchmarkResults(json.results);
        setOverallSpeedup(json.overallSpeedup);
        if (json.cacheStats) setCacheData(json.cacheStats);
        toast.success(`Speed test complete! Performance improved by ${json.overallSpeedup}`);
      }
    } catch {
      toast.error("Could not run speed test.");
    } finally {
      setBenchmarking(false);
    }
  }

  async function warmUpCache() {
    setCacheLoading(true);
    try {
      const res = await fetch("/api/tester", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "warmup" }),
      });
      const json = await res.json();
      if (json.ok) {
        setCacheData(json.stats);
        toast.success(json.message || "Cache warmed up!");
      }
    } catch {
      toast.error("Warmup failed.");
    } finally {
      setCacheLoading(false);
    }
  }

  async function purgeCache() {
    setCacheLoading(true);
    try {
      const res = await fetch("/api/tester", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action: "purge" }),
      });
      const json = await res.json();
      if (json.ok) {
        setCacheData(json.stats);
        setBenchmarkResults(null);
        toast.info("Cache purged.");
      }
    } catch {
      toast.error("Purge failed.");
    } finally {
      setCacheLoading(false);
    }
  }

  // Adjust sample predictions based on previewRole selection
  const previewPredictions = samplePredictions.map((p) => {
    const isPrem = previewRole === "premium" || previewRole === "admin";
    const locked = p.isPremium && !isPrem;
    return {
      ...p,
      locked,
      analysis: locked ? null : p.analysis || "Comprehensive expected-goals analysis and tactical breakdown...",
    };
  });

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-1.5 shadow-sm">
        <button
          onClick={() => setActiveTab("speed")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "speed" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Gauge className="h-4 w-4 text-emerald-400" />
          Page Speed Benchmarker
        </button>
        <button
          onClick={() => {
            setActiveTab("cache");
            fetchCacheStats();
          }}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "cache" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Database className="h-4 w-4 text-sky-400" />
          Cache Server Monitor
          {cacheData && (
            <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-sky-300">
              {cacheData.hitRate}% hits
            </span>
          )}
        </button>
        <button
          onClick={() => setActiveTab("preview")}
          className={`flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${
            activeTab === "preview" ? "bg-slate-900 text-white shadow" : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <Eye className="h-4 w-4 text-amber-400" />
          Plan Preview Studio
        </button>
      </div>

      {/* TAB 1: SPEED BENCHMARKER */}
      {activeTab === "speed" && (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-950 p-6 text-white shadow-xl">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300 ring-1 ring-inset ring-emerald-400/30">
                  <Zap className="h-3.5 w-3.5" />
                  Live Speed Benchmarking Engine
                </span>
                <h2 className="mt-3 text-2xl font-bold sm:text-3xl">Measure Page & Query Acceleration</h2>
                <p className="mt-1 max-w-xl text-sm text-slate-300">
                  Run a real-time comparison test between direct un-cached database queries and our high-speed in-memory caching server.
                </p>
              </div>
              <Button
                onClick={runSpeedTest}
                loading={benchmarking}
                variant="primary"
                size="lg"
                className="shrink-0 bg-emerald-500 text-white hover:bg-emerald-400"
              >
                <Zap className="h-4 w-4" />
                Run Speed Test Now
              </Button>
            </div>

            {overallSpeedup && (
              <div className="mt-6 grid grid-cols-2 gap-4 border-t border-white/10 pt-6 sm:grid-cols-4">
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs text-slate-400">Overall Acceleration</p>
                  <p className="mt-1 text-3xl font-extrabold text-emerald-400">{overallSpeedup}</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs text-slate-400">Cache Hit Rate</p>
                  <p className="mt-1 text-3xl font-extrabold text-sky-400">{cacheData?.hitRate ?? 0}%</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs text-slate-400">Time Saved</p>
                  <p className="mt-1 text-3xl font-extrabold text-amber-400">{cacheData?.totalSavedMs ?? 0}ms</p>
                </div>
                <div className="rounded-xl bg-white/5 p-4 backdrop-blur">
                  <p className="text-xs text-slate-400">Status</p>
                  <p className="mt-1 text-lg font-bold text-emerald-300">Blazing Fast ⚡</p>
                </div>
              </div>
            )}
          </div>

          {benchmarkResults ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Benchmark Breakdown</h3>
              <p className="text-xs text-slate-500">Comparing latency averages over multiple iterations</p>

              <div className="mt-6 space-y-6">
                {benchmarkResults.map((res) => {
                  const maxVal = Math.max(res.uncachedMs, res.cachedMs, 10);
                  const uncachedWidth = Math.min(100, Math.round((res.uncachedMs / maxVal) * 100));
                  const cachedWidth = Math.min(100, Math.round((res.cachedMs / maxVal) * 100));

                  return (
                    <div key={res.target} className="rounded-xl border border-slate-100 bg-slate-50/70 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <span className="font-semibold text-slate-800">{res.label}</span>
                        <div className="flex items-center gap-2">
                          <Badge className="bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200">
                            {res.speedupRatio}x faster
                          </Badge>
                          <Badge className="bg-slate-100 text-slate-600">
                            {Math.round(res.payloadBytes / 1024 * 10) / 10} KB payload
                          </Badge>
                        </div>
                      </div>

                      <div className="mt-4 space-y-3">
                        {/* Uncached bar */}
                        <div>
                          <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                            <span>Uncached (Direct Postgres DB Query)</span>
                            <span className="font-mono font-bold text-rose-600">{res.uncachedMs} ms</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-500"
                              style={{ width: `${Math.max(uncachedWidth, 5)}%` }}
                            />
                          </div>
                        </div>

                        {/* Cached bar */}
                        <div>
                          <div className="mb-1 flex justify-between text-xs font-medium text-slate-600">
                            <span>Cached (Cache Server Memory Engine)</span>
                            <span className="font-mono font-bold text-emerald-600">{res.cachedMs} ms</span>
                          </div>
                          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-600 transition-all duration-500"
                              style={{ width: `${Math.max(cachedWidth, 3)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/70 py-16 text-center">
              <Gauge className="h-10 w-10 text-slate-300" />
              <h3 className="mt-3 text-base font-semibold text-slate-700">No Benchmark Results Yet</h3>
              <p className="mt-1 max-w-sm text-sm text-slate-500">
                Click &quot;Run Speed Test Now&quot; above to measure exact latency improvements on your database and pages.
              </p>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: CACHE SERVER MONITOR */}
      {activeTab === "cache" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Cache Server Engine Monitor</h3>
                <p className="text-xs text-slate-500">Live memory store statistics and control panel</p>
              </div>
              <div className="flex items-center gap-2">
                <Button onClick={warmUpCache} loading={cacheLoading} variant="subtle" size="sm">
                  <RefreshCw className="h-4 w-4" />
                  Warm Up Cache
                </Button>
                <Button onClick={purgeCache} loading={cacheLoading} variant="outline" size="sm" className="text-rose-600 hover:border-rose-200 hover:bg-rose-50">
                  <Trash2 className="h-4 w-4" />
                  Purge Cache
                </Button>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Active Cache Keys</p>
                <p className="mt-1 text-2xl font-bold text-slate-900">{cacheData?.keysCount ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Total Cache Hits</p>
                <p className="mt-1 text-2xl font-bold text-emerald-600">{cacheData?.hits ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Cache Misses</p>
                <p className="mt-1 text-2xl font-bold text-amber-600">{cacheData?.misses ?? 0}</p>
              </div>
              <div className="rounded-xl bg-slate-50 p-4 border border-slate-100">
                <p className="text-xs font-medium text-slate-500">Total Latency Saved</p>
                <p className="mt-1 text-2xl font-bold text-indigo-600">{cacheData?.totalSavedMs ?? 0}ms</p>
              </div>
            </div>

            {cacheData?.storeEntries && cacheData.storeEntries.length > 0 && (
              <div className="mt-6">
                <h4 className="text-sm font-semibold text-slate-700 mb-3">InMemory Store Entries</h4>
                <div className="overflow-x-auto rounded-xl border border-slate-200">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50 font-semibold text-slate-600 border-b border-slate-200">
                      <tr>
                        <th className="px-4 py-2.5">Cache Key</th>
                        <th className="px-4 py-2.5">Tags</th>
                        <th className="px-4 py-2.5">Age</th>
                        <th className="px-4 py-2.5">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {cacheData.storeEntries.map((e) => (
                        <tr key={e.key} className="hover:bg-slate-50/60">
                          <td className="px-4 py-2.5 font-mono font-medium text-slate-700">{e.key}</td>
                          <td className="px-4 py-2.5">
                            <div className="flex flex-wrap gap-1">
                              {e.tags.map((t) => (
                                <Badge key={t} className="bg-slate-100 text-slate-600">{t}</Badge>
                              ))}
                            </div>
                          </td>
                          <td className="px-4 py-2.5 text-slate-500">{Math.round(e.ageMs / 1000)}s ago</td>
                          <td className="px-4 py-2.5">
                            <span className="inline-flex items-center gap-1 font-semibold text-emerald-600">
                              <CheckCircle2 className="h-3.5 w-3.5" /> Ready
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: PLAN PREVIEW STUDIO */}
      {activeTab === "preview" && (
        <div className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-100 pb-5">
              <div>
                <h3 className="text-lg font-bold text-slate-900">Interactive Plan Preview Studio</h3>
                <p className="text-xs text-slate-500">Simulate page & card rendering across different user tiers without logging out</p>
              </div>

              {/* Tier Toggle */}
              <div className="flex rounded-xl bg-slate-100 p-1">
                <button
                  onClick={() => setPreviewRole("free")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    previewRole === "free" ? "bg-white text-slate-900 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Lock className="h-3.5 w-3.5 text-slate-400" />
                  Free Plan View
                </button>
                <button
                  onClick={() => setPreviewRole("premium")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    previewRole === "premium" ? "bg-white text-emerald-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <Crown className="h-3.5 w-3.5 text-amber-500" />
                  Premium Plan View
                </button>
                <button
                  onClick={() => setPreviewRole("admin")}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    previewRole === "admin" ? "bg-white text-indigo-700 shadow-sm" : "text-slate-600 hover:text-slate-900"
                  }`}
                >
                  <ShieldCheck className="h-3.5 w-3.5 text-indigo-500" />
                  Admin View
                </button>
              </div>
            </div>

            {/* Simulated Banner */}
            <div className="mt-5 rounded-xl bg-slate-50 p-4 border border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="h-5 w-5 text-amber-500 shrink-0" />
                <span className="text-sm text-slate-700 font-medium">
                  Currently previewing how <strong className="capitalize text-slate-900">{previewRole}</strong> members experience the platform.
                </span>
              </div>
              <Badge className={
                previewRole === "free"
                  ? "bg-slate-200 text-slate-700"
                  : previewRole === "premium"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-indigo-100 text-indigo-800"
              }>
                Preview Mode Active
              </Badge>
            </div>

            {/* Render sample predictions */}
            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {previewPredictions.map((p) => (
                <PredictionCard key={p.id} prediction={p} isAdmin={previewRole === "admin"} />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
