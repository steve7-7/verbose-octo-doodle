// Static blog/news articles for the GoalEdge blog section.
// In production these would come from a CMS or database.

export type BlogArticle = {
  id: string;
  title: string;
  category: "Match Preview" | "Betting Guide" | "Analysis" | "News";
  excerpt: string;
  content: string;
  author: string;
  publishedAt: string; // ISO date
  readTime: number; // minutes
  gradient: string; // tailwind gradient classes for the cover
};

export const BLOG_ARTICLES: BlogArticle[] = [
  {
    id: "over-under-guide",
    title: "Mastering Over/Under Markets: A Complete Guide",
    category: "Betting Guide",
    excerpt:
      "Over/Under goals betting is one of the most popular and profitable markets. Learn how to identify value, read team form, and spot the best opportunities.",
    content: `## What is Over/Under betting?

Over/Under is a bet on whether the total goals in a match will be above or below a set line — usually 2.5.

## Why it's profitable

Unlike match results, Over/Under doesn't require you to predict the winner — just the goal tempo. This makes it ideal for matches where the outcome is uncertain but the style is predictable.

## Key factors to consider

1. **Team form** — Look at the last 5-10 matches. Are both teams scoring/conceding regularly?
2. **Head-to-head** — Some fixtures are inherently high or low scoring.
3. **Defensive record** — Clean sheets per game is a strong indicator.
4. **Motivation** — Must-win games tend to be more open.

## Pro tip

Focus on leagues with consistent scoring patterns. The Bundesliga averages 3+ goals per game, while Serie A historically leans Under.`,
    author: "Coach Alex",
    publishedAt: "2026-07-10T09:00:00.000Z",
    readTime: 5,
    gradient: "from-emerald-400 to-teal-600",
  },
  {
    id: "value-betting",
    title: "What is Value Betting? Finding Edge Against Bookmakers",
    category: "Betting Guide",
    excerpt:
      "Value betting is the foundation of long-term profit. Learn how to calculate expected value, spot mispriced odds, and bet with an edge.",
    content: `## The concept of value

A value bet exists when the probability of an outcome is higher than what the odds suggest. If you think a team has a 60% chance of winning but the odds imply 50%, that's value.

## How to calculate

Convert odds to implied probability: (1 / decimal odds) × 100. Compare to your own estimate.

## Example

Odds of 2.00 imply 50% probability. If you believe the true chance is 60%, the bet has positive expected value (+EV).

## Discipline matters

Value betting requires patience. You'll lose individual bets, but over hundreds of bets, the edge compounds. Track every bet and review quarterly.`,
    author: "Coach Alex",
    publishedAt: "2026-07-08T09:00:00.000Z",
    readTime: 4,
    gradient: "from-sky-400 to-indigo-600",
  },
  {
    id: "accumulator-risks",
    title: "The Truth About Accumulators: Risk vs Reward",
    category: "Analysis",
    excerpt:
      "Accumulators offer huge potential returns, but are they worth the risk? We break down the math and share smarter combo strategies.",
    content: `## Why accumulators are popular

The appeal is obvious — combine 4-5 picks and turn a small stake into a big payout. But the math works against you.

## The house edge compounds

Each leg carries the bookmaker's margin. With 4 legs at 5% margin, your effective margin is ~20%. That's a steep hill to climb.

## Smaller is better

Research shows 2-3 leg accumulators offer the best balance of return and win probability. Beyond 4 legs, the strike rate drops dramatically.

## When to use them

Accumulators work best when you have genuine conviction on multiple correlated picks — e.g., two favorites playing at home on the same day.`,
    author: "Arena Tipster",
    publishedAt: "2026-07-05T09:00:00.000Z",
    readTime: 4,
    gradient: "from-amber-400 to-orange-600",
  },
  {
    id: "bankroll-management",
    title: "Bankroll Management 101: Bet Smart, Stay in the Game",
    category: "Betting Guide",
    excerpt:
      "Without bankroll management, even the best tipsters go broke. Learn the 1-3% rule, Kelly Criterion, and how to survive losing streaks.",
    content: `## The golden rule

Never bet more than 1-3% of your bankroll on a single bet. This ensures you can weather inevitable losing streaks.

## The Kelly Criterion

A formula for optimal stake sizing: (bp - q) / b, where b is odds-1, p is win probability, q is 1-p. Many bettors use "half Kelly" for conservatism.

## Losing streaks are normal

Even with a 60% win rate, you'll hit 5-6 loss streaks regularly. Proper bankroll management ensures you survive them.

## Track everything

Keep a spreadsheet of every bet: stake, odds, result, profit. Review monthly to identify leaks and confirm your edge.`,
    author: "Coach Alex",
    publishedAt: "2026-07-01T09:00:00.000Z",
    readTime: 6,
    gradient: "from-rose-400 to-pink-600",
  },
  {
    id: "xg-explained",
    title: "Expected Goals (xG): The Stat That Changed Football Betting",
    category: "Analysis",
    excerpt:
      "xG measures the quality of chances a team creates. Learn how to use it to spot overperforming and underperforming teams.",
    content: `## What is xG?

Expected Goals (xG) quantifies the likelihood of a shot becoming a goal based on historical data: distance, angle, body part, assist type.

## Why it matters for betting

Teams outperforming their xG tend to regress. A team scoring 2.5 goals/game from 1.5 xG is due for a slowdown.

## How to use it

- Compare a team's actual goals vs xG over a 10-game window.
- Look for "unlucky" teams creating chances but not converting — they're due to bounce back.
- Pair xG with Over/Under markets for value plays.

## Tools

Most major stats sites (FBref, Understat) provide xG data for free.`,
    author: "Arena Tipster",
    publishedAt: "2026-06-28T09:00:00.000Z",
    readTime: 5,
    gradient: "from-violet-400 to-purple-600",
  },
  {
    id: "premier-league-preview",
    title: "Premier League Preview: What to Watch This Season",
    category: "Match Preview",
    excerpt:
      "From title contenders to relegation candidates, our breakdown of the Premier League season's key storylines and betting angles.",
    content: `## Title race

The usual suspects are at the top, but watch for emerging challengers. Early-season form often masks true quality — wait 6-8 games before drawing conclusions.

## Top 4 value

Look beyond the big six. Teams with strong xG but slow starts often offer value in top-4 markets.

## Relegation

Newly promoted teams are always vulnerable, but some establish themselves quickly. Track early-season results and manager changes.

## Betting angles

- Back favorites at home against bottom-half teams.
- Over 2.5 goals in matches between two attacking sides.
- BTTS Yes when both teams have leaky defenses but potent attacks.`,
    author: "Coach Alex",
    publishedAt: "2026-06-25T09:00:00.000Z",
    readTime: 7,
    gradient: "from-teal-400 to-emerald-600",
  },
];
