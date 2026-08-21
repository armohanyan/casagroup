const API_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000").replace(/\/$/, "");

export function getApiUrl(path = "") {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  // Browser: same-origin /api so Next can proxy (avoids CORS blocking view counts).
  if (typeof window !== "undefined" && suffix.startsWith("/api/")) {
    return suffix;
  }
  return `${API_URL}${suffix}`;
}

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

async function parseJson<T>(res: Response): Promise<T> {
  const data = (await res.json().catch(() => ({}))) as T & { error?: string };
  if (!res.ok) {
    throw new ApiError(res.status, (data as { error?: string }).error || res.statusText || "Request failed");
  }
  return data;
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit & { token?: string | null; timeoutMs?: number } = {}
): Promise<T> {
  const { token, headers, timeoutMs = 12_000, signal: outerSignal, ...rest } = options;
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  if (outerSignal) {
    if (outerSignal.aborted) controller.abort();
    else outerSignal.addEventListener("abort", () => controller.abort(), { once: true });
  }
  try {
    const res = await fetch(getApiUrl(path), {
      ...rest,
      // Auth is Bearer (localStorage), not cookies. Omitting cookies avoids nginx
      // "Request Header Or Cookie Too Large" when third-party cookies bloat the domain.
      credentials: "omit",
      signal: controller.signal,
      headers: {
        ...(rest.body ? { "Content-Type": "application/json" } : {}),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        ...headers,
      },
    });
    return await parseJson<T>(res);
  } catch (err) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new ApiError(408, `Request timed out: ${path}`);
    }
    throw err;
  } finally {
    clearTimeout(timer);
  }
}

export { API_URL };
