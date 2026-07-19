"use client";

import { useEffect, useState } from "react";
import {
  Crown,
  CheckCircle2,
  Zap,
  Sparkles,
  ShieldCheck,
  Clock,
  CreditCard,
  TrendingUp,
} from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { useToast } from "@/hooks/use-toast";
import {
  apiInitPayment,
  apiVerifyPayment,
  apiSubscriptions,
} from "@/lib/api-client";
import type { SubscriptionRow } from "@/lib/types";
import { PLANS } from "@/lib/constants";
import { formatKES, formatDateTime, cn } from "@/lib/utils";
import { Button, Spinner } from "./ui";
import { Confetti } from "./confetti";

export function SubscriptionTab() {
  const { user, isPremium, refreshUser } = useGoalEdge();
  const { toast } = useToast();
  const [subs, setSubs] = useState<SubscriptionRow[]>([]);
  const [loadingList, setLoadingList] = useState(true);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [confettiFire, setConfettiFire] = useState(0);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const res = await apiSubscriptions();
        if (active) setSubs(res.subscriptions);
      } catch {
        // ignore
      } finally {
        if (active) setLoadingList(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [isPremium]);

  if (!user) return null;

  async function pay() {
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      const init = await apiInitPayment();
      // Mock mode: verify instantly
      const result = await apiVerifyPayment(init.reference);
      if (result.success) {
        setMsg("Premium activated! Enjoy 24 hours of unlimited access.");
        setConfettiFire((f) => f + 1);
        toast({
          title: "🎉 Premium activated!",
          description: "24 hours of unlimited access unlocked.",
        });
        await refreshUser();
        // refresh subscription list
        const res = await apiSubscriptions();
        setSubs(res.subscriptions);
      } else {
        setErr(result.message || "Payment verification failed.");
        toast({
          title: "Payment failed",
          description: result.message || "Verification failed.",
          variant: "destructive",
        });
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Payment failed.");
    } finally {
      setBusy(false);
    }
  }

  const plan = PLANS.premium;
  const expiresAt = user.planExpiresAt ? new Date(user.planExpiresAt) : null;
  const remaining = expiresAt ? Math.max(0, expiresAt.getTime() - Date.now()) : 0;
  const remainingHours = Math.floor(remaining / 3600000);

  return (
    <div className="space-y-6">
      <Confetti fire={confettiFire} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Subscription
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Unlock premium predictions with a single KES 100 payment.
        </p>
      </div>

      {/* Current plan status */}
      <div
        className={cn(
          "rounded-2xl border p-6 shadow-sm",
          isPremium
            ? "border-emerald-200 bg-gradient-to-br from-emerald-50 to-teal-50"
            : "border-slate-200 bg-white",
        )}
      >
        <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div className="flex items-center gap-4">
            <span
              className={cn(
                "flex h-14 w-14 items-center justify-center rounded-2xl",
                isPremium ? "bg-emerald-500 text-white" : "bg-slate-100 text-slate-400",
              )}
            >
              <Crown className="h-7 w-7" />
            </span>
            <div>
              <p className="text-sm font-medium text-slate-500">Current plan</p>
              <p className="text-xl font-bold text-slate-900">
                {isPremium ? "Premium 24hr" : "Free"}
              </p>
              {isPremium && expiresAt && (
                <p className="mt-0.5 text-sm text-emerald-700">
                  <Clock className="mr-1 inline h-3.5 w-3.5" />
                  {remainingHours}h remaining · expires {formatDateTime(expiresAt)}
                </p>
              )}
            </div>
          </div>
          {!isPremium && (
            <Button onClick={pay} disabled={busy} size="lg">
              {busy ? <Spinner /> : (
                <>
                  <Zap className="h-4 w-4" />
                  Activate Premium · {formatKES(plan.price)}
                </>
              )}
            </Button>
          )}
        </div>
        {msg && (
          <div className="mt-4 rounded-lg bg-emerald-100 px-3 py-2 text-sm font-medium text-emerald-800 ring-1 ring-emerald-200">
            <CheckCircle2 className="mr-1 inline h-4 w-4" />
            {msg}
          </div>
        )}
        {err && (
          <div className="mt-4 rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
            {err}
          </div>
        )}
      </div>

      {/* Plan comparison */}
      <div className="grid gap-6 lg:grid-cols-2">
        <PlanCard
          plan={PLANS.free}
          current={user.plan === "free"}
        />
        <PlanCard
          plan={plan}
          current={isPremium}
          highlight
          onAction={isPremium ? undefined : pay}
          busy={busy}
        />
      </div>

      {/* Payment history */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <CreditCard className="h-4 w-4 text-slate-400" />
            Payment history
          </h2>
        </div>
        {loadingList ? (
          <div className="flex items-center justify-center px-5 py-10">
            <Spinner className="h-5 w-5 text-emerald-500" />
          </div>
        ) : subs.length === 0 ? (
          <div className="px-5 py-10 text-center text-sm text-slate-500">
            No payments yet. Upgrade to see your history here.
          </div>
        ) : (
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Reference</th>
                  <th className="px-5 py-3 font-semibold">Amount</th>
                  <th className="px-5 py-3 font-semibold">Plan</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {subs.map((s) => (
                  <tr key={s.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3 font-mono text-xs text-slate-600">{s.reference}</td>
                    <td className="px-5 py-3 font-medium text-slate-700">
                      {formatKES(s.amount)}
                    </td>
                    <td className="px-5 py-3 text-slate-600">{s.plan}</td>
                    <td className="px-5 py-3">
                      <StatusBadge status={s.status} />
                    </td>
                    <td className="px-5 py-3 text-slate-500">{formatDateTime(s.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Trust strip */}
      <div className="grid gap-4 sm:grid-cols-3">
        <Trust icon={<ShieldCheck className="h-5 w-5" />} title="Secure payments" desc="Bank-grade encryption via Paystack." />
        <Trust icon={<Zap className="h-5 w-5" />} title="Instant access" desc="Premium unlocks the moment you pay." />
        <Trust icon={<TrendingUp className="h-5 w-5" />} title="Cancel anytime" desc="24-hour pass. No auto-renewal." />
      </div>
    </div>
  );
}

function PlanCard({
  plan,
  current,
  highlight,
  onAction,
  busy,
}: {
  plan: { name: string; price: number; period: string; features: string[] };
  current: boolean;
  highlight?: boolean;
  onAction?: () => void;
  busy?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative flex flex-col rounded-2xl border bg-white p-6 shadow-sm",
        highlight ? "border-emerald-300 ring-2 ring-emerald-200" : "border-slate-200",
      )}
    >
      {highlight && (
        <span className="absolute -top-3 left-6 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
          <Sparkles className="h-3 w-3" />
          Most popular
        </span>
      )}
      <h3 className="font-bold text-slate-900">{plan.name}</h3>
      <div className="mt-2 flex items-baseline gap-1">
        <span className="text-3xl font-bold text-slate-900">
          {plan.price === 0 ? "Free" : formatKES(plan.price)}
        </span>
        {plan.price > 0 && <span className="text-sm text-slate-400">{plan.period}</span>}
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
        {current ? (
          <div className="inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-50 text-sm font-semibold text-emerald-700 ring-1 ring-emerald-200">
            <CheckCircle2 className="mr-1.5 h-4 w-4" />
            Current plan
          </div>
        ) : onAction ? (
          <Button onClick={onAction} disabled={busy} className="w-full">
            {busy ? <Spinner /> : "Choose plan"}
          </Button>
        ) : (
          <div className="inline-flex h-11 w-full items-center justify-center rounded-xl border border-slate-200 text-sm font-semibold text-slate-400">
            Current plan
          </div>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    success: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    initialized: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    abandoned: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
  };
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2 py-0.5 text-xs font-semibold capitalize",
        map[status] ?? map.abandoned,
      )}
    >
      {status}
    </span>
  );
}

function Trust({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5">
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
        {icon}
      </span>
      <h4 className="mt-3 font-bold text-slate-900">{title}</h4>
      <p className="mt-1 text-sm text-slate-500">{desc}</p>
    </div>
  );
}
