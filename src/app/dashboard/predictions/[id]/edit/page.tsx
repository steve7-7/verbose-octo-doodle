import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { getPredictionById } from "@/lib/queries";
import { EditPredictionView } from "./edit-view";

export const dynamic = "force-dynamic";

export default async function EditPredictionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireAdmin();
  const { id } = await params;
  const prediction = await getPredictionById(Number(id), true);
  if (!prediction) notFound();
  return <EditPredictionView prediction={prediction} />;
}
