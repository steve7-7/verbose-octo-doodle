import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(60),
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters").max(100),
});

export const loginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(1, "Password is required"),
});

export const profileSchema = z.object({
  name: z.string().min(2).max(60),
  avatarColor: z.string().min(4).max(9),
});

export const predictionSchema = z.object({
  homeTeam: z.string().min(1, "Home team required").max(80),
  awayTeam: z.string().min(1, "Away team required").max(80),
  league: z.string().min(1).max(60),
  leagueIcon: z.string().default("⚽"),
  country: z.string().default("International"),
  kickoffAt: z.string().min(1, "Kickoff time required"),
  tip: z.string().min(1, "Tip required").max(120),
  market: z.string().min(1),
  odds: z.number().min(1.01).max(1000),
  confidence: z.number().int().min(1).max(99),
  risk: z.enum(["low", "medium", "high"]),
  analysis: z.string().max(2000).optional().nullable(),
  isPremium: z.boolean().default(false),
  status: z.enum(["upcoming", "won", "lost", "void"]).default("upcoming"),
  scoreHome: z.number().int().min(0).max(99).nullable().optional(),
  scoreAway: z.number().int().min(0).max(99).nullable().optional(),
  tipster: z.string().min(1).max(60).default("Arena Tipster"),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type PredictionInput = z.infer<typeof predictionSchema>;
