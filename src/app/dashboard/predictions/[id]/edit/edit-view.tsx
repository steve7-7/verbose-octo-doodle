"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PredictionForm } from "@/components/prediction-form";
import { usePredictions } from "@/hooks/use-predictions";
import { toast } from "@/components/toaster";
import { PageHeader } from "@/components/page-header";
import type { Prediction } from "@/db/schema";
import type { PredictionInput } from "@/lib/validation";

export function EditPredictionView({ prediction }: { prediction: Prediction }) {
  const router = useRouter();
  const { updatePrediction } = usePredictions({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values: PredictionInput) {
    setSubmitting(true);
    const res = await updatePrediction(prediction.id, values);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Prediction updated.");
      router.push(`/dashboard/predictions/${prediction.id}`);
      router.refresh();
    } else {
      toast.error(res.error || "Could not update prediction.");
    }
  }

  return (
    <>
      <PageHeader
        title="Edit prediction"
        description="Update the details, status or result of this tip."
      />
      <PredictionForm
        initial={prediction}
        onSubmit={onSubmit}
        submitting={submitting}
        submitLabel="Save changes"
      />
    </>
  );
}
