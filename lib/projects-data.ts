import type { Project } from "@/types";
import { MOCK_PROJECTS } from "@/data/mock";
import { getApiUrl } from "@/lib/api";

/** Fetch projects from Express API; fall back to seed for build-time. */
export async function getProjects(): Promise<Project[]> {
  try {
    const res = await fetch(getApiUrl("/api/projects"), {
      next: { revalidate: 60 },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as Project[];
  } catch {
    return MOCK_PROJECTS;
  }
}

export async function getProjectBySlug(slug: string): Promise<Project | undefined> {
  try {
    const res = await fetch(getApiUrl(`/api/projects/${encodeURIComponent(slug)}`), {
      next: { revalidate: 60 },
    });
    if (res.status === 404) return undefined;
    if (!res.ok) throw new Error(`API ${res.status}`);
    return (await res.json()) as Project;
  } catch {
    return MOCK_PROJECTS.find((p) => p.slug === slug);
  }
}

/** @deprecated Prefer getProjects() — seed fallback only. */
export function getSeedProjects(): Project[] {
  return MOCK_PROJECTS;
}

export function getSeedProjectBySlug(slug: string): Project | undefined {
  return MOCK_PROJECTS.find((p) => p.slug === slug);
}
