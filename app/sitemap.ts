import type { MetadataRoute } from "next";
import { getProjects } from "@/lib/projects-data";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://casagroup.am").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  const staticPaths = [
    "/",
    "/projects",
    "/investment",
    "/calculator",
    "/partners",
    "/partners/services",
    "/about",
    "/contact",
  ];
  for (const path of staticPaths) {
    entries.push({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.8,
    });
  }

  const projects = await getProjects();

  for (const p of projects) {
    entries.push({
      url: `${base}/projects/${p.slug}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    });
    for (const apt of p.apartments) {
      entries.push({
        url: `${base}/projects/${p.slug}/apartments/${apt.id}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.7,
      });
    }
  }

  return entries;
}
