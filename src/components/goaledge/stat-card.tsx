import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

const ACCENTS = {
  emerald: { bg: "bg-emerald-100", text: "text-emerald-600", bar: "from-emerald-400 to-emerald-600" },
  indigo: { bg: "bg-indigo-100", text: "text-indigo-600", bar: "from-indigo-400 to-indigo-600" },
  sky: { bg: "bg-sky-100", text: "text-sky-600", bar: "from-sky-400 to-sky-600" },
  amber: { bg: "bg-amber-100", text: "text-amber-600", bar: "from-amber-400 to-amber-600" },
  rose: { bg: "bg-rose-100", text: "text-rose-600", bar: "from-rose-400 to-rose-600" },
} as const;

export function StatCard({
  icon,
  label,
  value,
  sub,
  accent = "emerald",
}: {
  icon: ReactNode;
  label: string;
  value: string | number;
  sub?: string;
  accent?: keyof typeof ACCENTS;
}) {
  const a = ACCENTS[accent];
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition hover:shadow-md">
      {/* Gradient top accent bar */}
      <div className={cn("absolute inset-x-0 top-0 h-1 bg-gradient-to-r opacity-80", a.bar)} />
      <div className="flex items-center justify-between">
        <span className={cn("flex h-10 w-10 items-center justify-center rounded-xl transition group-hover:scale-110", a.bg, a.text)}>
          {icon}
        </span>
      </div>
      <p className="mt-3 text-2xl font-bold text-slate-900">{value}</p>
      <p className="text-sm font-medium text-slate-600">{label}</p>
      {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
