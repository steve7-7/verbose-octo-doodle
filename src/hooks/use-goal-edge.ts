"use client";

import { create } from "zustand";
import type { SafeUser, ClientPrediction } from "@/lib/types";
import {
  apiLogin,
  apiLogout,
  apiMe,
  apiRegister,
} from "@/lib/api-client";

export type DashboardTab =
  | "overview"
  | "predictions"
  | "results"
  | "analytics"
  | "leaderboard"
  | "slip"
  | "blog"
  | "activity"
  | "subscription"
  | "profile"
  | "admin"
  | "tester";

export type SlipItem = {
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
};

type State = {
  user: SafeUser | null;
  isPremium: boolean;
  loading: boolean; // initial boot loading
  tab: DashboardTab;
  authOpen: boolean;
  authMode: "login" | "register";

  // prediction detail modal
  detailPrediction: ClientPrediction | null;
  detailId: number | null;
  detailLoading: boolean;
  openDetail: (id: number, fallback?: ClientPrediction) => Promise<void>;
  closeDetail: () => void;

  // bet slip
  slip: SlipItem[];
  slipOpen: boolean; // mobile slip drawer
  addToSlip: (p: SlipItem) => void;
  removeFromSlip: (id: number) => void;
  clearSlip: () => void;
  toggleSlip: () => void;
  inSlip: (id: number) => boolean;

  boot: () => Promise<void>;
  setTab: (t: DashboardTab) => void;
  openAuth: (mode: "login" | "register") => void;
  closeAuth: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  setUser: (u: SafeUser | null, premium?: boolean) => void;
};

const SLIP_KEY = "ge_slip_v1";

function loadSlip(): SlipItem[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SLIP_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    return arr as SlipItem[];
  } catch {
    return [];
  }
}

function saveSlip(items: SlipItem[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SLIP_KEY, JSON.stringify(items));
  } catch {
    // ignore
  }
}

// Debounced server-side slip persistence.
let slipSyncTimer: ReturnType<typeof setTimeout> | null = null;
function scheduleSlipSync(items: SlipItem[]) {
  if (slipSyncTimer) clearTimeout(slipSyncTimer);
  slipSyncTimer = setTimeout(async () => {
    try {
      const { apiSaveSlip } = await import("@/lib/api-client");
      await apiSaveSlip(items.map((x) => x.id));
    } catch {
      // ignore network errors — localStorage is the fallback
    }
  }, 800);
}

export const useGoalEdge = create<State>((set, get) => ({
  user: null,
  isPremium: false,
  loading: true,
  tab: "overview",
  authOpen: false,
  authMode: "login",

  detailPrediction: null,
  detailId: null,
  detailLoading: false,
  openDetail: async (id, fallback) => {
    set({ detailId: id, detailLoading: true, detailPrediction: fallback ?? null });
    try {
      const { apiPrediction } = await import("@/lib/api-client");
      const { prediction } = await apiPrediction(id);
      set({ detailPrediction: prediction, detailLoading: false });
    } catch {
      set({ detailLoading: false });
    }
  },
  closeDetail: () => set({ detailId: null, detailPrediction: null, detailLoading: false }),

  slip: typeof window !== "undefined" ? loadSlip() : [],
  slipOpen: false,
  addToSlip: (p) => {
    const cur = get().slip;
    if (cur.some((x) => x.id === p.id)) return;
    const next = [...cur, p];
    saveSlip(next);
    scheduleSlipSync(next);
    set({ slip: next });
  },
  removeFromSlip: (id) => {
    const next = get().slip.filter((x) => x.id !== id);
    saveSlip(next);
    scheduleSlipSync(next);
    set({ slip: next });
  },
  clearSlip: () => {
    saveSlip([]);
    scheduleSlipSync([]);
    set({ slip: [] });
  },
  toggleSlip: () => set((s) => ({ slipOpen: !s.slipOpen })),
  inSlip: (id) => get().slip.some((x) => x.id === id),

  boot: async () => {
    try {
      const { user, isPremium } = await apiMe();
      let slip = loadSlip();
      // If logged in, sync slip from server (takes precedence over localStorage)
      if (user) {
        try {
          const { apiGetSlip } = await import("@/lib/api-client");
          const server = await apiGetSlip();
          if (server.predictions.length > 0) {
            slip = server.predictions.map((p) => ({
              id: p.id,
              homeTeam: p.homeTeam,
              awayTeam: p.awayTeam,
              league: p.league,
              leagueIcon: p.leagueIcon,
              tip: p.tip,
              market: p.market,
              odds: p.odds,
              kickoffAt: p.kickoffAt,
              isPremium: p.isPremium,
            }));
            saveSlip(slip);
          } else if (slip.length > 0) {
            // Local has items but server is empty — push local to server
            scheduleSlipSync(slip);
          }
        } catch {
          // server fetch failed — keep localStorage slip
        }
      }
      set({ user, isPremium, loading: false, slip });
    } catch {
      set({ user: null, isPremium: false, loading: false });
    }
  },

  setTab: (t) => set({ tab: t }),

  openAuth: (mode) => set({ authOpen: true, authMode: mode }),
  closeAuth: () => set({ authOpen: false }),

  login: async (email, password) => {
    const { user } = await apiLogin({ email, password });
    // Fetch server-side slip after login
    let slip = loadSlip();
    try {
      const { apiGetSlip } = await import("@/lib/api-client");
      const server = await apiGetSlip();
      if (server.predictions.length > 0) {
        slip = server.predictions.map((p) => ({
          id: p.id,
          homeTeam: p.homeTeam,
          awayTeam: p.awayTeam,
          league: p.league,
          leagueIcon: p.leagueIcon,
          tip: p.tip,
          market: p.market,
          odds: p.odds,
          kickoffAt: p.kickoffAt,
          isPremium: p.isPremium,
        }));
        saveSlip(slip);
      } else if (slip.length > 0) {
        scheduleSlipSync(slip);
      }
    } catch {
      // ignore
    }
    const isPremiumActive =
      user.plan === "premium" &&
      user.planExpiresAt != null &&
      new Date(user.planExpiresAt).getTime() > Date.now();
    set({ user, isPremium: isPremiumActive, authOpen: false, tab: "overview", slip });
  },

  register: async (name, email, password) => {
    const { user } = await apiRegister({ name, email, password });
    set({ user, isPremium: false, authOpen: false, tab: "overview" });
  },

  logout: async () => {
    await apiLogout();
    saveSlip([]);
    if (slipSyncTimer) clearTimeout(slipSyncTimer);
    set({ user: null, isPremium: false, tab: "overview", slip: [] });
  },

  refreshUser: async () => {
    const { user, isPremium } = await apiMe();
    set({ user, isPremium });
  },

  setUser: (u, premium) =>
    set({ user: u, isPremium: premium ?? u?.plan === "premium" }),
}));
