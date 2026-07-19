"use client";

import { useState } from "react";
import { User as UserIcon, Mail, Palette, Check, Crown, Calendar } from "lucide-react";
import { useGoalEdge } from "@/hooks/use-goal-edge";
import { useToast } from "@/hooks/use-toast";
import { apiUpdateProfile } from "@/lib/api-client";
import { formatDate } from "@/lib/utils";
import { Button, Spinner } from "./ui";

const COLORS = [
  "#10b981", "#0ea5e9", "#f59e0b", "#ef4444",
  "#8b5cf6", "#ec4899", "#14b8a6", "#6366f1",
];

export function ProfileTab() {
  const { user, refreshUser } = useGoalEdge();
  const { toast } = useToast();
  const [name, setName] = useState(user?.name ?? "");
  const [color, setColor] = useState(user?.avatarColor ?? "#10b981");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  if (!user) return null;

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    setMsg(null);
    try {
      await apiUpdateProfile({ name: name.trim(), avatarColor: color });
      await refreshUser();
      setMsg("Profile updated.");
      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
    } catch (e) {
      setErr(e instanceof Error ? e.message : "Update failed");
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  const memberSince = formatDate(user.createdAt);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
          Profile
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account details and avatar.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Summary card */}
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Gradient banner */}
          <div
            className="h-20"
            style={{
              background: `linear-gradient(135deg, ${user.avatarColor}, ${user.avatarColor}99)`,
            }}
          />
          <div className="px-6 pb-6">
            <div className="-mt-10 flex flex-col items-center text-center">
              <span
                className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white text-2xl font-bold text-white shadow-md"
                style={{ backgroundColor: user.avatarColor }}
              >
                {(user.name.split(" ")[0]?.[0] ?? "?").toUpperCase()}
                {(user.name.split(" ")[1]?.[0] ?? "").toUpperCase()}
              </span>
              <p className="mt-3 text-lg font-bold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500">{user.email}</p>

              <div className="mt-3 flex items-center gap-2">
                {user.plan === "premium" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                    <Crown className="h-3.5 w-3.5" />
                    Premium
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">
                    Free plan
                  </span>
                )}
                {user.role === "admin" && (
                  <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200">
                    Admin
                  </span>
                )}
              </div>
            </div>

            <div className="mt-6 space-y-3 border-t border-slate-100 pt-4">
              <Row icon={<Calendar className="h-4 w-4" />} label="Member since" value={memberSince} />
              <Row
                icon={<Mail className="h-4 w-4" />}
                label="Email"
                value={user.email}
              />
              {user.planExpiresAt && (
                <Row
                  icon={<Crown className="h-4 w-4" />}
                  label="Premium expires"
                  value={formatDate(user.planExpiresAt)}
                />
              )}
            </div>
          </div>
        </div>

        {/* Edit form */}
        <form
          onSubmit={save}
          className="space-y-5 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm lg:col-span-2"
        >
          <h2 className="text-lg font-bold text-slate-900">Edit profile</h2>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Full name</span>
            <div className="relative">
              <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
                required
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-700">Email</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={user.email}
                disabled
                className="h-11 w-full cursor-not-allowed rounded-xl border border-slate-200 bg-slate-100 pl-10 pr-3 text-sm text-slate-500"
              />
            </div>
            <span className="mt-1 block text-xs text-slate-400">Email cannot be changed.</span>
          </label>

          <div>
            <span className="mb-2 flex items-center gap-1.5 text-sm font-medium text-slate-700">
              <Palette className="h-4 w-4" />
              Avatar color
            </span>
            <div className="flex flex-wrap gap-2">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  className="flex h-9 w-9 items-center justify-center rounded-full transition hover:scale-110"
                  style={{ backgroundColor: c }}
                  aria-label={`Pick ${c}`}
                >
                  {color === c && <Check className="h-4 w-4 text-white" />}
                </button>
              ))}
            </div>
          </div>

          {msg && (
            <div className="rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700 ring-1 ring-emerald-200">
              {msg}
            </div>
          )}
          {err && (
            <div className="rounded-lg bg-rose-50 px-3 py-2 text-sm font-medium text-rose-700 ring-1 ring-rose-200">
              {err}
            </div>
          )}

          <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
            <Button type="submit" disabled={busy || name.trim().length < 2}>
              {busy ? <Spinner /> : "Save changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm">
      <span className="flex items-center gap-2 text-slate-500">
        <span className="text-slate-400">{icon}</span>
        {label}
      </span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
