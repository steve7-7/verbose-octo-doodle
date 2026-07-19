"use client";

import { useState, useEffect } from "react";
import {
  TrendingUp,
  X,
  Mail,
  Lock,
  User as UserIcon,
  ArrowRight,
  KeyRound,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { apiResetRequest, apiResetConfirm } from "@/lib/api-client";
import { Button, Spinner } from "./ui";

type Mode = "login" | "register" | "forgot-request" | "forgot-confirm";

export function AuthModal() {
  const { authOpen, authMode, closeAuth, openAuth, login, register } = useGoalEdge();
  const [mode, setMode] = useState<Mode>(authMode);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  // Sync mode when the modal opens (authMode is set by the store before opening).
  useEffect(() => {
    if (authOpen) {
      setMode(authMode);
      setErr(null);
      setInfo(null);
    }
  }, [authOpen, authMode]);

  if (!authOpen) return null;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setInfo(null);
    setBusy(true);
    try {
      if (mode === "login") {
        await login(email.trim(), password);
        resetForm();
      } else if (mode === "register") {
        await register(name.trim(), email.trim(), password);
        resetForm();
      } else if (mode === "forgot-request") {
        const res = await apiResetRequest(email.trim());
        if (res.demoToken) {
          setResetToken(res.demoToken);
          setMode("forgot-confirm");
          setInfo(res.message);
        } else {
          setInfo(res.message);
        }
      } else if (mode === "forgot-confirm") {
        await apiResetConfirm(resetToken, newPassword);
        setInfo("Password updated! You can now sign in.");
        setMode("login");
        setPassword("");
        setNewPassword("");
        setResetToken("");
      }
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  function resetForm() {
    setName("");
    setEmail("");
    setPassword("");
    setNewPassword("");
    setResetToken("");
    setInfo(null);
    setErr(null);
  }

  function fillDemo(kind: "admin" | "premium" | "free") {
    const map = {
      admin: "admin@goaledge.com",
      premium: "premium@goaledge.com",
      free: "free@goaledge.com",
    } as const;
    setEmail(map[kind]);
    setPassword("password123");
  }

  const isLogin = mode === "login";
  const isRegister = mode === "register";
  const isForgotRequest = mode === "forgot-request";
  const isForgotConfirm = mode === "forgot-confirm";

  const title = isLogin
    ? "Welcome back"
    : isRegister
      ? "Create your account"
      : isForgotRequest
        ? "Reset your password"
        : "Set a new password";

  const subtitle = isLogin
    ? "Sign in to access your prediction dashboard."
    : isRegister
      ? "Start free. Upgrade to premium anytime."
      : isForgotRequest
        ? "Enter your email and we'll send you a reset link."
        : "Choose a new password for your account.";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={closeAuth}
        aria-hidden
      />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        <div className="bg-pitch relative px-6 pb-8 pt-7 text-white">
          <button
            onClick={closeAuth}
            className="absolute right-4 top-4 rounded-lg p-1.5 text-white/70 transition hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
          {(isForgotRequest || isForgotConfirm) && (
            <button
              onClick={() => {
                setMode("login");
                setErr(null);
                setInfo(null);
              }}
              className="absolute left-4 top-4 flex items-center gap-1 text-sm text-white/70 transition hover:text-white"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold">
              Goal<span className="text-emerald-400">Edge</span>
            </span>
          </div>
          <h2 className="mt-5 text-2xl font-bold">{title}</h2>
          <p className="mt-1 text-sm text-slate-300">{subtitle}</p>
        </div>

        <form onSubmit={submit} className="space-y-4 px-6 py-6">
          {isRegister && (
            <Field
              label="Full name"
              icon={<UserIcon className="h-4 w-4" />}
              type="text"
              value={name}
              onChange={setName}
              placeholder="Alex Coach"
              required
            />
          )}

          {(isLogin || isRegister || isForgotRequest) && (
            <Field
              label="Email"
              icon={<Mail className="h-4 w-4" />}
              type="email"
              value={email}
              onChange={setEmail}
              placeholder="you@example.com"
              required
            />
          )}

          {(isLogin || isRegister) && (
            <Field
              label="Password"
              icon={<Lock className="h-4 w-4" />}
              type="password"
              value={password}
              onChange={setPassword}
              placeholder="••••••••"
              required
            />
          )}

          {isForgotConfirm && (
            <>
              {info && (
                <div className="rounded-lg bg-emerald-50 px-3 py-2 text-xs text-emerald-700 ring-1 ring-emerald-200">
                  <CheckCircle2 className="mr-1 inline h-3.5 w-3.5" />
                  {info}
                </div>
              )}
              <Field
                label="New password"
                icon={<KeyRound className="h-4 w-4" />}
                type="password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 6 characters"
                required
              />
            </>
          )}

          {err && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              {err}
            </div>
          )}

          {info && !isForgotConfirm && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              <CheckCircle2 className="mr-1 inline h-4 w-4" />
              {info}
            </div>
          )}

          <Button type="submit" size="lg" className="w-full" disabled={busy}>
            {busy ? <Spinner /> : (
              <>
                {isLogin && "Sign in"}
                {isRegister && "Create account"}
                {isForgotRequest && "Send reset link"}
                {isForgotConfirm && "Set new password"}
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>

          {/* Mode switching */}
          {isLogin && (
            <>
              <button
                type="button"
                onClick={() => {
                  setMode("forgot-request");
                  setErr(null);
                  setInfo(null);
                }}
                className="block w-full text-center text-sm font-medium text-emerald-600 hover:text-emerald-700"
              >
                Forgot password?
              </button>
              <p className="text-center text-sm text-slate-500">
                New to GoalEdge?{" "}
                <button
                  type="button"
                  onClick={() => {
                    setMode("register");
                    setErr(null);
                    setInfo(null);
                  }}
                  className="font-semibold text-emerald-600 hover:text-emerald-700"
                >
                  Create one
                </button>
              </p>
            </>
          )}

          {isRegister && (
            <p className="text-center text-sm text-slate-500">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setErr(null);
                  setInfo(null);
                }}
                className="font-semibold text-emerald-600 hover:text-emerald-700"
              >
                Sign in
              </button>
            </p>
          )}

          {isLogin && (
            <div className="border-t border-slate-100 pt-4">
              <p className="mb-2 text-center text-xs font-medium uppercase tracking-wide text-slate-400">
                Demo accounts
              </p>
              <div className="grid grid-cols-3 gap-2">
                <DemoBtn label="Admin" onClick={() => fillDemo("admin")} />
                <DemoBtn label="Premium" onClick={() => fillDemo("premium")} />
                <DemoBtn label="Free" onClick={() => fillDemo("free")} />
              </div>
              <p className="mt-2 text-center text-xs text-slate-400">
                Password: <span className="font-mono">password123</span>
              </p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

function Field({
  label,
  icon,
  type,
  value,
  onChange,
  placeholder,
  required,
}: {
  label: string;
  icon: React.ReactNode;
  type: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-700">{label}</span>
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
          {icon}
        </span>
        <input
          type={type}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
        />
      </div>
    </label>
  );
}

function DemoBtn({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-600 transition hover:border-emerald-300 hover:bg-emerald-50 hover:text-emerald-700"
    >
      {label}
    </button>
  );
}
