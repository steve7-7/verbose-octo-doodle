"use client";

import { useEffect, useState } from "react";
import {
  Radio,
  RefreshCw,
  AlertCircle,
  Settings,
  Trophy,
  Clock,
  MapPin,
} from "lucide-react";
import { apiTodaysMatches, type LiveMatch } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui";

export function LiveMatches() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [loading, setLoading] = useState(true);
  const [configured, setConfigured] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const res = await apiTodaysMatches();
      setConfigured(res.configured);
      setMatches(res.matches);
      if (res.error) setError(res.error);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load matches");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // Auto-refresh every 60 seconds
    const interval = setInterval(load, 60_000);
    return () => clearInterval(interval);
  }, []);

  // Not configured state
  if (!loading && !configured) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50/50 p-6">
        <div className="flex items-center gap-2">
          <Radio className="h-5 w-5 text-slate-400" />
          <h3 className="text-sm font-bold text-slate-700">Live matches</h3>
        </div>
        <p className="mt-2 text-sm text-slate-500">
          Connect the Highlightly Sports API to see today&apos;s live matches, scores and fixtures
          right here.
        </p>
        <div className="mt-3 rounded-lg bg-white px-3 py-2 text-xs text-slate-500 ring-1 ring-slate-200">
          <Settings className="mr-1 inline h-3.5 w-3.5" />
          Add your API key to <code className="font-mono text-emerald-600">.env</code>:
          <pre className="mt-1 overflow-x-auto rounded bg-slate-50 px-2 py-1 font-mono text-xs">HIGHLIGHTLY_API_KEY=your_key</pre>
        </div>
      </div>
    );
  }

  const liveMatches = matches.filter((m) =>
    /half|live|in progress|1st|2nd/i.test(m.status),
  );
  const upcomingMatches = matches.filter((m) =>
    /not started|scheduled|upcoming|pre-match/i.test(m.status),
  );
  const finishedMatches = matches.filter((m) =>
    /finished|full time|ft|ended|after pen|after extra/i.test(m.status),
  );

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            {liveMatches.length > 0 && (
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-75" />
            )}
            <span
              className={cn(
                "relative inline-flex h-2.5 w-2.5 rounded-full",
                liveMatches.length > 0 ? "bg-rose-500" : "bg-slate-300",
              )}
            />
          </span>
          <h3 className="flex items-center gap-1.5 text-sm font-bold text-slate-900">
            <Radio className="h-4 w-4 text-emerald-500" />
            Live matches
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {lastUpdated && (
            <span className="text-xs text-slate-400">
              Updated {lastUpdated.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" })}
            </span>
          )}
          <button
            onClick={load}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            aria-label="Refresh"
          >
            <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {loading && matches.length === 0 ? (
        <div className="flex items-center justify-center py-8">
          <Spinner className="h-5 w-5 text-emerald-500" />
        </div>
      ) : error ? (
        <div className="flex items-start gap-2 rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700 ring-1 ring-rose-200">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <div>
            <p className="font-medium">Failed to load matches</p>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      ) : matches.length === 0 ? (
        <div className="py-8 text-center text-sm text-slate-500">
          <Trophy className="mx-auto h-8 w-8 text-slate-300" />
          <p className="mt-2">No matches scheduled for today.</p>
        </div>
      ) : (
        <div className="max-h-80 space-y-2 overflow-y-auto pr-1">
          {/* Live matches first */}
          {liveMatches.length > 0 && (
            <>
              <p className="flex items-center gap-1 text-xs font-bold uppercase tracking-wide text-rose-500">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-rose-500" />
                Live now ({liveMatches.length})
              </p>
              {liveMatches.map((m) => (
                <MatchRow key={m.id} match={m} live />
              ))}
            </>
          )}

          {/* Upcoming */}
          {upcomingMatches.length > 0 && (
            <>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-sky-500">
                <Clock className="mr-1 inline h-3 w-3" />
                Upcoming ({upcomingMatches.length})
              </p>
              {upcomingMatches.slice(0, 10).map((m) => (
                <MatchRow key={m.id} match={m} />
              ))}
            </>
          )}

          {/* Finished */}
          {finishedMatches.length > 0 && (
            <>
              <p className="mt-3 text-xs font-bold uppercase tracking-wide text-slate-400">
                <Trophy className="mr-1 inline h-3 w-3" />
                Finished ({finishedMatches.length})
              </p>
              {finishedMatches.slice(0, 8).map((m) => (
                <MatchRow key={m.id} match={m} finished />
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function MatchRow({
  match,
  live = false,
  finished = false,
}: {
  match: LiveMatch;
  live?: boolean;
  finished?: boolean;
}) {
  const score = match.score && match.score !== "-" ? match.score : "vs";
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-xl border px-3 py-2.5 transition",
        live
          ? "border-rose-200 bg-rose-50/50"
          : finished
            ? "border-slate-100 bg-slate-50/30"
            : "border-slate-100 hover:bg-slate-50/60",
      )}
    >
      {/* League icon/logo */}
      {match.leagueLogo ? (
        <img
          src={match.leagueLogo}
          alt={match.league}
          className="h-4 w-4 shrink-0 rounded object-contain"
          onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
        />
      ) : (
        <span className="w-4 shrink-0 text-center text-xs">⚽</span>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-800">
              {match.homeLogo && (
                <img
                  src={match.homeLogo}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0 object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
              <span className="truncate">{match.homeTeam}</span>
            </p>
            <p className="flex items-center gap-1.5 truncate text-sm font-semibold text-slate-800">
              {match.awayLogo && (
                <img
                  src={match.awayLogo}
                  alt=""
                  className="h-3.5 w-3.5 shrink-0 object-contain"
                  onError={(e) => ((e.target as HTMLImageElement).style.display = "none")}
                />
              )}
              <span className="truncate">{match.awayTeam}</span>
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p
              className={cn(
                "text-sm font-bold tabular-nums",
                live ? "text-rose-600" : finished ? "text-slate-600" : "text-slate-400",
              )}
            >
              {score}
            </p>
          </div>
        </div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-slate-400">
          <span className="truncate">{match.league}</span>
          <span>·</span>
          <span
            className={cn(
              "font-medium",
              live ? "text-rose-500" : finished ? "text-slate-400" : "text-sky-500",
            )}
          >
            {match.status}
          </span>
        </div>
      </div>
    </div>
  );
}
