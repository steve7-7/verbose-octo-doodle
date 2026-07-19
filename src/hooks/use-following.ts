"use client";

import { useState, useCallback } from "react";
import {
  apiGetFollowing,
  apiFollow,
  apiUnfollow,
} from "@/lib/api-client";

// Hook for managing followed tipsters (server-backed).
export function useFollowing() {
  const [following, setFollowing] = useState<string[]>([]);
  const [loaded, setLoaded] = useState(false);

  const load = useCallback(async () => {
    try {
      const res = await apiGetFollowing();
      setFollowing(res.following);
    } catch {
      // ignore
    } finally {
      setLoaded(true);
    }
  }, []);

  const toggle = useCallback(async (tipster: string) => {
    const isFollowing = following.includes(tipster);
    // Optimistic update
    setFollowing((prev) =>
      isFollowing ? prev.filter((t) => t !== tipster) : [...prev, tipster],
    );
    try {
      if (isFollowing) {
        await apiUnfollow(tipster);
      } else {
        await apiFollow(tipster);
      }
    } catch {
      // Revert on failure
      setFollowing((prev) =>
        isFollowing ? [...prev, tipster] : prev.filter((t) => t !== tipster),
      );
    }
  }, [following]);

  const isFollowingTipster = useCallback(
    (tipster: string) => following.includes(tipster),
    [following],
  );

  return { following, loaded, load, toggle, isFollowingTipster };
}
