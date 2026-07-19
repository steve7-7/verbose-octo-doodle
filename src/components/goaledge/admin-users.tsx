"use client";

import { useEffect, useState, useCallback } from "react";
import {
  Users,
  Crown,
  Shield,
  Mail,
  Calendar,
  CreditCard,
  Search,
  Check,
  X,
} from "lucide-react";
import { apiAdminUsers, apiAdminUpdateUser, type AdminUser } from "@/lib/api-client";
import { cn, formatDate, formatDateTime } from "@/lib/utils";
import { Spinner } from "./ui";
import { useToast } from "@/hooks/use-toast";

export function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [busyId, setBusyId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiAdminUsers();
      setUsers(res.users);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.email.toLowerCase().includes(q.toLowerCase()),
  );

  async function togglePlan(u: AdminUser) {
    setBusyId(u.id);
    try {
      const newPlan = u.plan === "premium" ? "free" : "premium";
      await apiAdminUpdateUser(u.id, { plan: newPlan });
      toast({
        title: newPlan === "premium" ? "Premium granted" : "Premium revoked",
        description: `${u.name} is now ${newPlan}`,
      });
      await load();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  async function toggleRole(u: AdminUser) {
    if (u.email === "admin@goaledge.com") return; // protect root admin
    setBusyId(u.id);
    try {
      const newRole = u.role === "admin" ? "user" : "admin";
      await apiAdminUpdateUser(u.id, { role: newRole });
      toast({
        title: "Role updated",
        description: `${u.name} is now ${newRole}`,
      });
      await load();
    } catch (e) {
      toast({
        title: "Update failed",
        description: e instanceof Error ? e.message : "Please try again.",
        variant: "destructive",
      });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h3 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Users className="h-4 w-4 text-emerald-500" />
            User management
          </h3>
          <span className="text-sm text-slate-400">
            {users.length} user{users.length === 1 ? "" : "s"}
          </span>
        </div>
      </div>

      {/* Search */}
      <div className="border-b border-slate-100 px-5 py-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search users by name or email..."
            className="h-10 w-full rounded-xl border border-slate-200 bg-slate-50 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-100"
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Spinner className="h-5 w-5 text-emerald-500" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="px-5 py-10 text-center text-sm text-slate-500">
          No users found.
        </div>
      ) : (
        <div className="max-h-[60vh] overflow-y-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10 bg-slate-50 text-left text-xs uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3 font-semibold">User</th>
                <th className="hidden px-4 py-3 font-semibold sm:table-cell">Plan</th>
                <th className="hidden px-4 py-3 font-semibold md:table-cell">Joined</th>
                <th className="hidden px-4 py-3 font-semibold lg:table-cell">Payments</th>
                <th className="px-4 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
                        style={{ backgroundColor: u.avatarColor }}
                      >
                        {u.name.charAt(0).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {u.name}
                          {u.role === "admin" && (
                            <span className="ml-1.5 inline-flex items-center gap-0.5 rounded-full bg-emerald-50 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700 ring-1 ring-emerald-200">
                              <Shield className="h-2.5 w-2.5" />
                              Admin
                            </span>
                          )}
                        </p>
                        <p className="flex items-center gap-1 truncate text-xs text-slate-400">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {u.plan === "premium" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                        <Crown className="h-3 w-3" />
                        Premium
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-600">
                        Free
                      </span>
                    )}
                    {u.planExpiresAt && (
                      <p className="mt-0.5 text-xs text-slate-400">
                        expires {formatDate(u.planExpiresAt)}
                      </p>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-slate-500 md:table-cell">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <span className="flex items-center gap-1 text-slate-600">
                      <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                      {u.paymentCount}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => togglePlan(u)}
                        disabled={busyId === u.id}
                        className={cn(
                          "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50",
                          u.plan === "premium"
                            ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                            : "bg-amber-50 text-amber-700 hover:bg-amber-100",
                        )}
                        title={u.plan === "premium" ? "Revoke premium" : "Grant premium (24h)"}
                      >
                        <Crown className="h-3.5 w-3.5" />
                        {u.plan === "premium" ? "Revoke" : "Grant"}
                      </button>
                      {u.email !== "admin@goaledge.com" && (
                        <button
                          onClick={() => toggleRole(u)}
                          disabled={busyId === u.id}
                          className={cn(
                            "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition disabled:opacity-50",
                            u.role === "admin"
                              ? "bg-slate-100 text-slate-600 hover:bg-slate-200"
                              : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100",
                          )}
                          title={u.role === "admin" ? "Demote to user" : "Promote to admin"}
                        >
                          <Shield className="h-3.5 w-3.5" />
                          {u.role === "admin" ? "Demote" : "Promote"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
