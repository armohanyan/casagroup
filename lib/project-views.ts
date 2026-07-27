import { apiFetch } from "@/lib/api";

const SESSION_KEY = "cg-view-session";
const VIEWED_PREFIX = "cg-project-viewed:";

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id = typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `s-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
      sessionStorage.setItem(SESSION_KEY, id);
    }
    return id;
  } catch {
    return `s-${Date.now()}`;
  }
}

function viewedKey(projectId: string) {
  return `${VIEWED_PREFIX}${projectId}`;
}

/** Fetch real view count from API (0 on failure). */
export async function fetchProjectViewCount(projectId: string): Promise<number> {
  try {
    const data = await apiFetch<{ views: number }>(`/api/views/${encodeURIComponent(projectId)}`);
    return Number.isFinite(data.views) ? data.views : 0;
  } catch {
    return 0;
  }
}

/** Record one view per browser session via API. Returns updated count when successful. */
export async function recordProjectView(projectId: string): Promise<number | null> {
  if (typeof window === "undefined" || !projectId) return null;
  try {
    if (sessionStorage.getItem(viewedKey(projectId))) {
      return fetchProjectViewCount(projectId);
    }
    sessionStorage.setItem(viewedKey(projectId), "1");
    const data = await apiFetch<{ views: number }>("/api/views", {
      method: "POST",
      body: JSON.stringify({ projectId, sessionId: getOrCreateSessionId() }),
    });
    return Number.isFinite(data.views) ? data.views : null;
  } catch {
    try {
      sessionStorage.removeItem(viewedKey(projectId));
    } catch {
      /* ignore */
    }
    return null;
  }
}
