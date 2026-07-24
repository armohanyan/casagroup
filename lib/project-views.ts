/** Stable base view count from project id (SSR-safe). */
export function getBaseProjectViews(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) >>> 0;
  return 48 + (h % 220);
}

function storageKey(id: string) {
  return `cg-project-views:${id}`;
}

function sessionKey(id: string) {
  return `cg-project-viewed:${id}`;
}

/** Total views = base + local extras (client only). */
export function getProjectViewCount(id: string): number {
  const base = getBaseProjectViews(id);
  if (typeof window === "undefined") return base;
  try {
    const extra = Number(localStorage.getItem(storageKey(id)) ?? "0");
    return base + (Number.isFinite(extra) ? Math.max(0, extra) : 0);
  } catch {
    return base;
  }
}

/** Record one view per browser session. */
export function recordProjectView(id: string): void {
  if (typeof window === "undefined") return;
  try {
    if (sessionStorage.getItem(sessionKey(id))) return;
    sessionStorage.setItem(sessionKey(id), "1");
    const prev = Number(localStorage.getItem(storageKey(id)) ?? "0");
    localStorage.setItem(storageKey(id), String((Number.isFinite(prev) ? prev : 0) + 1));
  } catch {
    /* ignore */
  }
}
