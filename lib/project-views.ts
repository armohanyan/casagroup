import { apiFetch } from "@/lib/api";

const SESSION_KEY = "cg-view-session";
const VIEWED_PREFIX = "cg-project-viewed:";
/** Share one in-flight POST per project (React Strict Mode safe). */
const pendingRecords = new Map<string, Promise<number | null>>();

function getOrCreateSessionId(): string {
  try {
    let id = sessionStorage.getItem(SESSION_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && "randomUUID" in crypto
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

/** Fetch real view count from API. Returns null on failure so UI can keep a known count. */
export async function fetchProjectViewCount(projectId: string): Promise<number | null> {
  try {
    const data = await apiFetch<{ views: number }>(`/api/views/${encodeURIComponent(projectId)}`);
    return Number.isFinite(data.views) ? data.views : null;
  } catch {
    return null;
  }
}

/** Record one view per browser session via API. Returns updated count when successful. */
export async function recordProjectView(projectId: string): Promise<number | null> {
  if (typeof window === "undefined" || !projectId) return null;

  try {
    if (sessionStorage.getItem(viewedKey(projectId))) {
      return fetchProjectViewCount(projectId);
    }
  } catch {
    /* sessionStorage unavailable — still attempt record */
  }

  const inflight = pendingRecords.get(projectId);
  if (inflight) return inflight;

  const promise = (async (): Promise<number | null> => {
    try {
      const data = await apiFetch<{ views: number }>("/api/views", {
        method: "POST",
        body: JSON.stringify({ projectId, sessionId: getOrCreateSessionId() }),
      });
      try {
        sessionStorage.setItem(viewedKey(projectId), "1");
      } catch {
        /* ignore */
      }
      return Number.isFinite(data.views) ? data.views : null;
    } catch {
      return null;
    } finally {
      pendingRecords.delete(projectId);
    }
  })();

  pendingRecords.set(projectId, promise);
  return promise;
}
