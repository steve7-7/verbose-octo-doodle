"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from "recharts";
import {
  Trophy,
  Target,
  TrendingUp,
  Percent,
  BarChart3,
  Shield,
  Gauge,
  PieChart as PieIcon,
  Activity,
  Sparkles,
} from "lucide-react";
import { apiAnalytics, type Analytics } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui";
import { LeagueDetailModal } from "./league-detail-modal";

const PIE_COLORS = ["#10b981", "#0ea5e9", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1"];

export function AnalyticsTab() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [leagueModal, setLeagueModal] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const a = await apiAnalytics();
        if (active) setData(a);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6 text-emerald-500" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
        Couldn&apos;t load analytics. Try refreshing.
      </div>
    );
  }

  const winRatePct =
    data.totals.won + data.totals.lost > 0
      ? Math.round((data.totals.won / (data.totals.won + data.totals.lost)) * 100)
      : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Analytics
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Performance insights across leagues, markets, risk and confidence.
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Kpi
          icon={<Trophy className="h-5 w-5" />}
          label="Win rate"
          value={`${winRatePct}%`}
          sub={`${data.totals.won}W · ${data.totals.lost}L`}
          accent="emerald"
        />
        <Kpi
          icon={<Target className="h-5 w-5" />}
          label="Total tips"
          value={data.totals.total}
          sub={`${data.totals.pending} upcoming`}
          accent="sky"
        />
        <Kpi
          icon={<Gauge className="h-5 w-5" />}
          label="Avg conf (won)"
          value={`${data.insight.avgConfWon}%`}
          sub={`vs ${data.insight.avgConfLost}% (lost)`}
          accent="amber"
        />
        <Kpi
          icon={<TrendingUp className="h-5 w-5" />}
          label="Avg odds (won)"
          value={data.insight.avgOddsWon.toFixed(2)}
          sub={`vs ${data.insight.avgOddsLost.toFixed(2)} (lost)`}
          accent="rose"
        />
      </div>

      {/* Win-rate trend */}
      <ChartCard
        title="Cumulative win-rate trend"
        subtitle="Running win rate as tips settle over time"
        icon={<Activity className="h-4 w-4 text-emerald-500" />}
      >
        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={data.trend} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
            <defs>
              <linearGradient id="wr" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                border: "1px solid #e2e8f0",
                fontSize: 12,
                boxShadow: "0 8px 24px rgba(15,23,42,0.08)",
              }}
              formatter={(v: number, n) => (n === "winRate" ? [`${v}%`, "Win rate"] : [v, n])}
            />
            <Area
              type="monotone"
              dataKey="winRate"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#wr)"
              dot={{ r: 3, fill: "#10b981", strokeWidth: 0 }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* League breakdown */}
        <ChartCard
          title="Tips by league"
          subtitle="Volume per competition"
          icon={<BarChart3 className="h-4 w-4 text-sky-500" />}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart
              data={data.byLeague.slice(0, 8)}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="league"
                width={110}
                tick={{ fontSize: 11, fill: "#64748b" }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(16,185,129,0.06)" }}
              />
              <Bar dataKey="total" radius={[0, 6, 6, 0]} fill="#10b981" barSize={16} />
            </BarChart>
          </ResponsiveContainer>
          {data.byLeague.length > 0 && (
            <div className="mt-3 space-y-1.5">
              {data.byLeague.slice(0, 4).map((l) => (
                <button
                  key={l.league}
                  onClick={() => setLeagueModal(l.league)}
                  className="flex w-full items-center justify-between rounded-lg px-2 py-1.5 text-xs transition hover:bg-emerald-50"
                >
                  <span className="font-medium text-slate-600 hover:text-emerald-700">{l.league}</span>
                  <span className="text-slate-400">
                    {l.won}W / {l.lost}L · {l.winRate}% WR
                  </span>
                </button>
              ))}
              <p className="pt-1 text-center text-[10px] text-slate-400">Click a league for details</p>
            </div>
          )}
        </ChartCard>

        {/* Risk + Confidence pie */}
        <ChartCard
          title="Confidence distribution"
          subtitle="How picks are spread by confidence tier"
          icon={<PieIcon className="h-4 w-4 text-amber-500" />}
        >
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={data.confidence}
                dataKey="count"
                nameKey="range"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={95}
                paddingAngle={2}
                stroke="#fff"
                strokeWidth={2}
              >
                {data.confidence.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
              />
              <Legend
                iconType="circle"
                wrapperStyle={{ fontSize: 11, paddingTop: 8 }}
              />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risk breakdown */}
        <ChartCard
          title="Risk profile"
          subtitle="Distribution of risk levels"
          icon={<Shield className="h-4 w-4 text-rose-500" />}
        >
          <div className="space-y-4 pt-2">
            <RiskBar label="Low risk" value={data.risk.low} total={data.totals.total} color="bg-emerald-500" />
            <RiskBar label="Medium risk" value={data.risk.medium} total={data.totals.total} color="bg-amber-500" />
            <RiskBar label="High risk" value={data.risk.high} total={data.totals.total} color="bg-rose-500" />
          </div>
          <div className="mt-5 grid grid-cols-3 gap-2 border-t border-slate-100 pt-4">
            <Mini label="Low" value={data.risk.low} tone="emerald" />
            <Mini label="Medium" value={data.risk.medium} tone="amber" />
            <Mini label="High" value={data.risk.high} tone="rose" />
          </div>
        </ChartCard>

        {/* Market breakdown */}
        <ChartCard
          title="Tips by market"
          subtitle="Which betting markets we cover"
          icon={<Percent className="h-4 w-4 text-violet-500" />}
        >
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={data.byMarket} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis
                dataKey="market"
                tick={{ fontSize: 10, fill: "#94a3b8" }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-20}
                textAnchor="end"
                height={56}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{
                  borderRadius: 12,
                  border: "1px solid #e2e8f0",
                  fontSize: 12,
                }}
                cursor={{ fill: "rgba(139,92,246,0.06)" }}
              />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} fill="#8b5cf6" barSize={28} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      {/* Insight banner */}
      <div className="overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-600/20">
        <div className="flex items-start gap-3">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <h3 className="text-base font-bold">Key insight</h3>
            <p className="mt-1 text-sm text-emerald-50">
              Winning tips average <b>{data.insight.avgConfWon}%</b> confidence at{" "}
              <b>{data.insight.avgOddsWon.toFixed(2)}</b> odds, vs{" "}
              <b>{data.insight.avgConfLost}%</b> / <b>{data.insight.avgOddsLost.toFixed(2)}</b> for
              losing tips. {data.insight.avgConfWon > data.insight.avgConfLost
                ? "Higher-confidence picks are paying off — trust the model."
                : "Watch out: lower-confidence value bets are punching above their weight."}
            </p>
          </div>
        </div>
      </div>

      <LeagueDetailModal
        league={leagueModal}
        open={!!leagueModal}
        onClose={() => setLeagueModal(null)}
      />
    </div>
  );
}

function Kpi({
  icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  sub: string;
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
      <p className="mt-0.5 text-xs text-slate-400">{sub}</p>
    </div>
  );
}

function ChartCard({
  title,
  subtitle,
  icon,
  children,
}: {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            {icon}
            {title}
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">{subtitle}</p>
        </div>
      </div>
      {children}
    </div>
  );
}

function RiskBar({
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
        <span className="font-medium text-slate-600">{label}</span>
        <span className="font-semibold text-slate-700">
          {value} · {pct}%
        </span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full transition-all", color)} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function Mini({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "emerald" | "amber" | "rose";
}) {
  const map = {
    emerald: "text-emerald-600",
    amber: "text-amber-600",
    rose: "text-rose-600",
  } as const;
  return (
    <div className="text-center">
      <p className={cn("text-lg font-bold", map[tone])}>{value}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
