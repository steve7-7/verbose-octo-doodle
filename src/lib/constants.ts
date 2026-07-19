// GoalEdge shared constants

export const APP_NAME = "GoalEdge";

export type PlanId = "free" | "premium";

export interface PlanInfo {
  id: PlanId;
  name: string;
  price: number; // in KES
  period: string;
  durationHours: number | null;
  features: string[];
}

export const PLANS: Record<PlanId, PlanInfo> = {
  free: {
    id: "free",
    name: "Free",
    price: 0,
    period: "forever",
    durationHours: null,
    features: [
      "3 free daily tips",
      "Basic match predictions",
      "Community access",
      "Weekly performance recap",
    ],
  },
  premium: {
    id: "premium",
    name: "Premium 24hr",
    price: 100,
    period: "/24hr",
    durationHours: 24,
    features: [
      "Unlimited premium tips for 24 hours",
      "In-depth match analysis",
      "High-value accumulator picks",
      "Real-time odds alerts",
      "Priority email support",
    ],
  },
};

export interface LeagueInfo {
  name: string;
  country: string;
  icon: string;
}

export const LEAGUES: LeagueInfo[] = [
  { name: "Premier League", country: "England", icon: "🦁" },
  { name: "La Liga", country: "Spain", icon: "🇪🇸" },
  { name: "Serie A", country: "Italy", icon: "🇮🇹" },
  { name: "Bundesliga", country: "Germany", icon: "🇩🇪" },
  { name: "Ligue 1", country: "France", icon: "🇫🇷" },
  { name: "Champions League", country: "Europe", icon: "⭐" },
  { name: "Europa League", country: "Europe", icon: "🏆" },
  { name: "NPFL", country: "Nigeria", icon: "🇳🇬" },
  { name: "MLS", country: "USA", icon: "🇺🇸" },
  { name: "World Cup Qualifiers", country: "International", icon: "🌍" },
];

export const MARKETS = [
  "Match Result",
  "Over/Under",
  "Both Teams to Score",
  "Double Chance",
  "Correct Score",
  "Goals",
  "Corners",
  "Cards",
] as const;

export const RISK_LEVELS = ["low", "medium", "high"] as const;

export type StatusKey = "upcoming" | "won" | "lost" | "void";

export const STATUS_CONFIG: Record<
  StatusKey,
  { label: string; badge: string; dot: string }
> = {
  upcoming: {
    label: "Upcoming",
    badge: "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
    dot: "bg-sky-500",
  },
  won: {
    label: "Won",
    badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
    dot: "bg-emerald-500",
  },
  lost: {
    label: "Lost",
    badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    dot: "bg-rose-500",
  },
  void: {
    label: "Void",
    badge: "bg-slate-100 text-slate-600 ring-1 ring-slate-200",
    dot: "bg-slate-400",
  },
};

export const CONFIDENCE_TIERS = [
  { min: 85, label: "Very High", color: "text-emerald-600" },
  { min: 70, label: "High", color: "text-emerald-600" },
  { min: 55, label: "Medium", color: "text-amber-600" },
  { min: 0, label: "Value Bet", color: "text-slate-500" },
];

export function confidenceTier(value: number) {
  return CONFIDENCE_TIERS.find((t) => value >= t.min) ?? CONFIDENCE_TIERS[3]!;
}

export const RISK_CONFIG: Record<
  string,
  { label: string; badge: string }
> = {
  low: { label: "Low risk", badge: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200" },
  medium: { label: "Medium risk", badge: "bg-amber-50 text-amber-700 ring-1 ring-amber-200" },
  high: { label: "High risk", badge: "bg-rose-50 text-rose-700 ring-1 ring-rose-200" },
};
