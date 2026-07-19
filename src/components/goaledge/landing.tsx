"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  Trophy,
  Target,
  Crown,
  ShieldCheck,
  Zap,
  BarChart3,
  Globe2,
  ArrowRight,
  CheckCircle2,
  Clock,
  Sparkles,
  Star,
} from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { apiPredictions, apiStats } from "@/lib/api-client";
import type { ClientPrediction, Stats } from "@/lib/types";
import { PLANS, type PlanId } from "@/lib/constants";
import { formatKES } from "@/lib/utils";
import { PredictionCard } from "./prediction-card";
import { Button, buttonClasses } from "./ui";
import { ThemeToggle } from "./theme-toggle";
import { useCountUp } from "@/hooks/use-count-up";
import { Reveal } from "./motion";
import { cn } from "@/lib/utils";

const FEATURES = [
  {
    icon: BarChart3,
    title: "Data-driven tips",
    desc: "Every pick is backed by form, head-to-head records and expected-goals analysis.",
  },
  {
    icon: Zap,
    title: "Real-time odds",
    desc: "Fresh odds and value alerts the moment markets move across major bookmakers.",
  },
  {
    icon: Globe2,
    title: "10+ top leagues",
    desc: "From the Premier League to the NPFL — coverage across Europe and beyond.",
  },
  {
    icon: ShieldCheck,
    title: "Secure payments",
    desc: "Upgrade instantly with Paystack. Bank-grade encryption on every transaction.",
  },
];

const TESTIMONIALS = [
  {
    name: "Tunde B.",
    role: "Premium member",
    quote: "The accumulator slips alone pay for themselves. Best KSH 100 I spend each week.",
    rating: 5,
  },
  {
    name: "Grace M.",
    role: "Free member",
    quote: "Even the free tips are sharper than most paid services I've tried. Clean dashboard too.",
    rating: 5,
  },
  {
    name: "Samuel O.",
    role: "Premium member",
    quote: "The in-depth analysis actually teaches you how to think about matches. Game changer.",
    rating: 4,
  },
];

export function Landing() {
  const { openAuth, user } = useGoalEdge();
  const [stats, setStats] = useState<Stats | null>(null);
  const [featured, setFeatured] = useState<ClientPrediction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [s, f] = await Promise.all([
          apiStats(),
          apiPredictions({ status: "upcoming", limit: 3 }),
        ]);
        if (!active) return;
        setStats(s.stats);
        setFeatured(f.predictions);
      } catch {
        // ignore — page still renders
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const cta = user ? "Go to dashboard" : "Get started";

  function handleCta() {
    if (user) {
      // already logged in — landing is hidden when authed, but safe-guard anyway
      return;
    }
    openAuth("register");
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="absolute inset-x-0 top-0 z-20">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
          <div className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-white">
              Goal<span className="text-emerald-400">Edge</span>
            </span>
          </div>
          <nav className="flex items-center gap-2">
            <ThemeToggle className="border-white/20 bg-white/5 text-white/80 hover:bg-white/10 hover:text-white" />
            <button
              onClick={() => openAuth("login")}
              className="px-3 py-2 text-sm font-medium text-white/80 transition hover:text-white"
            >
              {user ? "Dashboard" : "Sign in"}
            </button>
            <Button
              variant="white"
              size="sm"
              onClick={handleCta}
              className="sm:h-10"
            >
              {cta}
            </Button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-pitch relative overflow-hidden px-4 pb-20 pt-28 sm:px-6 sm:pt-36">
        <div className="hero-orb hero-orb-1" aria-hidden />
        <div className="hero-orb hero-orb-2" aria-hidden />
        <div className="relative mx-auto max-w-4xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-1.5 text-xs font-medium text-emerald-300 ring-1 ring-inset ring-white/15">
            <Zap className="h-3.5 w-3.5" />
            {stats ? `${stats.winRate}% historical hit rate` : "Smarter football predictions"}
          </span>
          <h1 className="mt-6 text-4xl font-extrabold leading-[1.05] tracking-tight text-white sm:text-6xl">
            Predict smarter.
            <br />
            <span className="gradient-animate bg-gradient-to-r from-emerald-300 via-teal-300 to-emerald-400 bg-clip-text text-transparent">
              Win more often.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-base text-slate-300 sm:text-lg">
            Expert football predictions, real odds and in-depth analysis — all in one
            beautifully simple dashboard. Start free, upgrade to premium anytime.
          </p>
          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button variant="white" size="lg" onClick={handleCta}>
              Start free
              <ArrowRight className="h-4 w-4" />
            </Button>
            <button
              onClick={() => openAuth("login")}
              className={cn(
                buttonClasses("outline", "lg"),
                "border-white/20 bg-white/5 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Live demo
            </button>
          </div>

          <div className="mx-auto mt-14 grid max-w-2xl grid-cols-3 gap-4">
            <LandingStat
              icon={<Trophy className="mx-auto h-5 w-5 text-emerald-400" />}
              label="Win rate"
              value={stats ? `${stats.winRate}%` : "—"}
              animateTo={stats?.winRate}
            />
            <LandingStat
              icon={<Target className="mx-auto h-5 w-5 text-emerald-400" />}
              label="Tips posted"
              value={stats ? `${stats.total}+` : "—"}
              animateTo={stats?.total}
              suffix="+"
            />
            <LandingStat
              icon={<Globe2 className="mx-auto h-5 w-5 text-emerald-400" />}
              label="Leagues"
              value="10+"
              animateTo={10}
              suffix="+"
            />
          </div>
        </div>
      </section>

      {/* Featured tips */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Today&apos;s featured tips
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              A taste of what&apos;s inside. Sign up to unlock the full board.
            </p>
          </div>
          <button
            onClick={handleCta}
            className="hidden items-center gap-1 text-sm font-semibold text-emerald-600 hover:text-emerald-700 sm:flex"
          >
            See all <ArrowRight className="h-4 w-4" />
          </button>
        </div>
        {loading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className="h-72 animate-pulse rounded-2xl border border-slate-200 bg-white"
              />
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-16 text-center text-sm text-slate-500">
            <Clock className="mx-auto h-8 w-8 text-slate-300" />
            New tips dropping soon.
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((p) => (
              <PredictionCard
                key={p.id}
                prediction={p}
                onUnlock={() => openAuth("register")}
                onView={() => openAuth("register")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Features */}
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Everything you need to bet with confidence
            </h2>
            <p className="mt-3 text-slate-500">
              A complete toolkit for serious football fans and punters alike.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} delay={i * 0.08}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6 transition hover:border-emerald-200 hover:bg-white hover:shadow-md">
                  <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-100 text-emerald-600">
                    <f.icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-bold text-slate-900">{f.title}</h3>
                  <p className="mt-1.5 text-sm text-slate-500">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-3 text-slate-500">
            Start free. Upgrade to premium when you&apos;re ready.
          </p>
        </div>
        <div className="mx-auto mt-12 grid max-w-4xl gap-6 lg:grid-cols-2">
          {(["free", "premium"] as PlanId[]).map((id) => {
            const plan = PLANS[id];
            return (
              <div
                key={id}
                className={cn(
                  "relative flex flex-col rounded-2xl border bg-white p-7 shadow-sm",
                  id === "premium"
                    ? "border-emerald-300 ring-2 ring-emerald-200"
                    : "border-slate-200",
                )}
              >
                {id === "premium" && (
                  <span className="absolute -top-3 left-7 rounded-full bg-emerald-500 px-3 py-1 text-xs font-semibold text-white">
                    Most popular
                  </span>
                )}
                <h3 className="font-bold text-slate-900">{plan.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-slate-900">
                    {plan.price === 0 ? "Free" : formatKES(plan.price)}
                  </span>
                  {plan.price > 0 && (
                    <span className="text-sm text-slate-400">{plan.period}</span>
                  )}
                </div>
                <ul className="mt-5 flex-1 space-y-2.5">
                  {plan.features.map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-sm text-slate-600"
                    >
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500" />
                      {f}
                    </li>
                  ))}
                </ul>
                <Button
                  variant={id === "premium" ? "primary" : "outline"}
                  size="md"
                  className="mt-6 w-full"
                  onClick={handleCta}
                >
                  {plan.price === 0 ? "Get started" : "Choose plan"}
                </Button>
              </div>
            );
          })}
        </div>
      </section>

      {/* Testimonials */}
      <section className="bg-white px-4 py-16 sm:px-6">
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Loved by football fans
            </h2>
            <p className="mt-3 text-slate-500">
              Join thousands of fans using GoalEdge to find value every matchday.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} delay={i * 0.1}>
                <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={cn(
                          "h-4 w-4",
                          i < t.rating
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200",
                        )}
                      />
                    ))}
                  </div>
                  <p className="mt-4 text-sm leading-relaxed text-slate-700">
                    &ldquo;{t.quote}&rdquo;
                  </p>
                  <div className="mt-4 flex items-center gap-3">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full text-sm font-bold text-white"
                      style={{ backgroundColor: ["#10b981", "#0ea5e9", "#f59e0b"][i % 3] }}
                    >
                      {t.name.charAt(0)}
                    </span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{t.name}</p>
                      <p className="text-xs text-slate-500">{t.role}</p>
                    </div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 pb-20 sm:px-6">
        <div className="mx-auto max-w-5xl overflow-hidden rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-12 text-center text-white shadow-xl shadow-emerald-600/20 sm:px-12">
          <Crown className="mx-auto h-8 w-8" />
          <h2 className="mt-4 text-2xl font-bold sm:text-3xl">
            Ready to take your predictions to the next level?
          </h2>
          <p className="mx-auto mt-2 max-w-xl text-emerald-50">
            Join thousands of fans using GoalEdge to find value every matchday.
          </p>
          <Button
            variant="white"
            size="lg"
            className="mt-6"
            onClick={handleCta}
          >
            Create your free account
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 bg-white px-4 py-8 sm:px-6">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 sm:flex-row">
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold text-slate-900">
              Goal<span className="text-emerald-600">Edge</span>
            </span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
            18+ · Please gamble responsibly.
          </div>
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} GoalEdge.
          </p>
        </div>
      </footer>
    </div>
  );
}

// Animated stat card for the hero section.
function LandingStat({
  icon,
  label,
  value,
  animateTo,
  suffix = "",
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  animateTo?: number;
  suffix?: string;
}) {
  const animated = useCountUp(animateTo ?? 0);
  const display =
    animateTo != null && animateTo > 0
      ? `${animated}${suffix}${label === "Win rate" ? "%" : ""}`
      : value;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-5 text-white backdrop-blur transition hover:border-emerald-400/30 hover:bg-white/10">
      {icon}
      <p className="mt-2 text-2xl font-bold tabular-nums">{display}</p>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}
