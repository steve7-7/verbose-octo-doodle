import { Crown, ShieldCheck, CalendarDays, Mail } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/page-header";
import { Badge, Avatar } from "@/components/ui/kit";
import { ProfileForm } from "./profile-form";
import { formatDate } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await requireUser();
  const isPremium = user.plan === "premium";

  return (
    <>
      <PageHeader title="Profile" description="Manage your account details." />

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-1">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <div className="flex justify-center">
              <Avatar name={user.name} color={user.avatarColor} size={80} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">{user.name}</h2>
            <p className="text-sm text-slate-500">{user.email}</p>
            <div className="mt-3 flex justify-center gap-2">
              {isPremium ? (
                <Badge className="bg-amber-50 text-amber-700 ring-1 ring-amber-200">
                  <Crown className="h-3 w-3" />
                  Premium
                </Badge>
              ) : (
                <Badge className="bg-slate-100 text-slate-600 ring-1 ring-slate-200">
                  Free plan
                </Badge>
              )}
              {user.role === "admin" && (
                <Badge className="bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200">
                  <ShieldCheck className="h-3 w-3" />
                  Admin
                </Badge>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-700">Account info</h3>
            <dl className="mt-3 space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <Mail className="h-4 w-4" /> Email
                </dt>
                <dd className="font-medium text-slate-700">{user.email}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="flex items-center gap-2 text-slate-500">
                  <CalendarDays className="h-4 w-4" /> Member since
                </dt>
                <dd className="font-medium text-slate-700">
                  {formatDate(user.createdAt)}
                </dd>
              </div>
              {isPremium && user.planExpiresAt && (
                <div className="flex items-center justify-between">
                  <dt className="flex items-center gap-2 text-slate-500">
                    <Crown className="h-4 w-4" /> Premium until
                  </dt>
                  <dd className="font-medium text-slate-700">
                    {formatDate(user.planExpiresAt)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="lg:col-span-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500">
              Edit details
            </h3>
            <ProfileForm name={user.name} email={user.email} />
          </div>
        </div>
      </div>
    </>
  );
}
