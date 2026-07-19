// Typed fetch helpers for the GoalEdge API.

import type { ClientPrediction, SafeUser, Stats, SubscriptionRow } from "@/lib/types";

async function json<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const msg = (body as { error?: string }).error ?? `Request failed (${res.status})`;
    throw new Error(msg);
  }
  return (await res.json()) as T;
}

export async function apiRegister(input: {
  name: string;
  email: string;
  password: string;
}): Promise<{ user: SafeUser }> {
  return json<{ user: SafeUser }>(
    await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function apiLogin(input: {
  email: string;
  password: string;
}): Promise<{ user: SafeUser }> {
  return json<{ user: SafeUser }>(
    await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function apiLogout(): Promise<void> {
  await fetch("/api/auth/logout", { method: "POST" });
}

export async function apiMe(): Promise<{ user: SafeUser | null; isPremium: boolean }> {
  return json<{ user: SafeUser | null; isPremium: boolean }>(
    await fetch("/api/auth/me", { cache: "no-store" }),
  );
}

export async function apiUpdateProfile(input: {
  name: string;
  avatarColor: string;
}): Promise<{ user: SafeUser }> {
  return json<{ user: SafeUser }>(
    await fetch("/api/auth/profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function apiPredictions(filters: {
  status?: string;
  league?: string;
  market?: string;
  risk?: string;
  q?: string;
  limit?: number;
}): Promise<{ predictions: ClientPrediction[]; isPremium: boolean; isAuthed: boolean }> {
  const sp = new URLSearchParams();
  for (const [k, v] of Object.entries(filters)) {
    if (v) sp.set(k, String(v));
  }
  return json(
    await fetch(`/api/predictions?${sp.toString()}`, { cache: "no-store" }),
  );
}

export async function apiPrediction(
  id: number,
): Promise<{ prediction: ClientPrediction }> {
  return json(await fetch(`/api/predictions/${id}`, { cache: "no-store" }));
}

export async function apiCreatePrediction(input: Record<string, unknown>) {
  return json<{ prediction: ClientPrediction }>(
    await fetch("/api/predictions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function apiUpdatePrediction(id: number, input: Record<string, unknown>) {
  return json<{ prediction: ClientPrediction }>(
    await fetch(`/api/predictions/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }),
  );
}

export async function apiDeletePrediction(id: number) {
  return json(await fetch(`/api/predictions/${id}`, { method: "DELETE" }));
}

export async function apiStats(): Promise<{ stats: Stats }> {
  return json(await fetch("/api/stats", { cache: "no-store" }));
}

export async function apiInitPayment() {
  return json<{ reference: string; mock: boolean }>(
    await fetch("/api/paystack/initialize", { method: "POST" }),
  );
}

export async function apiVerifyPayment(reference: string) {
  return json<{ success: boolean; message: string }>(
    await fetch("/api/paystack/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ reference }),
    }),
  );
}

export async function apiSubscriptions(): Promise<{ subscriptions: SubscriptionRow[] }> {
  return json(await fetch("/api/paystack/verify", { cache: "no-store" }));
}

export async function apiTester(): Promise<{
  hits: number;
  misses: number;
  stale: number;
  sets: number;
  invalidations: number;
  entries: number;
  hitRate: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
}> {
  return json(await fetch("/api/tester", { cache: "no-store" }));
}

export async function apiBenchmark(): Promise<{
  stats: { cachedMs: number; uncachedMs: number; speedup: number };
  predictions: { cachedMs: number; uncachedMs: number; speedup: number };
}> {
  return json(await fetch("/api/tester/benchmark", { cache: "no-store" }));
}

export type Analytics = {
  totals: { total: number; won: number; lost: number; pending: number };
  byLeague: {
    league: string;
    total: number;
    won: number;
    lost: number;
    pending: number;
    winRate: number;
  }[];
  byMarket: { market: string; count: number }[];
  confidence: { range: string; min: number; max: number; count: number }[];
  risk: { low: number; medium: number; high: number };
  trend: { label: string; winRate: number; settled: number }[];
  insight: {
    avgOddsWon: number;
    avgOddsLost: number;
    avgConfWon: number;
    avgConfLost: number;
  };
};

export async function apiAnalytics(): Promise<Analytics> {
  return json<Analytics>(await fetch("/api/analytics", { cache: "no-store" }));
}

export type Tipster = {
  name: string;
  total: number;
  won: number;
  lost: number;
  void: number;
  settled: number;
  upcoming: number;
  premium: number;
  winRate: number;
  avgConfidence: number;
  avgOdds: number;
};

export async function apiLeaderboard(): Promise<{ tipsters: Tipster[] }> {
  return json<{ tipsters: Tipster[] }>(
    await fetch("/api/leaderboard", { cache: "no-store" }),
  );
}

// ---- Server-side bet slip ----

export type SlipPrediction = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueIcon: string;
  tip: string;
  market: string;
  odds: number;
  kickoffAt: string;
  isPremium: boolean;
  status: string;
};

export async function apiGetSlip(): Promise<{
  predictionIds: number[];
  predictions: SlipPrediction[];
}> {
  return json(await fetch("/api/slip", { cache: "no-store" }));
}

export async function apiSaveSlip(predictionIds: number[]): Promise<{ predictionIds: number[] }> {
  return json<{ predictionIds: number[] }>(
    await fetch("/api/slip", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ predictionIds }),
    }),
  );
}

export async function apiClearSlip(): Promise<{ ok: boolean }> {
  return json(await fetch("/api/slip", { method: "DELETE" }));
}

// ---- Admin user management ----

export type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: string;
  plan: string;
  avatarColor: string;
  planExpiresAt: string | null;
  createdAt: string;
  paymentCount: number;
};

export async function apiAdminUsers(): Promise<{ users: AdminUser[] }> {
  return json<{ users: AdminUser[] }>(
    await fetch("/api/admin/users", { cache: "no-store" }),
  );
}

export async function apiAdminUpdateUser(
  id: string,
  updates: { role?: "admin" | "user"; plan?: "free" | "premium" },
): Promise<{ user: AdminUser }> {
  return json<{ user: AdminUser }>(
    await fetch(`/api/admin/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    }),
  );
}

// ---- Activity feed ----

export type Activity = {
  id: string;
  type: string;
  detail: string | null;
  createdAt: string;
};

export async function apiActivity(): Promise<{ activities: Activity[] }> {
  return json<{ activities: Activity[] }>(
    await fetch("/api/activity", { cache: "no-store" }),
  );
}

// ---- Referral program ----

export type ReferralInfo = {
  code: string;
  referralCount: number;
  premiumReferrals: number;
  rewardPerReferral: number;
};

export async function apiReferral(): Promise<ReferralInfo> {
  return json<ReferralInfo>(await fetch("/api/referral", { cache: "no-store" }));
}

// ---- Following system ----

export async function apiGetFollowing(): Promise<{ following: string[] }> {
  return json<{ following: string[] }>(
    await fetch("/api/follow", { cache: "no-store" }),
  );
}

export async function apiFollow(tipster: string): Promise<{ ok: boolean; following: boolean }> {
  return json(
    await fetch("/api/follow", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipster }),
    }),
  );
}

export async function apiUnfollow(tipster: string): Promise<{ ok: boolean; following: boolean }> {
  return json(
    await fetch(`/api/follow/${encodeURIComponent(tipster)}`, {
      method: "DELETE",
    }),
  );
}

// ---- Password reset ----

export async function apiResetRequest(email: string): Promise<{
  ok: boolean;
  message: string;
  demoToken?: string;
}> {
  return json(
    await fetch("/api/auth/reset-request", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    }),
  );
}

export async function apiResetConfirm(
  token: string,
  password: string,
): Promise<{ ok: boolean; message: string }> {
  return json(
    await fetch("/api/auth/reset-confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    }),
  );
}

// ---- Live matches (Highlightly API) ----

export type LiveMatch = {
  id: number;
  date: string;
  homeTeam: string;
  awayTeam: string;
  homeLogo: string | null;
  awayLogo: string | null;
  league: string;
  leagueLogo: string | null;
  status: string;
  score: string;
  halftime: string | null;
  fulltime: string | null;
  stadium: string | null;
};

export async function apiTodaysMatches(): Promise<{
  configured: boolean;
  matches: LiveMatch[];
  message?: string;
  error?: string;
}> {
  return json(await fetch("/api/matches/today", { cache: "no-store" }));
}
