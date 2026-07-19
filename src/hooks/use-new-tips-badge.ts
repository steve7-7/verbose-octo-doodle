"use client";

import { useState, useCallback } from "react";

const LAST_SEEN_KEY = "ge_last_seen_tip_count_v1";

function readLastSeen(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(LAST_SEEN_KEY);
    return raw != null ? parseInt(raw, 10) : null;
  } catch {
    return null;
  }
}

// Hook for tracking "new tips since last visit".
// Stores the last-seen tip count in localStorage and exposes a
// `newCount` that indicates how many new tips exist beyond the last-seen count.
export function useNewTipsBadge(currentCount: number) {
  // Lazy init from localStorage (client-only, "use client" module)
  const [lastSeen, setLastSeen] = useState<number | null>(() => {
    const stored = readLastSeen();
    if (stored != null) return stored;
    // First visit — set baseline so no badge shows initially
    if (typeof window !== "undefined" && currentCount > 0) {
      try {
        window.localStorage.setItem(LAST_SEEN_KEY, String(currentCount));
      } catch {
        // ignore
      }
    }
    return currentCount;
  });

  const newCount =
    lastSeen != null && currentCount > lastSeen ? currentCount - lastSeen : 0;

  const markSeen = useCallback((count: number) => {
    try {
      window.localStorage.setItem(LAST_SEEN_KEY, String(count));
      setLastSeen(count);
    } catch {
      // ignore
    }
  }, []);

  return { newCount, markSeen };
}
