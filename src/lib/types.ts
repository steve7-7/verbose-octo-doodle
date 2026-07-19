// Shared client/server types for GoalEdge

export type SafeUser = {
  id: string;
  name: string;
  email: string;
  role: "user" | "admin";
  plan: "free" | "premium";
  avatarColor: string;
  planExpiresAt: string | null;
  createdAt: string;
};

export type Prediction = {
  id: number;
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueIcon: string;
  country: string;
  kickoffAt: string;
  tip: string;
  market: string;
  odds: number;
  confidence: number;
  risk: "low" | "medium" | "high";
  analysis: string | null;
  isPremium: boolean;
  status: "upcoming" | "won" | "lost" | "void";
  scoreHome: number | null;
  scoreAway: number | null;
  tipster: string;
  createdAt: string;
};

// Prediction with a `locked` flag derived from the viewer's plan
export type ClientPrediction = Prediction & { locked: boolean };

export type Stats = {
  total: number;
  upcoming: number;
  won: number;
  lost: number;
  void: number;
  settled: number;
  premium: number;
  winRate: number;
};

export type SubscriptionRow = {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  plan: string;
  status: string;
  provider: string;
  createdAt: string;
  paidAt: string | null;
};
