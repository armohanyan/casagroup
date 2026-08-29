import { API_URL } from "@/lib/api";

/**
 * Rewrite absolute upload URLs to same-origin `/uploads/...` so the Next.js
 * rewrite can proxy them. Avoids broken localhost/API hosts and next/image
 * remotePatterns mismatches for admin-uploaded media.
 */
export function toBrowserMediaUrl(url: string): string {
  const trimmed = String(url || "").trim();
  if (!trimmed) return trimmed;
  if (trimmed.startsWith("/uploads/")) return trimmed;

  try {
    const parsed = new URL(trimmed, API_URL);
    // All CasaGroup media lives under /uploads - always load via same-origin proxy.
    if (parsed.pathname.startsWith("/uploads/")) {
      return `${parsed.pathname}${parsed.search}`;
    }
  } catch {
    /* keep original */
  }

  return trimmed;
}
