"use client";

import { useEffect, useState } from "react";
import {
  Activity as ActivityIcon,
  LogIn,
  UserPlus,
  Ticket,
  Crown,
  FilePlus,
  Trophy,
  User as UserIcon,
  Gift,
  Copy,
  Check,
  Share2,
  Users,
  Sparkles,
} from "lucide-react";
import { apiActivity, apiReferral, type Activity, type ReferralInfo } from "@/lib/api-client";
import { cn, formatDateTime } from "@/lib/utils";
import { Spinner } from "./ui";
import { useToast } from "@/hooks/use-toast";

const ACTIVITY_META: Record<string, { icon: typeof LogIn; color: string; label: string }> = {
  login: { icon: LogIn, color: "bg-sky-100 text-sky-600", label: "Signed in" },
  register: { icon: UserPlus, color: "bg-emerald-100 text-emerald-600", label: "Created account" },
  slip_shared: { icon: Ticket, color: "bg-amber-100 text-amber-600", label: "Shared bet slip" },
  premium_activated: { icon: Crown, color: "bg-amber-100 text-amber-600", label: "Activated premium" },
  prediction_created: { icon: FilePlus, color: "bg-emerald-100 text-emerald-600", label: "Created prediction" },
  prediction_settled: { icon: Trophy, color: "bg-violet-100 text-violet-600", label: "Settled prediction" },
  profile_updated: { icon: UserIcon, color: "bg-slate-100 text-slate-600", label: "Updated profile" },
};

export function ActivityTab() {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [referral, setReferral] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [a, r] = await Promise.all([apiActivity(), apiReferral()]);
        if (!active) return;
        setActivities(a.activities);
        setReferral(r);
      } catch {
        // ignore
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  function copyReferralCode() {
    if (!referral) return;
    navigator.clipboard.writeText(referral.code).then(() => {
      setCopied(true);
      toast({ title: "Referral code copied", description: "Share it with friends!" });
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareReferral() {
    if (!referral) return;
    const text = `Join me on GoalEdge for smarter football predictions! Use my referral code: ${referral.code}`;
    if (navigator.share) {
      navigator.share({ title: "GoalEdge referral", text }).catch(() => {});
    } else {
      navigator.clipboard.writeText(text).then(() => {
        toast({ title: "Referral link copied", description: "Share it anywhere!" });
      });
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner className="h-6 w-6 text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Activity &amp; referrals
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Your recent actions and referral program dashboard.
        </p>
      </div>

      {/* Referral program card */}
      {referral && (
        <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-6 text-white shadow-lg shadow-emerald-600/20">
          <div className="flex items-start gap-3">
            <Gift className="mt-0.5 h-6 w-6 shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-bold">Refer friends, earn premium</h3>
              <p className="mt-1 text-sm text-emerald-50">
                Share your code — when a friend activates premium, you both get{" "}
                {referral.rewardPerReferral}h of premium free.
              </p>
            </div>
          </div>

          {/* Referral code */}
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex-1 rounded-xl bg-white/15 px-4 py-3 backdrop-blur">
              <p className="text-xs font-medium uppercase tracking-wide text-emerald-100">
                Your referral code
              </p>
              <p className="mt-0.5 font-mono text-lg font-bold tracking-wider">
                {referral.code}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={copyReferralCode}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white px-4 py-3 text-sm font-semibold text-emerald-700 shadow-sm transition hover:bg-emerald-50"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={shareReferral}
                className="inline-flex items-center gap-1.5 rounded-xl bg-white/15 px-4 py-3 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/25"
              >
                <Share2 className="h-4 w-4" />
                Share
              </button>
            </div>
          </div>

          {/* Referral stats */}
          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-emerald-100" />
                <span className="text-xs font-medium text-emerald-100">Total referrals</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{referral.referralCount}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 backdrop-blur">
              <div className="flex items-center gap-2">
                <Crown className="h-4 w-4 text-emerald-100" />
                <span className="text-xs font-medium text-emerald-100">Premium referrals</span>
              </div>
              <p className="mt-1 text-2xl font-bold">{referral.premiumReferrals}</p>
            </div>
          </div>
        </div>
      )}

      {/* Activity feed */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-5 py-4">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <ActivityIcon className="h-4 w-4 text-emerald-500" />
            Recent activity
          </h3>
        </div>
        {activities.length === 0 ? (
          <div className="px-5 py-12 text-center text-sm text-slate-500">
            <Sparkles className="mx-auto h-8 w-8 text-slate-300" />
            <p className="mt-2">No activity yet. Start exploring to build your feed!</p>
          </div>
        ) : (
          <div className="max-h-[60vh] divide-y divide-slate-100 overflow-y-auto">
            {activities.map((a) => {
              const meta = ACTIVITY_META[a.type] ?? {
                icon: ActivityIcon,
                color: "bg-slate-100 text-slate-600",
                label: a.type,
              };
              const Icon = meta.icon;
              return (
                <div key={a.id} className="flex items-start gap-3 px-5 py-3.5 transition hover:bg-slate-50/60">
                  <span className={cn("flex h-9 w-9 shrink-0 items-center justify-center rounded-lg", meta.color)}>
                    <Icon className="h-4 w-4" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-slate-800">{meta.label}</p>
                    {a.detail && <p className="truncate text-xs text-slate-500">{a.detail}</p>}
                    <p className="mt-0.5 text-xs text-slate-400">{formatDateTime(a.createdAt)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
