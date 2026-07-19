"use client";

import { useState, useCallback } from "react";

const FAV_KEY = "ge_fav_leagues_v1";

function loadFavs(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(FAV_KEY);
    if (!raw) return [];
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

function saveFavs(leagues: string[]) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(FAV_KEY, JSON.stringify(leagues));
  } catch {
    // ignore
  }
}

// Hook for managing favorite leagues (localStorage-backed).
export function useFavorites() {
  // Lazy init from localStorage (only runs on client since this is a "use client" module)
  const [favorites, setFavorites] = useState<string[]>(() => loadFavs());

  const toggle = useCallback((league: string) => {
    setFavorites((prev) => {
      const next = prev.includes(league)
        ? prev.filter((l) => l !== league)
        : [...prev, league];
      saveFavs(next);
      return next;
    });
  }, []);

  const isFavorite = useCallback(
    (league: string) => favorites.includes(league),
    [favorites],
  );

  return { favorites, toggle, isFavorite };
}
