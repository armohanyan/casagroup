import type { LandPlot, Project, ProjectKind } from "@/types";

export function projectKind(project?: Pick<Project, "kind"> | null): ProjectKind {
  return project?.kind === "neighborhood" ? "neighborhood" : "building";
}

function hasBuildingFloorPlates(project?: Pick<Project, "buildings"> | null): boolean {
  return (project?.buildings ?? []).some((b) =>
    (b.floors ?? []).some((f) => Boolean(f.imageUrl?.trim())),
  );
}

function hasNeighborhoodSite(project?: Pick<Project, "sitePlanImage" | "landPlots"> | null): boolean {
  return Boolean(project?.sitePlanImage?.trim()) || (project?.landPlots?.length ?? 0) > 0;
}

/** Prefer neighborhood UI only when the project is tagged as such and has site/plot data.
 *  If it still has building floor plates and no neighborhood site, keep building UI so floors stay visible. */
export function isNeighborhoodProject(
  project?: Pick<Project, "kind" | "buildings" | "sitePlanImage" | "landPlots"> | null,
): boolean {
  if (projectKind(project) !== "neighborhood") return false;
  if (hasNeighborhoodSite(project)) return true;
  if (hasBuildingFloorPlates(project)) return false;
  return true;
}

export function findLandPlot(plots: LandPlot[] | undefined, id?: string | null) {
  if (!id) return undefined;
  return plots?.find((p) => p.id === id);
}
