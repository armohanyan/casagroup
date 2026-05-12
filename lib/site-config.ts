/** Public site URL for canonicals, Open Graph, and sitemap (no trailing slash). Set in `.env` as `VITE_SITE_URL`. */
export function getSiteUrl(): string {
  const raw = import.meta.env.VITE_SITE_URL?.trim();
  if (raw) return raw.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "http://localhost:5173";
}

export const SITE_NAME = "CasaGroup";

export const SITE_TAGLINE =
  "New construction sales, modern residential complexes, and premium apartments in Armenia — a trusted property buying experience.";

export const DEFAULT_META_DESCRIPTION =
  "CasaGroup connects buyers with curated new-build residential projects across Armenia — premium apartments, transparent sales, and developer-direct new construction.";

export const META_KEYWORDS = [
  "CasaGroup",
  "Armenia real estate",
  "new construction Yerevan",
  "premium apartments Armenia",
  "residential complexes",
  "new build sales",
  "property buying",
  "developer projects",
].join(", ");

export const SITE_AUTHOR = "CasaGroup";

export const THEME_COLOR = "#0C1428";

export const DEFAULT_OG_IMAGE_PATH = "/og-image.png";

export function absoluteUrl(path: string): string {
  const base = getSiteUrl();
  if (!path || path === "/") return base;
  return `${base}${path.startsWith("/") ? path : `/${path}`}`;
}

export function defaultOgImageUrl(): string {
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH);
}
