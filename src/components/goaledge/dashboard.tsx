"use client";

import { useEffect, useState } from "react";
import {
  TrendingUp,
  LayoutDashboard,
  ListOrdered,
  User as UserIcon,
  Crown,
  Shield,
  Gauge,
  LogOut,
  Menu,
  X,
  Sparkles,
  BarChart3,
  Ticket,
  Trophy,
  Keyboard,
  History,
  BookOpen,
  Activity as ActivityIcon,
} from "lucide-react";
import { useGoalEdge, type DashboardTab } from "@/hooks/use-goal-edge";
import { cn, initials } from "@/lib/utils";
import { Button } from "./ui";
import { OverviewTab } from "./overview-tab";
import { PredictionsTab } from "./predictions-tab";
import { ProfileTab } from "./profile-tab";
import { SubscriptionTab } from "./subscription-tab";
import { AdminTab } from "./admin-tab";
import { TesterTab } from "./tester-tab";
import { AnalyticsTab } from "./analytics-tab";
import { SlipTab } from "./slip-tab";
import { LeaderboardTab } from "./leaderboard-tab";
import { ResultsTab } from "./results-tab";
import { BlogTab } from "./blog-tab";
import { ActivityTab } from "./activity-tab";
import { ThemeToggle } from "./theme-toggle";
import { useNewTipsBadge } from "@/hooks/use-new-tips-badge";

type NavItem = {
  key: DashboardTab;
  label: string;
  icon: typeof LayoutDashboard;
  adminOnly?: boolean;
};

const NAV: NavItem[] = [
  { key: "overview", label: "Overview", icon: LayoutDashboard },
  { key: "predictions", label: "Predictions", icon: ListOrdered },
  { key: "results", label: "Results", icon: History },
  { key: "analytics", label: "Analytics", icon: BarChart3 },
  { key: "leaderboard", label: "Leaderboard", icon: Trophy },
  { key: "slip", label: "Bet slip", icon: Ticket },
  { key: "blog", label: "Blog", icon: BookOpen },
  { key: "activity", label: "Activity", icon: ActivityIcon },
  { key: "subscription", label: "Subscription", icon: Crown },
  { key: "profile", label: "Profile", icon: UserIcon },
  { key: "tester", label: "Performance", icon: Gauge },
  { key: "admin", label: "Admin", icon: Shield, adminOnly: true },
];

export function Dashboard() {
  const { user, isPremium, tab, setTab, logout, slip } = useGoalEdge();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [totalTips, setTotalTips] = useState(0);
  const { newCount, markSeen } = useNewTipsBadge(totalTips);

  // Fetch total tip count once on mount for the "new tips" badge
  useEffect(() => {
    if (!user) return;
    let active = true;
    (async () => {
      try {
        const { apiStats } = await import("@/lib/api-client");
        const { stats } = await apiStats();
        if (active) setTotalTips(stats.total);
      } catch {
        // ignore
      }
    })();
    return () => {
      active = false;
    };
  }, [user]);

  // When the user visits the Predictions tab, mark tips as seen
  useEffect(() => {
    if (tab === "predictions" && totalTips > 0) {
      markSeen(totalTips);
    }
  }, [tab, totalTips, markSeen]);

  function changeTab(t: DashboardTab) {
    setTab(t);
    setSidebarOpen(false);
  }

  // Keyboard shortcuts: 1-9 switch tabs, ? shows help, Esc closes modals/sidebar
  useEffect(() => {
    if (!user) return;
    const items = NAV.filter((n) => !n.adminOnly || user.role === "admin");
    function onKey(e: KeyboardEvent) {
      const target = e.target as HTMLElement | null;
      const tag = target?.tagName;
      const isTyping = tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT" || target?.isContentEditable;
      // Esc always works (close sidebar / modals)
      if (e.key === "Escape") {
        setSidebarOpen(false);
        setShortcutsOpen(false);
        return;
      }
      if (isTyping) return;
      // ? toggles shortcuts help
      if (e.key === "?" || (e.shiftKey && e.key === "/")) {
        e.preventDefault();
        setShortcutsOpen((s) => !s);
        return;
      }
      // 1-9, 0 (for the 10th tab) switch tabs
      if (/^[0-9]$/.test(e.key)) {
        const idx = e.key === "0" ? 9 : parseInt(e.key, 10) - 1;
        if (items[idx]) {
          e.preventDefault();
          changeTab(items[idx].key);
        }
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [user, setTab]);

  if (!user) return null;

  const items = NAV.filter((n) => !n.adminOnly || user.role === "admin");
  const badgeFor = (key: DashboardTab) => {
    if (key === "slip") return slip.length;
    if (key === "predictions" && newCount > 0) return newCount;
    return undefined;
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar (mobile) */}
      <div className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-lg p-2 text-slate-600 hover:bg-slate-100"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <TrendingUp className="h-4 w-4 text-white" />
            </span>
            <span className="font-bold text-slate-900">
              Goal<span className="text-emerald-600">Edge</span>
            </span>
          </div>
        </div>
        <span
          className="flex h-8 w-8 items-center justify-center rounded-full text-sm font-bold text-white"
          style={{ backgroundColor: user.avatarColor }}
        >
          {initials(user.name)}
        </span>
      </div>

      <div className="flex">
        {/* Sidebar (desktop) */}
        <aside className="sticky top-0 hidden h-screen w-64 shrink-0 flex-col border-r border-slate-200 bg-white lg:flex">
          <div className="flex items-center gap-2 px-5 py-5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30">
              <TrendingUp className="h-5 w-5 text-white" />
            </span>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              Goal<span className="text-emerald-600">Edge</span>
            </span>
          </div>

          <nav className="flex-1 space-y-1 px-3 py-2">
            {items.map((n) => (
              <NavBtn
                key={n.key}
                active={tab === n.key}
                onClick={() => changeTab(n.key)}
                icon={n.icon}
                label={n.label}
                badge={badgeFor(n.key)}
                badgeTone={n.key === "predictions" ? "amber" : "emerald"}
              />
            ))}
          </nav>

          {/* Upgrade card */}
          {!isPremium && (
            <div className="mx-3 mb-3 overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 p-4 text-white">
              <Sparkles className="h-5 w-5" />
              <p className="mt-1.5 text-sm font-bold">Go Premium</p>
              <p className="mt-0.5 text-xs text-emerald-50">
                Unlock all tips for 24h. Just KES 100.
              </p>
              <button
                onClick={() => changeTab("subscription")}
                className="mt-3 w-full rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-emerald-700 transition hover:bg-emerald-50"
              >
                Upgrade
              </button>
            </div>
          )}

          {/* User card */}
          <div className="border-t border-slate-100 p-3">
            <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
              <span
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                style={{ backgroundColor: user.avatarColor }}
              >
                {initials(user.name)}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                <p className="truncate text-xs text-slate-400">{user.email}</p>
              </div>
              <button
                onClick={logout}
                className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                aria-label="Sign out"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </button>
              <ThemeToggle className="border-0 bg-transparent hover:bg-slate-100" />
            </div>
          </div>
        </aside>

        {/* Sidebar (mobile drawer) */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 lg:hidden">
            <div
              className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
              onClick={() => setSidebarOpen(false)}
            />
            <aside className="absolute left-0 top-0 flex h-full w-72 flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between px-5 py-4">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
                    <TrendingUp className="h-4 w-4 text-white" />
                  </span>
                  <span className="font-bold text-slate-900">
                    Goal<span className="text-emerald-600">Edge</span>
                  </span>
                </div>
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <nav className="flex-1 space-y-1 px-3 py-2">
                {items.map((n) => (
                  <NavBtn
                    key={n.key}
                    active={tab === n.key}
                    onClick={() => changeTab(n.key)}
                    icon={n.icon}
                    label={n.label}
                    badge={badgeFor(n.key)}
                    badgeTone={n.key === "predictions" ? "amber" : "emerald"}
                  />
                ))}
              </nav>
              <div className="border-t border-slate-100 p-3">
                <div className="flex items-center gap-2.5 rounded-xl px-2 py-2">
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white"
                    style={{ backgroundColor: user.avatarColor }}
                  >
                    {initials(user.name)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">{user.name}</p>
                    <p className="truncate text-xs text-slate-400">{user.email}</p>
                  </div>
                  <button
                    onClick={logout}
                    className="rounded-lg p-2 text-slate-400 transition hover:bg-rose-50 hover:text-rose-600"
                    aria-label="Sign out"
                  >
                    <LogOut className="h-4 w-4" />
                  </button>
                  <ThemeToggle className="border-0 bg-transparent hover:bg-slate-100" />
                </div>
              </div>
            </aside>
          </div>
        )}

        {/* Main content */}
        <main className="min-w-0 flex-1">
          <div
            key={tab}
            className="mx-auto max-w-6xl px-4 py-6 animate-fade-in-up sm:px-6 sm:py-8"
          >
            {tab === "overview" && <OverviewTab />}
            {tab === "predictions" && <PredictionsTab />}
            {tab === "results" && <ResultsTab />}
            {tab === "analytics" && <AnalyticsTab />}
            {tab === "leaderboard" && <LeaderboardTab />}
            {tab === "slip" && <SlipTab />}
            {tab === "blog" && <BlogTab />}
            {tab === "activity" && <ActivityTab />}
            {tab === "subscription" && <SubscriptionTab />}
            {tab === "profile" && <ProfileTab />}
            {tab === "tester" && <TesterTab />}
            {tab === "admin" && <AdminTab />}
          </div>
        </main>
      </div>

      <FloatingSlipButton />
      <ShortcutsButton onClick={() => setShortcutsOpen(true)} />
      {shortcutsOpen && <ShortcutsModal items={items} onClose={() => setShortcutsOpen(false)} />}
    </div>
  );
}

function FloatingSlipButton() {
  const { slip, tab, setTab } = useGoalEdge();
  if (slip.length === 0 || tab === "slip") return null;
  return (
    <button
      onClick={() => setTab("slip")}
      className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-emerald-500 px-5 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-600/30 transition hover:bg-emerald-600 hover:shadow-xl active:scale-95"
    >
      <Ticket className="h-4 w-4" />
      Slip
      <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-white px-1.5 text-xs font-bold text-emerald-700">
        {slip.length}
      </span>
    </button>
  );
}

function ShortcutsButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-5 left-5 z-30 flex h-11 w-11 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-500 shadow-lg transition hover:bg-slate-50 hover:text-slate-700 active:scale-95"
      title="Keyboard shortcuts (?)"
      aria-label="Keyboard shortcuts"
    >
      <Keyboard className="h-5 w-5" />
    </button>
  );
}

function ShortcutsModal({
  items,
  onClose,
}: {
  items: NavItem[];
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm animate-fade-in" onClick={onClose} aria-hidden />
      <div className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl animate-pop-in">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
            <Keyboard className="h-4 w-4 text-emerald-500" />
            Keyboard shortcuts
          </h2>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="space-y-4 px-6 py-5">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              Switch tabs
            </p>
            <div className="space-y-1.5">
              {items.map((n, i) => (
                <div key={n.key} className="flex items-center justify-between text-sm">
                  <span className="flex items-center gap-2 text-slate-700">
                    <n.icon className="h-4 w-4 text-slate-400" />
                    {n.label}
                  </span>
                  <kbd className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600">
                    {i === 9 ? 0 : i + 1}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
          <div className="border-t border-slate-100 pt-4">
            <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              General
            </p>
            <div className="space-y-1.5">
              <ShortcutRow label="Show this help" keys={["?"]} />
              <ShortcutRow label="Close modals / sidebar" keys={["Esc"]} />
            </div>
          </div>
          <p className="border-t border-slate-100 pt-3 text-xs text-slate-400">
            Shortcuts are disabled while typing in inputs.
          </p>
        </div>
      </div>
    </div>
  );
}

function ShortcutRow({ label, keys }: { label: string; keys: string[] }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-700">{label}</span>
      <div className="flex gap-1">
        {keys.map((k) => (
          <kbd
            key={k}
            className="rounded-md border border-slate-200 bg-slate-50 px-2 py-0.5 text-xs font-bold text-slate-600"
          >
            {k}
          </kbd>
        ))}
      </div>
    </div>
  );
}

function NavBtn({
  active,
  onClick,
  icon: Icon,
  label,
  badge,
  badgeTone = "emerald",
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof LayoutDashboard;
  label: string;
  badge?: number;
  badgeTone?: "emerald" | "amber";
}) {
  const badgeColors = {
    emerald: active ? "bg-emerald-600 text-white" : "bg-emerald-100 text-emerald-700",
    amber: active ? "bg-amber-500 text-white" : "bg-amber-100 text-amber-700",
  } as const;
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold transition",
        active
          ? "bg-emerald-50 text-emerald-700"
          : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
      )}
    >
      <Icon className={cn("h-4 w-4", active ? "text-emerald-600" : "text-slate-400")} />
      <span className="flex-1 text-left">{label}</span>
      {badge != null && badge > 0 && (
        <span
          className={cn(
            "flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-bold",
            badgeColors[badgeTone],
          )}
        >
          {badge}
        </span>
      )}
    </button>
  );
}
