import Link from "next/link";
import {
  TrendingUp,
  Trophy,
  Target,
  Crown,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getStats, listPredictions, isPremiumUser } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { StatCard } from "@/components/stat-card";
import { PredictionCard } from "@/components/prediction-card";
import { buttonClasses } from "@/components/ui/button";
import { cn, formatDateTime } from "@/lib/utils";

export const dynamic = "force-dynamic";

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 18) return "Good afternoon";
  return "Good evening";
}

export default async function OverviewPage() {
  const user = await requireUser();
  const isPremium = isPremiumUser(user);
  const isAdmin = user.role === "admin";

  const [stats, upcoming, won, lost] = await Promise.all([
    getStats(),
    listPredictions({ status: "upcoming" }, isPremium, 6),
    listPredictions({ status: "won" }, isPremium, 8),
    listPredictions({ status: "lost" }, isPremium, 8),
  ]);

  const results = [...won, ...lost]
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
    .slice(0, 6);

  return (
    <>
      <PageHeader
        title={`${greeting()}, ${user.name.split(" ")[0]} 👋`}
        description="Here's your snapshot of today's football action."
      >
        <Link href="/dashboard/predictions" className={buttonClasses("outline", "sm")}>
          View all tips
          <ArrowRight className="h-4 w-4" />
        </Link>
      </PageHeader>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard
          icon={<Target className="h-5 w-5" />}
          label="Active tips"
          value={stats.upcoming}
          sub="Upcoming matches"
          accent="emerald"
        />
        <StatCard
          icon={<Trophy className="h-5 w-5" />}
          label="Win rate"
          value={`${stats.winRate}%`}
          sub={`${stats.won}W · ${stats.lost}L settled`}
          accent="indigo"
        />
        <StatCard
          icon={<TrendingUp className="h-5 w-5" />}
          label="Total tips"
          value={stats.total}
          sub="All-time predictions"
          accent="sky"
        />
        <StatCard
          icon={<Crown className="h-5 w-5" />}
          label="Premium picks"
          value={stats.premium}
          sub="High-value tips"
          accent="amber"
        />
      </div>

      {!isPremium && (
        <div className="mt-6 overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-600/20 sm:p-7">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <div>
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                <h2 className="text-lg font-bold">Unlock Premium predictions</h2>
              </div>
              <p className="mt-1 max-w-lg text-sm text-emerald-50">
                Get unlimited access to in-depth analysis, accumulator slips and
                real-time value alerts. Plans from ₦5,000/month.
              </p>
            </div>
            <Link
              href="/dashboard/subscription"
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-white px-5 py-2.5 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
            >
              <Crown className="h-4 w-4" />
              Upgrade now
            </Link>
          </div>
        </div>
      )}

      <div className="mt-8 grid gap-6 lg:grid-cols-3">
        <section className="lg:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Upcoming tips</h2>
            <Link
              href="/dashboard/predictions"
              className="text-sm font-medium text-emerald-600 hover:text-emerald-700"
            >
              See all
            </Link>
          </div>
          {upcoming.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 bg-white/60 px-6 py-10 text-center text-sm text-slate-500">
              No upcoming tips right now. Check back soon.
            </div>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2">
              {upcoming.map((p) => (
                <PredictionCard
                  key={p.id}
                  prediction={p}
                  isAdmin={isAdmin}
                />
              ))}
            </div>
          )}
        </section>

        <aside className="space-y-6">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">
              Recent form
            </h3>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {results.length === 0 && (
                <p className="text-sm text-slate-400">No settled tips yet.</p>
              )}
              {results.map((r) => (
                <span
                  key={r.id}
                  title={`${r.homeTeam} vs ${r.awayTeam}`}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-md text-xs font-bold text-white",
                    r.status === "won" ? "bg-emerald-500" : "bg-rose-500",
                  )}
                >
                  {r.status === "won" ? "W" : "L"}
                </span>
              ))}
            </div>

            <div className="mt-5 space-y-2">
              {results.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  className="flex items-center justify-between gap-2 rounded-lg border border-slate-100 px-3 py-2"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-slate-700">
                      {r.homeTeam} v {r.awayTeam}
                    </p>
                    <p className="text-xs text-slate-400">
                      {formatDateTime(r.kickoffAt)}
                    </p>
                  </div>
                  {r.status === "won" ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-emerald-500" />
                  ) : (
                    <XCircle className="h-5 w-5 shrink-0 text-rose-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Performance</h3>
            <div className="mt-4 space-y-3">
              <PerfRow label="Wins" value={stats.won} total={stats.settled} color="bg-emerald-500" />
              <PerfRow label="Losses" value={stats.lost} total={stats.settled} color="bg-rose-500" />
            </div>
            <p className="mt-4 text-xs text-slate-400">
              {stats.winRate}% hit rate across {stats.settled} settled tips.
            </p>
          </div>
        </aside>
      </div>
    </>
  );
}

function PerfRow({
  label,
  value,
  total,
  color,
}: {
  label: string;
  value: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((value / total) * 100) : 0;
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-xs">
        <span className="font-medium text-slate-500">{label}</span>
        <span className="font-semibold text-slate-700">{value}</span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
