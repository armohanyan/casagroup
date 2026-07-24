"use client";

import { useEffect, useState } from "react";
import {
  getRecentlyViewedSnapshot,
  subscribeRecentlyViewed,
  type RecentListing,
} from "@/lib/recently-viewed";

/** Client-only recently viewed list; returns null until mounted. */
export function useRecentlyViewed(): RecentListing[] | null {
  const [items, setItems] = useState<RecentListing[] | null>(null);

  useEffect(() => {
    const sync = () => {
      const next = getRecentlyViewedSnapshot();
      setItems((prev) => (prev === next ? prev : next));
    };

    sync();
    return subscribeRecentlyViewed(sync);
  }, []);

  return items;
}
