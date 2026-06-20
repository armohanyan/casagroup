import type { Apartment, Project } from "@/types";

export interface PropertyListing {
  apartment: Apartment;
  project: Project;
}

/** Flatten all apartments across projects into searchable property listings. */
export function getAllProperties(projects: Project[]): PropertyListing[] {
  const listings: PropertyListing[] = [];
  for (const project of projects) {
    for (const apartment of project.apartments) {
      listings.push({ apartment, project });
    }
  }
  return listings;
}

/** Available apartments only. */
export function getAvailableProperties(projects: Project[]): PropertyListing[] {
  return getAllProperties(projects).filter(({ apartment }) => apartment.status === "Available");
}

export interface PropertySearchParams {
  city?: string;
  maxPrice?: number;
  rooms?: string;
  status?: string;
}

export function filterProperties(
  listings: PropertyListing[],
  params: PropertySearchParams & { project?: string; minArea?: number },
): PropertyListing[] {
  return listings.filter(({ apartment, project }) => {
    if (params.city && project.city !== params.city) return false;
    if (params.project && project.slug !== params.project) return false;
    if (params.maxPrice && params.maxPrice > 0 && apartment.price > params.maxPrice) return false;
    if (params.minArea && params.minArea > 0 && apartment.area < params.minArea) return false;
    if (params.status && apartment.status !== params.status) return false;
    if (params.rooms) {
      const r = parseInt(params.rooms, 10);
      const match = params.rooms === "4" ? apartment.rooms >= 4 : apartment.rooms === r;
      if (!match) return false;
    }
    return true;
  });
}
