"use client";

import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import { TrendingUp, Target, Crown, Activity, BarChart3, PieChart as PieIcon } from "lucide-react";
import { apiAnalytics, type Analytics } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { Spinner } from "./ui";

const STATUS_COLORS = ["#10b981", "#f43f5e", "#0ea5e9", "#94a3b8"]; // won, lost, upcoming, void

export function AdminInsights() {
  const [data, setData] = useState<Analytics | null>(null);
  const [loading, setLoading] = useState(true);

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
      <div className="flex items-center justify-center py-8">
        <Spinner className="h-5 w-5 text-emerald-500" />
      </div>
    );
  }

  if (!data) return null;

  const statusData = [
    { name: "Won", value: data.totals.won, color: STATUS_COLORS[0] },
    { name: "Upcoming", value: data.totals.pending, color: STATUS_COLORS[2] },
    { name: "Lost", value: data.totals.lost, color: STATUS_COLORS[1] },
  ].filter((d) => d.value > 0);

  const topLeagues = data.byLeague.slice(0, 6);

  return (
    <div className="space-y-4">
      {/* KPI row */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <AdminKpi
          icon={<Target className="h-4 w-4" />}
          label="Total tips"
          value={data.totals.total}
          accent="emerald"
        />
        <AdminKpi
          icon={<TrendingUp className="h-4 w-4" />}
          label="Win rate"
          value={`${data.totals.won + data.totals.lost > 0 ? Math.round((data.totals.won / (data.totals.won + data.totals.lost)) * 100) : 0}%`}
          accent="sky"
        />
        <AdminKpi
          icon={<Activity className="h-4 w-4" />}
          label="Upcoming"
          value={data.totals.pending}
          accent="amber"
        />
        <AdminKpi
          icon={<Crown className="h-4 w-4" />}
          label="Premium tips"
          value={data.byLeague.reduce((s, l) => s + (l as unknown as { premium?: number }).premium, 0) || 0}
          accent="rose"
        />
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Status breakdown donut */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <PieIcon className="h-4 w-4 text-emerald-500" />
            Status breakdown
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Distribution of all tips by outcome</p>
          <div className="mt-3 flex items-center gap-4">
            <ResponsiveContainer width="50%" height={140}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={60}
                  paddingAngle={2}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  {statusData.map((d, i) => (
                    <Cell key={i} fill={d.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 12,
                    border: "1px solid #e2e8f0",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex-1 space-y-2">
              {statusData.map((d) => (
                <div key={d.name} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-600">
                    <span
                      className="h-2.5 w-2.5 rounded-full"
                      style={{ backgroundColor: d.color }}
                    />
                    {d.name}
                  </span>
                  <span className="font-bold text-slate-800">{d.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Top leagues bar */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <BarChart3 className="h-4 w-4 text-sky-500" />
            Tips by league
          </h3>
          <p className="mt-0.5 text-xs text-slate-400">Top 6 competitions by volume</p>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart
              data={topLeagues}
              layout="vertical"
              margin={{ top: 4, right: 16, left: 8, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="league"
                width={90}
                tick={{ fontSize: 10, fill: "#64748b" }}
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
              <Bar dataKey="total" radius={[0, 6, 6, 0]} fill="#10b981" barSize={14} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function AdminKpi({
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
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2">
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", map[accent])}>
          {icon}
        </span>
        <span className="text-xs font-medium text-slate-500">{label}</span>
      </div>
      <p className="mt-2 text-xl font-bold text-slate-900">{value}</p>
    </div>
  );
}
