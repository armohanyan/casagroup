/**
 * Backend origin for server-side proxies/rewrites.
 * Never point this at the public site URL — that causes nginx↔Next rewrite loops
 * ("400 Request Header Or Cookie Too Large") or bogus 401s.
 */
export function getInternalBackendUrl(): string {
  const explicit = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.API_INTERNAL_URL ||
    ""
  ).replace(/\/$/, "");
  if (explicit) {
    try {
      const host = new URL(explicit).hostname;
      if (host !== "localhost" && host !== "127.0.0.1" && !host.endsWith(".internal")) {
        console.warn(
          `[backend-url] BACKEND_INTERNAL_URL host "${host}" is not loopback; using http://127.0.0.1:4000 to avoid proxy loops`
        );
        return "http://127.0.0.1:4000";
      }
    } catch {
      /* use as-is below */
    }
    return explicit;
  }

  const pub = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000").replace(/\/$/, "");

  try {
    const api = new URL(pub);
    if (api.hostname === "localhost" || api.hostname === "127.0.0.1") return pub;
  } catch {
    /* fall through */
  }

  // Public/API hostnames must not be used for server-side proxying.
  return "http://127.0.0.1:4000";
}
