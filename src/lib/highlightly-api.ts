// Highlightly Sports API — server-side helper.
// API key is read from HIGHLIGHTLY_API_KEY env var (never exposed to client).
// Docs: https://sports.highlightly.net

const BASE_URL = "https://sports.highlightly.net";

function getApiKey(): string | null {
  return process.env.HIGHLIGHTLY_API_KEY || null;
}

function headers(): Record<string, string> {
  return {
    "x-rapidapi-key": getApiKey() ?? "",
    "Content-Type": "application/json",
  };
}

export function isHighlightlyConfigured(): boolean {
  return !!getApiKey();
}

export type HighlightlyMatch = {
  id: number;
  date: string;
  homeTeam: { id: number; name: string; logo?: string };
  awayTeam: { id: number; name: string; logo?: string };
  league: { id: number; name: string; logo?: string; season?: string };
  state: {
    description: string; // e.g. "Not started", "Finished", "1st Half"
    score: {
      current: string; // e.g. "2 - 1"
      halftime?: string;
      fulltime?: string;
    };
  };
  stadium?: { name: string; city?: string };
};

export type HighlightlyResponse<T> = {
  data: T[];
  pagination?: { totalCount: number; currentPage: number; pageSize: number };
};

// Fetch matches for a specific date (YYYY-MM-DD). Defaults to today.
export async function getMatchesByDate(date?: string): Promise<HighlightlyMatch[]> {
  const targetDate = date || new Date().toISOString().split("T")[0]!;
  const url = `${BASE_URL}/football/matches?date=${targetDate}&limit=100`;

  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Highlightly API error: ${res.status} ${res.statusText}`);
  }

  const json: HighlightlyResponse<HighlightlyMatch> = await res.json();
  return json.data ?? [];
}

// Fetch today's matches.
export async function getTodaysMatches(): Promise<HighlightlyMatch[]> {
  return getMatchesByDate();
}

// Fetch head-to-head between two teams.
export async function getH2H(team1Id: number, team2Id: number): Promise<HighlightlyMatch[]> {
  const url = `${BASE_URL}/football/h2h?team1Id=${team1Id}&team2Id=${team2Id}&limit=10`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Highlightly H2H API error: ${res.status}`);
  }
  const json: HighlightlyResponse<HighlightlyMatch> = await res.json();
  return json.data ?? [];
}

// Search for a team by name (returns team IDs needed for H2H).
export type HighlightlyTeam = {
  id: number;
  name: string;
  logo?: string;
  country?: { name: string; code: string };
};

export async function searchTeam(name: string): Promise<HighlightlyTeam[]> {
  const url = `${BASE_URL}/football/teams?search=${encodeURIComponent(name)}&limit=5`;
  const res = await fetch(url, { headers: headers() });
  if (!res.ok) {
    throw new Error(`Highlightly team search error: ${res.status}`);
  }
  const json: HighlightlyResponse<HighlightlyTeam> = await res.json();
  return json.data ?? [];
}
