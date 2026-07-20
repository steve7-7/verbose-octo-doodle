import Link from "next/link";
import { Plus } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { listPredictions, isPremiumUser } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { buttonClasses } from "@/components/ui/button";
import { PredictionsView } from "./predictions-view";

export const dynamic = "force-dynamic";

export default async function PredictionsPage() {
  const user = await requireUser();
  const isPremium = isPremiumUser(user);
  const initial = await listPredictions({}, isPremium);

  return (
    <>
      <PageHeader
        title="Predictions"
        description="Browse, track and manage every football tip across all leagues."
      >
        {user.role === "admin" && (
          <Link
            href="/dashboard/predictions/new"
            className={buttonClasses("primary", "sm")}
          >
            <Plus className="h-4 w-4" />
            New prediction
          </Link>
        )}
      </PageHeader>
      <PredictionsView initial={initial} isAdmin={user.role === "admin"} />
    </>
  );
}
