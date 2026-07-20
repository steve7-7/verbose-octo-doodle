import { requireUser } from "@/lib/auth";
import { listPredictions } from "@/lib/queries";
import { PageHeader } from "@/components/page-header";
import { TesterView } from "./tester-view";

export const dynamic = "force-dynamic";

export default async function TesterPage() {
  await requireUser();
  // Fetch sample predictions (both free and premium) for previewing
  const samplePredictions = await listPredictions({}, true, 6);

  return (
    <>
      <PageHeader
        title="Performance Cache Server & Preview Studio"
        description="Run live page load benchmarks, manage the in-memory cache server, and preview user tiers instantly."
      />
      <TesterView samplePredictions={samplePredictions} />
    </>
  );
}
