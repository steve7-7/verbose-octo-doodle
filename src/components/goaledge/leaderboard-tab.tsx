"use client";

import { useEffect, useState } from "react";
import {
  Trophy,
  Medal,
  Award,
  TrendingUp,
  Target,
  Gauge,
  Crown,
  Flame,
  Star,
  UserPlus,
  UserCheck,
} from "lucide-react";
import { apiLeaderboard, type Tipster } from "@/lib/api-client";
import { useFollowing } from "@/hooks/use-following";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui";

export function LeaderboardTab() {
  const [tipsters, setTipsters] = useState<Tipster[]>([]);
  const { following, loaded, load: loadFollowing, toggle, isFollowingTipster } = useFollowing();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [res] = await Promise.all([apiLeaderboard(), loadFollowing()]);
        if (active) setTipsters(res.tipsters);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [loadFollowing]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6 text-emerald-500" />
      </div>
    );
  }

  if (tipsters.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
        No tipster data yet.
      </div>
    );
  }

  const podium = tipsters.slice(0, 3);
  const rest = tipsters.slice(3);
  const top = tipsters[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Tipster leaderboard
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Ranked by win rate, settled volume and consistency.
        </p>
      </div>

      {/* Top performer highlight */}
      {top && (
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-white/10" />
          <div className="absolute -bottom-12 -left-6 h-32 w-32 rounded-full bg-white/5" />
          <div className="relative flex items-center gap-4">
            <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15 ring-2 ring-white/30">
              <Crown className="h-8 w-8 text-amber-200" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                #1 Tipster
              </p>
              <h2 className="truncate text-2xl font-bold">{top.name}</h2>
              <p className="mt-0.5 text-sm text-emerald-50">
                {top.winRate}% win rate · {top.won}W / {top.lost}L · {top.total} tips
              </p>
            </div>
            <div className="hidden text-right sm:block">
              <p className="text-3xl font-extrabold">{top.winRate}%</p>
              <p className="text-xs text-emerald-100">win rate</p>
            </div>
          </div>
        </div>
      )}

      {/* Podium (top 3) */}
      {podium.length > 1 && (
        <div className="grid gap-4 sm:grid-cols-3">
          {podium.map((t, i) => (
            <PodiumCard key={t.name} tipster={t} rank={i + 1} />
          ))}
        </div>
      )}

      {/* Full ranking table */}
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Trophy className="h-4 w-4 text-amber-500" />
            Full ranking
          </h3>
        </div>
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">#</th>
                <th className="px-4 py-3 font-semibold">Tipster</th>
                <th className="px-4 py-3 font-semibold">Win rate</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">W/L</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Tips</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Avg conf</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Avg odds</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {tipsters.map((t, i) => (
                <tr key={t.name} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <RankBadge rank={i + 1} />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: avatarColor(t.name) }}
                      >
                        {t.name.charAt(0).toUpperCase()}
                      </span>
                      <div>
                        <p className="font-semibold text-slate-800">{t.name}</p>
                        {t.premium > 0 && (
                          <p className="text-xs text-amber-600">
                            <Crown className="mr-0.5 inline h-2.5 w-2.5" />
                            {t.premium} premium
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className={cn(
                          "text-base font-bold",
                          t.winRate >= 70
                            ? "text-emerald-600"
                            : t.winRate >= 50
                              ? "text-amber-600"
                              : "text-slate-600",
                        )}
                      >
                        {t.winRate}%
                      </span>
                      <div className="hidden h-1.5 w-12 overflow-hidden rounded-full bg-slate-100 sm:block">
                        <div
                          className={cn(
                            "h-full rounded-full",
                            t.winRate >= 70 ? "bg-emerald-500" : t.winRate >= 50 ? "bg-amber-500" : "bg-slate-400",
                          )}
                          style={{ width: `${t.winRate}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <span className="font-medium text-emerald-600">{t.won}W</span>
                    <span className="mx-1 text-slate-300">/</span>
                    <span className="font-medium text-rose-600">{t.lost}L</span>
                  </td>
                  <td className="hidden px-4 py-3 text-slate-600 md:table-cell">{t.total}</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{t.avgConfidence}%</td>
                  <td className="hidden px-4 py-3 text-slate-600 lg:table-cell">{t.avgOdds.toFixed(2)}</td>
                  <td className="px-4 py-3 text-right">
                    <FollowButton
                      tipster={t.name}
                      isFollowing={isFollowingTipster(t.name)}
                      onToggle={() => toggle(t.name)}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <SummaryCard
          icon={<Target className="h-5 w-5" />}
          label="Active tipsters"
          value={tipsters.length}
          accent="emerald"
        />
        <SummaryCard
          icon={<Trophy className="h-5 w-5" />}
          label="Top win rate"
          value={`${top?.winRate ?? 0}%`}
          accent="amber"
        />
        <SummaryCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total tips"
          value={tipsters.reduce((s, t) => s + t.total, 0)}
          accent="sky"
        />
        <SummaryCard
          icon={<Gauge className="h-5 w-5" />}
          label="Settled tips"
          value={tipsters.reduce((s, t) => s + t.settled, 0)}
          accent="rose"
        />
      </div>
    </div>
  );
}

function PodiumCard({ tipster, rank }: { tipster: Tipster; rank: number }) {
  const config = {
    1: { icon: Crown, color: "from-amber-400 to-amber-500", ring: "ring-amber-200", label: "1st", iconColor: "text-amber-200" },
    2: { icon: Medal, color: "from-slate-300 to-slate-400", ring: "ring-slate-200", label: "2nd", iconColor: "text-slate-100" },
    3: { icon: Award, color: "from-orange-400 to-orange-600", ring: "ring-orange-200", label: "3rd", iconColor: "text-orange-100" },
  }[rank] ?? { icon: Star, color: "from-slate-300 to-slate-400", ring: "ring-slate-200", label: `${rank}`, iconColor: "text-slate-100" };

  const Icon = config.icon;

  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border-2 bg-white p-5 shadow-sm",
        rank === 1 ? "border-amber-300 ring-2 ring-amber-100" : "border-slate-200",
      )}
    >
      {rank === 1 && (
        <span className="absolute right-3 top-3 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-700">
          <Flame className="mr-0.5 inline h-3 w-3" />
          Hot
        </span>
      )}
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br text-white shadow-md",
            config.color,
          )}
        >
          <Icon className={cn("h-6 w-6", config.iconColor)} />
        </span>
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {config.label}
          </p>
          <p className="font-bold text-slate-900">{tipster.name}</p>
        </div>
      </div>
      <div className="mt-4 flex items-baseline justify-between">
        <span className="text-3xl font-extrabold text-slate-900">{tipster.winRate}%</span>
        <span className="text-xs text-slate-400">win rate</span>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
        <Mini label="Tips" value={tipster.total} />
        <Mini label="Won" value={tipster.won} tone="emerald" />
        <Mini label="Lost" value={tipster.lost} tone="rose" />
      </div>
    </div>
  );
}

function RankBadge({ rank }: { rank: number }) {
  if (rank === 1)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-amber-100 text-xs font-bold text-amber-700">
        {rank}
      </span>
    );
  if (rank === 2)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200 text-xs font-bold text-slate-600">
        {rank}
      </span>
    );
  if (rank === 3)
    return (
      <span className="flex h-7 w-7 items-center justify-center rounded-full bg-orange-100 text-xs font-bold text-orange-700">
        {rank}
      </span>
    );
  return (
    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-slate-500">
      {rank}
    </span>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "emerald" | "rose";
}) {
  const color =
    tone === "emerald" ? "text-emerald-600" : tone === "rose" ? "text-rose-600" : "text-slate-700";
  return (
    <div>
      <p className={cn("text-sm font-bold", color)}>{value}</p>
      <p className="text-[10px] uppercase tracking-wide text-slate-400">{label}</p>
    </div>
  );
}

function SummaryCard({
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

// Deterministic color per tipster name
function avatarColor(name: string): string {
  const palette = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return palette[Math.abs(hash) % palette.length]!;
}

// Follow/unfollow button for a tipster
function FollowButton({
  tipster,
  isFollowing,
  onToggle,
}: {
  tipster: string;
  isFollowing: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className={cn(
        "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition",
        isFollowing
          ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100"
          : "bg-slate-100 text-slate-600 hover:bg-slate-200",
      )}
    >
      {isFollowing ? (
        <>
          <UserCheck className="h-3.5 w-3.5" />
          Following
        </>
      ) : (
        <>
          <UserPlus className="h-3.5 w-3.5" />
          Follow
        </>
      )}
    </button>
  );
}
