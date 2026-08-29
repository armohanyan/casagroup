import type { Metadata } from "next";
import { SITE_NAME } from "@/lib/site-config";

export const DEFAULT_OG_IMAGE = "/yerevan.png";

/** Join SEO title segments with a spaced hyphen separator. */
export function joinSeoTitleParts(...parts: Array<string | null | undefined>): string {
  return parts
    .map((part) => part?.trim().replace(/\s*-\s*$/, "").trim())
    .filter((part): part is string => Boolean(part))
    .join(" - ");
}

/** Project detail pages: "Arabkir Heights - Yerevan" */
export function formatProjectSeoTitle(title: string, city: string): string {
  return joinSeoTitleParts(title, city);
}

interface PageMetaInput {
  title: string;
  description: string;
  /** Canonical path, e.g. "/projects" (resolved against metadataBase). */
  path: string;
  image?: string;
  ogType?: "website" | "article";
}

/**
 * Server-rendered per-page metadata so crawlers see correct titles,
 * descriptions, canonicals, and Open Graph tags without executing JS.
 * The client-side <Seo> component then keeps them in sync on language switch.
 */
export function buildPageMetadata({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  ogType = "website",
}: PageMetaInput): Metadata {
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: path,
      type: ogType,
      locale: "hy_AM",
      images: [{ url: image }],
    },
    twitter: {
      card: "summary_large_image",
      title: `${title} | ${SITE_NAME}`,
      description,
      images: [image],
    },
  };
}
