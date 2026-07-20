import { requireAdmin } from "@/lib/auth";
import { NewPredictionView } from "./new-view";

export const dynamic = "force-dynamic";

export default async function NewPredictionPage() {
  await requireAdmin();
  return <NewPredictionView />;
}
