// Seed the GoalEdge database with demo users + predictions.
// Run: bun run src/db/seed.ts

import bcrypt from "bcryptjs";
import { db } from "@/lib/db";

const PASSWORD_HASH = bcrypt.hashSync("password123", 10);
const hours = (h: number) => new Date(Date.now() + h * 3600 * 1000);

type SeedPrediction = {
  homeTeam: string;
  awayTeam: string;
  league: string;
  leagueIcon: string;
  country: string;
  kickoffAt: Date;
  tip: string;
  market: string;
  odds: number;
  confidence: number;
  risk: "low" | "medium" | "high";
  analysis: string;
  isPremium: boolean;
  status: "upcoming" | "won" | "lost" | "void";
  scoreHome: number | null;
  scoreAway: number | null;
  tipster: string;
};

const SEED_PREDICTIONS: SeedPrediction[] = [
  {
    homeTeam: "Manchester City",
    awayTeam: "Arsenal",
    league: "Premier League",
    leagueIcon: "🦁",
    country: "England",
    kickoffAt: hours(6),
    tip: "Over 2.5 Goals",
    market: "Over/Under",
    odds: 1.72,
    confidence: 88,
    risk: "low",
    analysis:
      "Both sides boast elite attacking units and have shipped goals in recent head-to-heads. City average 2.6 xG at home while Arsenal have conceded in 9 of their last 10 away fixtures. Expect an open, high-scoring affair.",
    isPremium: true,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Coach Alex",
  },
  {
    homeTeam: "Real Madrid",
    awayTeam: "Sevilla",
    league: "La Liga",
    leagueIcon: "🇪🇸",
    country: "Spain",
    kickoffAt: hours(3),
    tip: "Real Madrid to Win",
    market: "Match Result",
    odds: 1.45,
    confidence: 90,
    risk: "low",
    analysis:
      "Madrid are unbeaten at the Bernabéu this season and Sevilla have one win in their last seven league outings. Home advantage + superior squad depth makes this the safest pick on the slip.",
    isPremium: false,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "Bayern Munich",
    awayTeam: "Borussia Dortmund",
    league: "Bundesliga",
    leagueIcon: "🇩🇪",
    country: "Germany",
    kickoffAt: hours(28),
    tip: "Both Teams to Score - Yes",
    market: "Both Teams to Score",
    odds: 1.55,
    confidence: 86,
    risk: "low",
    analysis:
      "Der Klassiker rarely disappoints. BTTS has landed in 8 of the last 10 meetings between these two, and both attacks are firing on all cylinders.",
    isPremium: true,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Coach Alex",
  },
  {
    homeTeam: "Inter Milan",
    awayTeam: "Napoli",
    league: "Serie A",
    leagueIcon: "🇮🇹",
    country: "Italy",
    kickoffAt: hours(30),
    tip: "Under 2.5 Goals",
    market: "Over/Under",
    odds: 1.8,
    confidence: 78,
    risk: "medium",
    analysis:
      "A tactical battle between two of the stingiest defences in Europe. Inter have kept a clean sheet in 6 of their last 8 home matches.",
    isPremium: true,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Coach Alex",
  },
  {
    homeTeam: "Liverpool",
    awayTeam: "Brighton",
    league: "Premier League",
    leagueIcon: "🦁",
    country: "England",
    kickoffAt: hours(5),
    tip: "Liverpool -1 Handicap",
    market: "Match Result",
    odds: 2.05,
    confidence: 82,
    risk: "medium",
    analysis:
      "Anfield under the lights is a fortress. Liverpool's high press should overwhelm a Brighton side missing key midfielders.",
    isPremium: false,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "PSG",
    awayTeam: "Marseille",
    league: "Ligue 1",
    leagueIcon: "🇫🇷",
    country: "France",
    kickoffAt: hours(52),
    tip: "PSG to Win & Over 2.5",
    market: "Goals",
    odds: 1.95,
    confidence: 84,
    risk: "medium",
    analysis:
      "Le Classique tends to explode at the Parc des Princes. PSG have scored 3+ in five straight home games against Marseille.",
    isPremium: true,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Coach Alex",
  },
  {
    homeTeam: "Barcelona",
    awayTeam: "Atletico Madrid",
    league: "La Liga",
    leagueIcon: "🇪🇸",
    country: "Spain",
    kickoffAt: hours(2),
    tip: "Double Chance - Home/Draw",
    market: "Double Chance",
    odds: 1.4,
    confidence: 87,
    risk: "low",
    analysis:
      "Barça are dominant at home and Atleti set up to frustrate. The double chance removes the upset risk while keeping strong value.",
    isPremium: false,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "Enyimba FC",
    awayTeam: "Rangers International",
    league: "NPFL",
    leagueIcon: "🇳🇬",
    country: "Nigeria",
    kickoffAt: hours(7),
    tip: "Over 1.5 Goals",
    market: "Over/Under",
    odds: 1.65,
    confidence: 80,
    risk: "medium",
    analysis:
      "A fiery Oriental derby. The last four meetings between these rivals have all produced at least two goals.",
    isPremium: false,
    status: "upcoming",
    scoreHome: null,
    scoreAway: null,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "Arsenal",
    awayTeam: "Chelsea",
    league: "Premier League",
    leagueIcon: "🦁",
    country: "England",
    kickoffAt: hours(-26),
    tip: "Arsenal to Win",
    market: "Match Result",
    odds: 1.85,
    confidence: 85,
    risk: "low",
    analysis:
      "Arsenal's home form has been electric and Chelsea continue to struggle on the road against top-six opposition.",
    isPremium: false,
    status: "won",
    scoreHome: 3,
    scoreAway: 1,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "Juventus",
    awayTeam: "AC Milan",
    league: "Serie A",
    leagueIcon: "🇮🇹",
    country: "Italy",
    kickoffAt: hours(-50),
    tip: "Under 2.5 Goals",
    market: "Over/Under",
    odds: 1.75,
    confidence: 81,
    risk: "medium",
    analysis:
      "Two pragmatic, defensively sound sides. Historically a cagey affair with limited clear-cut chances.",
    isPremium: true,
    status: "won",
    scoreHome: 1,
    scoreAway: 0,
    tipster: "Coach Alex",
  },
  {
    homeTeam: "Tottenham",
    awayTeam: "Newcastle",
    league: "Premier League",
    leagueIcon: "🦁",
    country: "England",
    kickoffAt: hours(-74),
    tip: "Both Teams to Score - Yes",
    market: "Both Teams to Score",
    odds: 1.6,
    confidence: 83,
    risk: "low",
    analysis:
      "Both teams prioritise attack and have leaky transitions. A goal-fest is the expected outcome.",
    isPremium: false,
    status: "won",
    scoreHome: 2,
    scoreAway: 2,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "Manchester United",
    awayTeam: "Aston Villa",
    league: "Premier League",
    leagueIcon: "🦁",
    country: "England",
    kickoffAt: hours(-30),
    tip: "Man United to Win",
    market: "Match Result",
    odds: 2.1,
    confidence: 72,
    risk: "high",
    analysis:
      "United looked the stronger side on paper, but Villa's counter-attacking threat made this a riskier pick than the odds suggested.",
    isPremium: false,
    status: "lost",
    scoreHome: 0,
    scoreAway: 1,
    tipster: "Arena Tipster",
  },
  {
    homeTeam: "RB Leipzig",
    awayTeam: "Freiburg",
    league: "Bundesliga",
    leagueIcon: "🇩🇪",
    country: "Germany",
    kickoffAt: hours(-98),
    tip: "Over 3.5 Goals",
    market: "Over/Under",
    odds: 2.4,
    confidence: 68,
    risk: "high",
    analysis:
      "An ambitious total-goals play that narrowly missed. The match stayed tight and chances were at a premium.",
    isPremium: true,
    status: "lost",
    scoreHome: 2,
    scoreAway: 1,
    tipster: "Coach Alex",
  },
  {
    homeTeam: "Napoli",
    awayTeam: "Lazio",
    league: "Serie A",
    leagueIcon: "🇮🇹",
    country: "Italy",
    kickoffAt: hours(-72),
    tip: "Correct Score 2-0",
    market: "Correct Score",
    odds: 9.5,
    confidence: 40,
    risk: "high",
    analysis:
      "A speculative correct-score value bet. The shape was right but Lazio nicked a late consolation.",
    isPremium: true,
    status: "lost",
    scoreHome: 2,
    scoreAway: 1,
    tipster: "Coach Alex",
  },
];

async function main() {
  console.log("🌱 Seeding GoalEdge database...");

  // Users
  const users = [
    {
      name: "Alex Coach",
      email: "admin@goaledge.com",
      passwordHash: PASSWORD_HASH,
      role: "admin",
      plan: "premium",
      avatarColor: "#10b981",
      planExpiresAt: hours(24 * 400),
    },
    {
      name: "Tunde Bello",
      email: "premium@goaledge.com",
      passwordHash: PASSWORD_HASH,
      role: "user",
      plan: "premium",
      avatarColor: "#0ea5e9",
      planExpiresAt: hours(24 * 25),
    },
    {
      name: "Grace Mwangi",
      email: "free@goaledge.com",
      passwordHash: PASSWORD_HASH,
      role: "user",
      plan: "free",
      avatarColor: "#f59e0b",
      planExpiresAt: null,
    },
  ];

  for (const u of users) {
    const existing = await db.user.findUnique({ where: { email: u.email } });
    if (!existing) {
      await db.user.create({ data: u });
      console.log(`  ✓ created user ${u.email}`);
    } else {
      await db.user.update({
        where: { email: u.email },
        data: {
          passwordHash: u.passwordHash,
          role: u.role as "user" | "admin",
          plan: u.plan as "free" | "premium",
          avatarColor: u.avatarColor,
          planExpiresAt: u.planExpiresAt,
        },
      });
      console.log(`  ✓ synced user ${u.email}`);
    }
  }

  // Predictions
  const reset = process.argv.includes("--reset");
  const count = await db.prediction.count();
  if (count > 0 && reset) {
    await db.prediction.deleteMany();
    console.log(`  ⚠ Reset: deleted ${count} predictions.`);
  }
  if (count > 0 && !reset) {
    console.log(`  ✓ Predictions already seeded (${count}). Skipping. (use --reset to re-seed)`);
  } else {
    await db.prediction.createMany({
      data: SEED_PREDICTIONS.map((p) => ({
        ...p,
        analysis: p.analysis,
      })),
    });
    console.log(`  ✓ inserted ${SEED_PREDICTIONS.length} predictions.`);
  }

  // Demo subscription for premium user
  const premiumUser = await db.user.findUnique({ where: { email: "premium@goaledge.com" } });
  if (premiumUser) {
    const subs = await db.subscription.count({ where: { userId: premiumUser.id } });
    if (subs === 0) {
      await db.subscription.create({
        data: {
          userId: premiumUser.id,
          reference: "GE-SEED-001",
          email: premiumUser.email,
          amount: 100,
          currency: "KES",
          plan: "premium-24h",
          status: "success",
          provider: "mock",
          paidAt: hours(-24 * 5),
        },
      });
      console.log("  ✓ inserted demo subscription.");
    }
  }

  console.log("🌱 Seed complete.");
}

main()
  .catch((err) => {
    console.error("Seed failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
