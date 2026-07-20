"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Goal } from "lucide-react";
import { usePredictions, type PredictionFilters } from "@/hooks/use-predictions";
import { PredictionCard } from "@/components/prediction-card";
import { PredictionFiltersBar } from "@/components/prediction-filters";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button, buttonClasses } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/kit";
import { toast } from "@/components/toaster";
import type { ClientPrediction } from "@/lib/types";

function PredictionSkeleton() {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <div className="skeleton h-4 w-1/3 rounded" />
      <div className="skeleton mt-4 h-5 w-2/3 rounded" />
      <div className="skeleton mt-4 h-16 w-full rounded-xl" />
      <div className="skeleton mt-4 h-2 w-full rounded-full" />
    </div>
  );
}

export function PredictionsView({
  initial,
  isAdmin,
}: {
  initial: ClientPrediction[];
  isAdmin: boolean;
}) {
  const [filters, setFilters] = useState<PredictionFilters>({});
  const { predictions, isLoading, isValidating, deletePrediction } =
    usePredictions(filters, initial);
  const [toDelete, setToDelete] = useState<number | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function confirmDelete() {
    if (toDelete == null) return;
    setDeleting(true);
    const res = await deletePrediction(toDelete);
    setDeleting(false);
    setToDelete(null);
    if (res.ok) toast.success("Prediction deleted.");
    else toast.error(res.error || "Could not delete prediction.");
  }

  return (
    <div className="space-y-5">
      {isValidating && !isLoading && (
        <div className="h-0.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div className="h-full w-1/3 animate-[shimmer_1.2s_infinite] bg-emerald-500" />
        </div>
      )}

      <PredictionFiltersBar
        filters={filters}
        onChange={setFilters}
        count={predictions.length}
      />

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <PredictionSkeleton key={i} />
          ))}
        </div>
      ) : predictions.length === 0 ? (
        <EmptyState
          icon={<Goal className="h-6 w-6" />}
          title="No predictions found"
          description="Adjust your filters or check back later for fresh tips."
          action={
            isAdmin ? (
              <Link
                href="/dashboard/predictions/new"
                className={buttonClasses("primary", "md")}
              >
                <Plus className="h-4 w-4" />
                New prediction
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {predictions.map((p) => (
            <PredictionCard
              key={p.id}
              prediction={p}
              isAdmin={isAdmin}
              onDelete={setToDelete}
            />
          ))}
        </div>
      )}

      <ConfirmDialog
        open={toDelete != null}
        title="Delete prediction?"
        message="This will permanently remove the tip from the board. This action cannot be undone."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      />
    </div>
  );
}
