// Deterministic mock data generator for head-to-head + recent form.
// Uses a seeded hash of team names so each match always shows the same "stats".

function hashStr(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function seeded(seed: number) {
  let s = seed || 1;
  return () => {
    s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

export type FormResult = "W" | "D" | "L";

export interface TeamForm {
  team: string;
  results: FormResult[]; // last 5, oldest → newest
  goalsFor: number;
  goalsAgainst: number;
  cleanSheets: number;
}

export interface H2HMatch {
  date: string;
  home: string;
  away: string;
  scoreHome: number;
  scoreAway: number;
}

export interface H2HSummary {
  homeWins: number;
  draws: number;
  awayWins: number;
  matches: H2HMatch[];
}

// Generate last-5 form for a team (deterministic)
export function getTeamForm(team: string): TeamForm {
  const rng = seeded(hashStr(team));
  const outcomes: FormResult[] = [];
  let gf = 0;
  let ga = 0;
  let cs = 0;
  for (let i = 0; i < 5; i++) {
    const r = rng();
    if (r < 0.5) outcomes.push("W");
    else if (r < 0.75) outcomes.push("D");
    else outcomes.push("L");
    const scored = Math.floor(rng() * 4);
    const conceded = Math.floor(rng() * 3);
    gf += scored;
    ga += conceded;
    if (conceded === 0) cs++;
  }
  return { team, results: outcomes, goalsFor: gf, goalsAgainst: ga, cleanSheets: cs };
}

// Generate H2H between two teams (last 5 meetings, deterministic)
export function getH2H(home: string, away: string): H2HSummary {
  const rng = seeded(hashStr(home + " vs " + away));
  const matches: H2HMatch[] = [];
  let homeWins = 0;
  let draws = 0;
  let awayWins = 0;
  for (let i = 0; i < 5; i++) {
    const sh = Math.floor(rng() * 4);
    const sa = Math.floor(rng() * 4);
    if (sh > sa) homeWins++;
    else if (sh === sa) draws++;
    else awayWins++;
    // date: ~ i*60 days ago
    const d = new Date(Date.now() - (i + 1) * 60 * 86400 * 1000);
    matches.push({
      date: d.toISOString().slice(0, 10),
      home,
      away,
      scoreHome: sh,
      scoreAway: sa,
    });
  }
  return { homeWins, draws, awayWins, matches };
}

// Generate a "stat comparison" row set for two teams
export interface StatRow {
  label: string;
  home: number;
  away: number;
  homeBetter: boolean;
}

export function getStatComparison(home: string, away: string): StatRow[] {
  const rng = seeded(hashStr(home + "stats" + away));
  const mk = (min: number, max: number) => Math.floor(rng() * (max - min + 1)) + min;
  const rows: StatRow[] = [
    { label: "Avg goals scored", home: mk(1, 3), away: mk(1, 3), homeBetter: false },
    { label: "Avg goals conceded", home: mk(0, 2), away: mk(0, 2), homeBetter: false },
    { label: "Shot accuracy %", home: mk(40, 65), away: mk(40, 65), homeBetter: false },
    { label: "Possession %", home: mk(45, 65), away: mk(45, 65), homeBetter: false },
    { label: "Clean sheets (L5)", home: mk(0, 4), away: mk(0, 4), homeBetter: false },
  ];
  for (const r of rows) {
    // For "conceded", lower is better
    const lowerBetter = r.label.includes("conceded");
    r.homeBetter = lowerBetter ? r.home < r.away : r.home > r.away;
  }
  return rows;
}
