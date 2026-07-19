"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

// Reusable empty state with icon, title, description, and optional action.
export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: string;
  description?: string;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white px-6 py-14 text-center",
        className,
      )}
    >
      {icon && (
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 text-slate-400 ring-1 ring-slate-200">
          {icon}
        </span>
      )}
      <h3 className="text-base font-bold text-slate-800">{title}</h3>
      {description && (
        <p className="mx-auto mt-1.5 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

// Skeleton card grid for loading states.
export function SkeletonGrid({ count = 6, className }: { count?: number; className?: string }) {
  return (
    <div className={cn("grid gap-4 sm:grid-cols-2 lg:grid-cols-3", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-5"
        >
          <div className="flex items-center gap-2">
            <div className="skeleton h-9 w-9 rounded-xl" />
            <div className="flex-1 space-y-1.5">
              <div className="skeleton h-3 w-20 rounded" />
              <div className="skeleton h-2.5 w-12 rounded" />
            </div>
          </div>
          <div className="space-y-2 pt-2">
            <div className="skeleton h-4 w-3/4 rounded" />
            <div className="skeleton h-3 w-1/2 rounded" />
          </div>
          <div className="skeleton h-16 w-full rounded-xl" />
          <div className="skeleton h-1.5 w-full rounded-full" />
          <div className="flex justify-between pt-1">
            <div className="skeleton h-3 w-16 rounded" />
            <div className="skeleton h-6 w-12 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

// Skeleton for stat cards row.
export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="skeleton h-10 w-10 rounded-xl" />
          <div className="skeleton mt-3 h-7 w-16 rounded" />
          <div className="skeleton mt-2 h-3 w-20 rounded" />
          <div className="skeleton mt-1 h-2.5 w-14 rounded" />
        </div>
      ))}
    </div>
  );
}
