"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/components/toaster";

const inputCls =
  "h-11 w-full rounded-xl border border-slate-200 bg-white px-3 text-sm text-slate-800 shadow-sm transition focus:border-emerald-400 focus:outline-none focus:ring-2 focus:ring-emerald-100";

export function ProfileForm({
  name,
  email,
}: {
  name: string;
  email: string;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ name, password: "" });
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    const body: Record<string, string> = { name: form.name };
    if (form.password) body.password = form.password;
    try {
      const res = await fetch("/api/auth/profile", {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error || "Update failed");
      }
      toast.success("Profile updated.");
      setForm((f) => ({ ...f, password: "" }));
      router.refresh();
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Full name
        </span>
        <input
          className={inputCls}
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
        />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          Email
        </span>
        <input className={inputCls} value={email} disabled />
      </label>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-700">
          New password{" "}
          <span className="text-slate-400">(leave blank to keep current)</span>
        </span>
        <input
          type="password"
          className={inputCls}
          value={form.password}
          onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
          placeholder="••••••••"
        />
      </label>
      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          <Save className="h-4 w-4" />
          Save changes
        </Button>
      </div>
    </form>
  );
}
