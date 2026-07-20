import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Clock,
  Crown,
  Target,
  Lock,
  Pencil,
  ShieldCheck,
  UserCircle2,
  Activity,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getPredictionById, isPremiumUser } from "@/lib/queries";
import { STATUS_CONFIG, type StatusKey } from "@/lib/constants";
import { cn, formatDateTime, formatDate, timeUntil, isPast } from "@/lib/utils";
import { PageHeader } from "@/components/page-header";
import { ConfidenceBar } from "@/components/confidence-bar";
import { Badge } from "@/components/ui/kit";
import { buttonClasses } from "@/components/ui/button";
import { DeletePredictionButton } from "@/components/delete-prediction-button";

export const dynamic = "force-dynamic";

export default async function PredictionDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  const { id } = await params;
  const numericId = Number(id);
  if (Number.isNaN(numericId)) notFound();

  const prediction = await getPredictionById(numericId, isPremiumUser(user));
  if (!prediction) notFound();

  const p = prediction;
  const status = p.status as StatusKey;
  const sc = STATUS_CONFIG[status] ?? STATUS_CONFIG.upcoming;
  const started = isPast(p.kickoffAt);
  const hasScore = p.scoreHome != null && p.scoreAway != null;
  const isAdmin = user.role === "admin";

  return (
    <>
      <Link
        href="/dashboard/predictions"
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 transition hover:text-slate-800"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to predictions
      </Link>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 p-6">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-2xl">{p.leagueIcon}</span>
              <div>
                <p className="text-sm font-semibold text-slate-700">
                  {p.league}
                </p>
                <p className="text-xs text-slate-400">{p.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-1.5">
              {p.isPremium && (
                <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              )}
              <Badge className={sc.badge}>
                <span className={cn("h-1.5 w-1.5 rounded-full", sc.dot)} />
                {sc.label}
              </Badge>
            </div>
          </div>

          <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {p.homeTeam}{" "}
            <span className="text-slate-300">vs</span> {p.awayTeam}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" />
              {formatDateTime(p.kickoffAt)}
            </span>
            {hasScore ? (
              <span className="inline-flex items-center rounded-md bg-slate-100 px-2 py-0.5 font-semibold text-slate-700">
                Full time · {p.scoreHome}–{p.scoreAway}
              </span>
            ) : !started ? (
              <span className="inline-flex items-center rounded-md bg-emerald-50 px-2 py-0.5 font-medium text-emerald-600">
                Kicks off in {timeUntil(p.kickoffAt)}
              </span>
            ) : null}
          </div>
        </div>

        <div className="grid gap-6 p-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-5">
              <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400">
                <Target className="h-3.5 w-3.5" />
                Our pick · {p.market}
              </p>
              <div className="mt-2 flex items-center justify-between gap-3">
                <p className="text-xl font-bold text-slate-900">{p.tip}</p>
                <span className="shrink-0 rounded-xl bg-white px-3 py-1.5 text-lg font-bold text-emerald-600 ring-1 ring-slate-200">
                  {p.odds.toFixed(2)}
                </span>
              </div>
              <div className="mt-4">
                <ConfidenceBar value={p.confidence} />
              </div>
            </div>

            <div>
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wide text-slate-500">
                In-depth analysis
              </h2>
              {p.analysis ? (
                <p className="whitespace-pre-line text-[15px] leading-relaxed text-slate-700">
                  {p.analysis}
                </p>
              ) : (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-amber-200 bg-amber-50/50 px-6 py-10 text-center">
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-amber-100 text-amber-600">
                    <Lock className="h-5 w-5" />
                  </span>
                  <p className="mt-3 text-sm font-semibold text-slate-800">
                    This analysis is locked
                  </p>
                  <p className="mt-1 max-w-xs text-sm text-slate-500">
                    Upgrade to Premium to read the full reasoning behind this
                    high-value tip.
                  </p>
                  <Link
                    href="/dashboard/subscription"
                    className={buttonClasses("primary", "sm") + " mt-4"}
                  >
                    <Crown className="h-4 w-4" />
                    Unlock Premium
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-sm font-semibold text-slate-700">
                Quick facts
              </h3>
              <dl className="mt-3 space-y-3 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <UserCircle2 className="h-4 w-4" /> Tipster
                  </dt>
                  <dd className="font-medium text-slate-800">{p.tipster}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <Activity className="h-4 w-4" /> Risk
                  </dt>
                  <dd className="font-medium capitalize text-slate-800">
                    {p.risk}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <ShieldCheck className="h-4 w-4" /> Market
                  </dt>
                  <dd className="font-medium text-slate-800">{p.market}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <Clock className="h-4 w-4" /> Posted
                  </dt>
                  <dd className="font-medium text-slate-800">
                    {formatDate(p.createdAt)}
                  </dd>
                </div>
              </dl>
            </div>

            {isAdmin && (
              <div className="rounded-2xl border border-slate-200 bg-white p-5">
                <h3 className="mb-3 text-sm font-semibold text-slate-700">
                  Admin actions
                </h3>
                <div className="flex flex-col gap-2">
                  <Link
                    href={`/dashboard/predictions/${p.id}/edit`}
                    className={buttonClasses("outline", "sm")}
                  >
                    <Pencil className="h-4 w-4" />
                    Edit prediction
                  </Link>
                  <DeletePredictionButton id={p.id} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
