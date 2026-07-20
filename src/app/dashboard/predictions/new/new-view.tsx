"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PredictionForm } from "@/components/prediction-form";
import { usePredictions } from "@/hooks/use-predictions";
import { toast } from "@/components/toaster";
import { PageHeader } from "@/components/page-header";
import type { PredictionInput } from "@/lib/validation";

export function NewPredictionView() {
  const router = useRouter();
  const { createPrediction } = usePredictions({});
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(values: PredictionInput) {
    setSubmitting(true);
    const res = await createPrediction(values);
    setSubmitting(false);
    if (res.ok) {
      toast.success("Prediction published.");
      router.push("/dashboard/predictions");
      router.refresh();
    } else {
      toast.error(res.error || "Could not create prediction.");
    }
  }

  return (
    <>
      <PageHeader
        title="New prediction"
        description="Publish a fresh tip to the prediction board."
      />
      <PredictionForm
        onSubmit={onSubmit}
        submitting={submitting}
        submitLabel="Publish prediction"
      />
    </>
  );
}
