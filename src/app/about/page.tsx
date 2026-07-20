import Link from "next/link";
import { Target, Users, Trophy, ShieldCheck, TrendingUp, ArrowLeft } from "lucide-react";
import { PageHeader } from "@/components/page-header";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "About Us",
  description: "Learn about GoalEdge, the team behind the data-driven football predictions platform.",
};

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-800">
          <ArrowLeft className="h-4 w-4" />
          Back to home
        </Link>

        <div className="mb-10">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl">
            About GoalEdge
          </h1>
          <p className="mt-3 text-lg text-slate-600">
            We&apos;re on a mission to make football predictions smarter, more accessible, and responsibly fun.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Target className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-4 font-bold text-slate-900">Our Vision</h3>
            <p className="mt-2 text-sm text-slate-600">
              To become the most trusted source for data-driven football predictions across Africa and beyond.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Users className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-4 font-bold text-slate-900">Our Team</h3>
            <p className="mt-2 text-sm text-slate-600">
              A collective of analysts, data scientists, and passionate football fans who live and breathe the beautiful game.
            </p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Trophy className="h-8 w-8 text-emerald-600" />
            <h3 className="mt-4 font-bold text-slate-900">Our Track Record</h3>
            <p className="mt-2 text-sm text-slate-600">
              Backed by rigorous statistical models, our tips consistently outperform market averages.
            </p>
          </div>
        </div>

        <div className="mt-12 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <h2 className="text-2xl font-bold text-slate-900">Why GoalEdge?</h2>
          <ul className="mt-6 space-y-4 text-slate-600">
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>Expert analysis powered by real-time data and expected-goals models</span>
            </li>
            <li className="flex items-start gap-3">
              <TrendingUp className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>Transparent performance tracking so you can see our win rate</span>
            </li>
            <li className="flex items-start gap-3">
              <ShieldCheck className="h-5 w-5 shrink-0 text-emerald-600 mt-0.5" />
              <span>Secure payments via Paystack with instant premium access</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
