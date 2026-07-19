// Simple in-memory cache server with stale-while-revalidate + tag invalidation.
// Stats endpoint (/api/tester) surfaces hit rates and avg latency.

type Entry<T> = {
  value: T;
  expiresAt: number; // fresh-until
  staleUntil: number; // serve-stale-until
  bornAt: number;
};

type Stats = {
  hits: number;
  misses: number;
  stale: number;
  sets: number;
  invalidations: number;
  latencies: number[]; // ms, capped
};

const TTL_FRESH_MS = 30_000; // 30s fresh
const TTL_STALE_MS = 5 * 60_000; // 5m stale-while-revalidate
const LATENCY_CAP = 200;

const store = new Map<string, Entry<unknown>>();
const tags = new Map<string, Set<string>>(); // tag -> set of keys
const stats: Stats = {
  hits: 0,
  misses: 0,
  stale: 0,
  sets: 0,
  invalidations: 0,
  latencies: [],
};

function now() {
  return Date.now();
}

function trackLatency(ms: number) {
  stats.latencies.push(ms);
  if (stats.latencies.length > LATENCY_CAP) stats.latencies.shift();
}

export async function cached<T>(
  key: string,
  tags: string[] | undefined,
  producer: () => Promise<T>,
  opts: { freshMs?: number; staleMs?: number } = {},
): Promise<T> {
  const start = now();
  const existing = store.get(key) as Entry<T> | undefined;
  const t = now();

  if (existing) {
    if (t < existing.expiresAt) {
      stats.hits++;
      trackLatency(now() - start);
      return existing.value;
    }
    if (t < existing.staleUntil) {
      stats.stale++;
      // refresh in background
      void refresh(key, tags, producer, opts).catch(() => {});
      trackLatency(now() - start);
      return existing.value;
    }
  }

  stats.misses++;
  const value = await producer();
  setEntry(key, value, tags, opts);
  trackLatency(now() - start);
  return value;
}

async function refresh<T>(
  key: string,
  tags: string[] | undefined,
  producer: () => Promise<T>,
  opts: { freshMs?: number; staleMs?: number },
) {
  try {
    const value = await producer();
    setEntry(key, value, tags, opts);
  } catch {
    // ignore background refresh errors
  }
}

const MAX_ENTRIES = 500;

function setEntry<T>(
  key: string,
  value: T,
  tags: string[] | undefined,
  opts: { freshMs?: number; staleMs?: number },
) {
  const t = now();
  const fresh = opts.freshMs ?? TTL_FRESH_MS;
  const stale = opts.staleMs ?? TTL_STALE_MS;

  // LRU eviction: if at capacity, remove the oldest entry.
  if (store.size >= MAX_ENTRIES && !store.has(key)) {
    // Map iterates in insertion order — first entry is oldest.
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }

  store.set(key, {
    value,
    expiresAt: t + fresh,
    staleUntil: t + stale,
    bornAt: t,
  });
  stats.sets++;
  if (tags && tags.length) {
    for (const tag of tags) {
      const set = tagsMapGet(tag);
      set.add(key);
    }
  }
}

function tagsMapGet(tag: string): Set<string> {
  let s = tags.get(tag);
  if (!s) {
    s = new Set();
    tags.set(tag, s);
  }
  return s;
}

export function invalidateTag(tag: string): number {
  const keys = tags.get(tag);
  if (!keys) return 0;
  let count = 0;
  for (const k of keys) {
    if (store.delete(k)) count++;
  }
  tags.delete(tag);
  stats.invalidations += count;
  return count;
}

export function invalidateAll(): number {
  const n = store.size;
  store.clear();
  tags.clear();
  stats.invalidations += n;
  return n;
}

export function cacheStats() {
  const total = stats.hits + stats.misses + stats.stale;
  const avgLatency =
    stats.latencies.length > 0
      ? Math.round(stats.latencies.reduce((a, b) => a + b, 0) / stats.latencies.length)
      : 0;
  const p95 =
    stats.latencies.length > 0
      ? [...stats.latencies].sort((a, b) => a - b)[Math.floor(stats.latencies.length * 0.95)] ?? 0
      : 0;
  return {
    hits: stats.hits,
    misses: stats.misses,
    stale: stats.stale,
    sets: stats.sets,
    invalidations: stats.invalidations,
    entries: store.size,
    hitRate: total === 0 ? 0 : Math.round((stats.hits / total) * 100),
    avgLatencyMs: avgLatency,
    p95LatencyMs: p95,
  };
}

export async function benchmark<T>(producer: () => Promise<T>): Promise<{
  cachedMs: number;
  uncachedMs: number;
  speedup: number;
  value: T;
}> {
  // uncached: invalidate everything, run
  invalidateAll();
  const t0 = now();
  const value = await producer();
  const uncachedMs = now() - t0;

  // cached: run again (should hit)
  const t1 = now();
  await producer();
  const cachedMs = now() - t1;

  const speedup = cachedMs > 0 ? Math.round((uncachedMs / cachedMs) * 10) / 10 : 0;
  return { cachedMs, uncachedMs, speedup, value };
}
