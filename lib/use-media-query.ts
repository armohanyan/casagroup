"use client";

import { useEffect, useState } from "react";

/**
 * Subscribes to `window.matchMedia(query)` after mount. Initial value is `false`
 * so the first client render matches SSR; the real value applies after mount.
 */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const sync = () => setMatches(mq.matches);
    sync();
    mq.addEventListener("change", sync);
    return () => mq.removeEventListener("change", sync);
  }, [query]);

  return matches;
}
