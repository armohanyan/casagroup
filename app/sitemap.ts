import type { MetadataRoute } from "next";
import { MOCK_PROJECTS } from "@/data/mock";
import { getProjectsForSite } from "@/src/lib/projects-airtable";

function baseUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "https://www.example.com").replace(/\/$/, "");
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = baseUrl();
  const entries: MetadataRoute.Sitemap = [];
  const now = new Date();

  const staticPaths = ["/", "/projects", "/services", "/about", "/contact"];
  for (const path of staticPaths) {
    entries.push({
      url: `${base}${path}`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: path === "/" ? 1 : 0.8,
    });
  }

  let projects = MOCK_PROJECTS;
  try {
    projects = await getProjectsForSite();
  } catch {
    projects = MOCK_PROJECTS;
  }

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
