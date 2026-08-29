import type { LandPlot, Project, ProjectKind } from "@/types";

export function projectKind(project?: Pick<Project, "kind"> | null): ProjectKind {
  return project?.kind === "neighborhood" ? "neighborhood" : "building";
}

export function hasBuildingFloorPlates(project?: Pick<Project, "buildings"> | null): boolean {
  return (project?.buildings ?? []).some((b) =>
    (b.floors ?? []).some((f) => Boolean(f.imageUrl?.trim()) || (f.hotspots?.length ?? 0) > 0),
  );
}

export function hasNeighborhoodSite(
  project?: Pick<Project, "sitePlanImage" | "landPlots"> | null,
): boolean {
  return Boolean(project?.sitePlanImage?.trim()) || (project?.landPlots?.length ?? 0) > 0;
}

/**
 * Prefer neighborhood UI only when tagged as such and it has site/plot data.
 * If it still has building floor plates and no neighborhood site, keep building UI
 * so floors / hotspots stay editable and are not wiped on save.
 */
export function isNeighborhoodProject(
  project?: Pick<Project, "kind" | "buildings" | "sitePlanImage" | "landPlots"> | null,
): boolean {
  if (projectKind(project) !== "neighborhood") return false;
  if (hasNeighborhoodSite(project)) return true;
  if (hasBuildingFloorPlates(project)) return false;
  return true;
}

/** Kind that should be persisted - always matches the admin UI mode. */
export function effectiveProjectKind(
  project?: Pick<Project, "kind" | "buildings" | "sitePlanImage" | "landPlots"> | null,
): ProjectKind {
  return isNeighborhoodProject(project) ? "neighborhood" : "building";
}

export function findLandPlot(plots: LandPlot[] | undefined, id?: string | null) {
  if (!id) return undefined;
  return plots?.find((p) => p.id === id);
}
