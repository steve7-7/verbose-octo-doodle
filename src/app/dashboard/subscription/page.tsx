import { desc, eq } from "drizzle-orm";
import { CheckCircle2, Crown, CreditCard, XCircle, Clock } from "lucide-react";
import { db } from "@/db";
import { subscriptions } from "@/db/schema";
import { requireUser } from "@/lib/auth";
import { PLANS, type PlanId } from "@/lib/constants";
import { formatNaira, formatDate, cn } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/kit";
import { buttonClasses } from "@/components/ui/button";
import { UpgradeButton } from "@/components/upgrade-button";

export const dynamic = "force-dynamic";

const STATUS_BADGE: Record<string, string> = {
  success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
  failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
  initialized: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
  abandoned: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
};

export default async function SubscriptionPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; note?: string }>;
}) {
  const user = await requireUser();
  const sp = await searchParams;
  const isPremium = user.plan === "premium";

  const history = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id))
    .orderBy(desc(subscriptions.createdAt));

  return (
    <>
      <PageHeader
        title="Subscription"
        description="Manage your plan and billing via Paystack."
      />

      {sp.status === "success" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-800">
              Payment successful — Premium unlocked!
            </p>
            <p className="text-sm text-emerald-700">
              Enjoy unlimited access to premium tips and analysis.
            </p>
          </div>
        </div>
      )}
      {sp.status === "failed" && (
        <div className="mb-6 flex items-start gap-3 rounded-2xl border border-rose-200 bg-rose-50 p-4">
          <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-rose-600" />
          <div>
            <p className="text-sm font-semibold text-rose-800">
              Payment could not be verified
            </p>
            <p className="text-sm text-rose-700">
              {sp.note || "Please try again or use a different card."}
            </p>
          </div>
        </div>
      )}

      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "flex h-12 w-12 items-center justify-center rounded-xl",
                isPremium ? "bg-amber-100 text-amber-600" : "bg-slate-100 text-slate-500",
              )}
            >
              <Crown className="h-6 w-6" />
            </span>
            <div>
              <p className="text-sm text-slate-500">Current plan</p>
              <p className="text-lg font-bold text-slate-900">
                {isPremium ? "Premium" : "Free"}
              </p>
            </div>
          </div>
          {isPremium && user.planExpiresAt ? (
            <div className="text-right">
              <p className="text-sm text-slate-500">Renews / expires</p>
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(user.planExpiresAt)}
              </p>
            </div>
          ) : (
            <Badge className="bg-slate-100 text-slate-600 ring-1 ring-slate-200">
              Limited access
            </Badge>
          )}
        </div>
      </div>

      <h2 className="mb-4 text-lg font-bold text-slate-900">Choose your plan</h2>
      <div className="grid gap-4 lg:grid-cols-3">
        {(["free", "premium"] as PlanId[]).map((id) => {
          const plan = PLANS[id];
          const isCurrent = (id === "free" && !isPremium) || (id === "premium" && isPremium);
          return (
            <div
              key={id}
              className={cn(
                "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm",
                id === "premium" ? "border-emerald-300 ring-2 ring-emerald-200" : "border-slate-200",
              )}
            >
              {id === "premium" && (
                <span className="absolute -top-3 left-6 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                  Most popular
                </span>
              )}
              <h3 className="text-base font-bold text-slate-900">{plan.name}</h3>
              <div className="mt-2 flex items-baseline gap-1">
                <span className="text-3xl font-bold tracking-tight text-slate-900">
                  {plan.price === 0 ? "Free" : formatNaira(plan.price)}
                </span>
                {plan.price > 0 && (
                  <span className="text-sm text-slate-400">{plan.period}</span>
                )}
              </div>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-slate-600">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                    {f}
                  </li>
                ))}
              </ul>
              <div className="mt-6">
                {id === "free" ? (
                  <span
                    className={cn(
                      buttonClasses("outline", "md"),
                      "w-full cursor-default opacity-70",
                    )}
                  >
                    Current tier
                  </span>
                ) : isCurrent ? (
                  <span
                    className={cn(
                      buttonClasses("subtle", "md"),
                      "w-full cursor-default",
                    )}
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Active
                  </span>
) : (
                   <UpgradeButton planId={id === "premium" ? "premium" : "premium"} label={`Upgrade to ${plan.name}`} />
                 )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-slate-900">
          <CreditCard className="h-5 w-5 text-slate-400" />
          Payment history
        </h2>
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {history.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <Clock className="h-8 w-8 text-slate-300" />
              <p className="mt-3 text-sm font-medium text-slate-600">
                No payments yet
              </p>
              <p className="text-sm text-slate-400">
                Your Paystack transactions will appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-100 bg-slate-50/80 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-5 py-3 font-semibold">Reference</th>
                    <th className="px-5 py-3 font-semibold">Plan</th>
                    <th className="px-5 py-3 font-semibold">Amount</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {history.map((s) => (
                    <tr key={s.id} className="hover:bg-slate-50/60">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">
                        {s.reference}
                      </td>
                      <td className="px-5 py-3 font-medium capitalize text-slate-700">
                        {s.plan}
                      </td>
                      <td className="px-5 py-3 text-slate-700">
                        {formatNaira(s.amount)}
                      </td>
                      <td className="px-5 py-3">
                        <Badge className={STATUS_BADGE[s.status] ?? STATUS_BADGE.abandoned}>
                          {s.status}
                        </Badge>
                      </td>
                      <td className="px-5 py-3 text-slate-500">
                        {formatDate(s.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
