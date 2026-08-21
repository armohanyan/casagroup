/**
 * Backend origin for server-side proxies/rewrites.
 * Never point this at the public site URL — that causes nginx↔Next rewrite loops
 * ("400 Request Header Or Cookie Too Large").
 */
export function getInternalBackendUrl(): string {
  const explicit = (
    process.env.BACKEND_INTERNAL_URL ||
    process.env.API_INTERNAL_URL ||
    ""
  ).replace(/\/$/, "");
  if (explicit) return explicit;

  const pub = (process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000").replace(/\/$/, "");
  const site = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");

  try {
    const api = new URL(pub);
    const isLoopback = api.hostname === "localhost" || api.hostname === "127.0.0.1";
    if (isLoopback) return pub;

    if (site) {
      const siteHost = new URL(site).hostname;
      if (api.hostname === siteHost || api.hostname === `www.${siteHost}` || `www.${api.hostname}` === siteHost) {
        return "http://127.0.0.1:4000";
      }
    }
  } catch {
    /* fall through */
  }

  return pub;
}
