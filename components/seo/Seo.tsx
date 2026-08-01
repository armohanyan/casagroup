import { useEffect } from "react";
import {
  SITE_NAME,
  SITE_AUTHOR,
  META_KEYWORDS,
  THEME_COLOR,
  absoluteUrl,
} from "@/lib/site-config";
import { DEFAULT_OG_IMAGE } from "@/lib/seo-meta";

export interface SeoProps {
  title: string;
  description: string;
  path: string;
  image?: string;
  lang?: "en" | "hy";
  noindex?: boolean;
  ogType?: "website" | "article";
}

function upsertMeta(attr: "name" | "property", key: string, content: string) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement("meta");
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute("content", content);
}

function upsertLink(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  el.setAttribute("href", href);
}

export function Seo({
  title,
  description,
  path,
  image,
  lang = "en",
  noindex = false,
  ogType = "website",
}: SeoProps) {
  useEffect(() => {
    const canonical = absoluteUrl(path === "" ? "/" : path.startsWith("/") ? path : `/${path}`);
    const robots = noindex
      ? "noindex, nofollow"
      : "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1";
    const fullHeadline = `${title} | ${SITE_NAME}`;

    document.documentElement.lang = lang;
    document.title = fullHeadline;

    upsertMeta("name", "description", description);
    upsertMeta("name", "keywords", META_KEYWORDS);
    upsertMeta("name", "author", SITE_AUTHOR);
    upsertMeta("name", "robots", robots);
    upsertMeta("name", "theme-color", THEME_COLOR);
    upsertLink("canonical", canonical);

    upsertMeta("property", "og:site_name", SITE_NAME);
    upsertMeta("property", "og:title", fullHeadline);
    upsertMeta("property", "og:description", description);
    upsertMeta("property", "og:url", canonical);
    upsertMeta("property", "og:type", ogType);
    upsertMeta("property", "og:locale", lang === "hy" ? "hy_AM" : "en_US");

    // Never remove head nodes here: the server metadata (buildPageMetadata)
    // renders these tags, so they are React-managed. Deleting them crashes
    // React's next head update ("removeChild of null") and breaks navigation.
    const ogImage = absoluteUrl(image ?? DEFAULT_OG_IMAGE);
    upsertMeta("property", "og:image", ogImage);
    upsertMeta("name", "twitter:card", "summary_large_image");
    upsertMeta("name", "twitter:image", ogImage);

    upsertMeta("name", "twitter:title", fullHeadline);
    upsertMeta("name", "twitter:description", description);
  }, [title, description, path, image, lang, noindex, ogType]);

  return null;
}
