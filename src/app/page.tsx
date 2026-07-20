"use client";

import { useEffect } from "react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { Landing } from "@/components/goaledge/landing";
import { Dashboard } from "@/components/goaledge/dashboard";
import { AuthModal } from "@/components/goaledge/auth-modal";
import { PredictionDetailModal } from "@/components/goaledge/prediction-detail-modal";
import { Spinner } from "@/components/goaledge/ui";

export default function Home() {
  const { user, loading, boot } = useGoalEdge();

  useEffect(() => {
    boot();
  }, [boot]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
            <svg
              className="h-6 w-6 animate-spin text-white"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-90"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              />
            </svg>
          </span>
          <p className="text-sm font-medium text-slate-500">Loading GoalEdge…</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {user ? <Dashboard /> : <Landing />}
      <AuthModal />
      <PredictionDetailModal />
    </>
  );
}
