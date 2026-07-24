import type { MetadataRoute } from "next";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com").replace(/\/$/, "");
}

export default function robots(): MetadataRoute.Robots {
  const base = baseUrl();
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin-lx9k2m", "/admin-lx9k2m/"],
    },
    sitemap: `${base}/sitemap.xml`,
  };
}
