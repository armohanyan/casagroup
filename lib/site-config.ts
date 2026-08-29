/** Public site URL for canonicals, Open Graph, and sitemap (no trailing slash). Set in `.env` as `NEXT_PUBLIC_SITE_URL`. */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "http://localhost:3000";
}

export const SITE_NAME = "CasaGroup";

export const SITE_TAGLINE =
  "New construction sales, modern residential complexes, and premium apartments in Armenia - a trusted property buying experience.";

export const DEFAULT_META_DESCRIPTION =
  "CasaGroup connects buyers with curated new-build residential projects across Armenia - premium apartments, transparent sales, and developer-direct new construction.";

export const META_KEYWORDS = [
  "CasaGroup",
  "apartments in Yerevan",
  "new developments Armenia",
  "buy apartment Armenia",
  "primary market real estate",
  "new construction apartments",
  "investment property Armenia",
  "Armenia real estate",
  "premium apartments Armenia",
  "property buying",
].join(", ");

export const SITE_AUTHOR = "CasaGroup";

export const THEME_COLOR = "#FAF8F5";

/** Primary brand navy - use for accents, focus states, dark bands (not full-page backgrounds). */
export const BRAND_COLOR = "#0C1428";

export const ACCENT_COLOR = "#c9a96e";

/** Partner portal URL - set `NEXT_PUBLIC_PARTNER_PORTAL_URL` for subdomain (e.g. partners.casagroup.am). */
export function getPartnerPortalUrl(): string {
  const raw = process.env.NEXT_PUBLIC_PARTNER_PORTAL_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  return `${getSiteUrl()}/partners`;
}

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}
