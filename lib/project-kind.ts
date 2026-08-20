import type { LandPlot, Project, ProjectKind } from "@/types";

export function projectKind(project?: Pick<Project, "kind"> | null): ProjectKind {
  return project?.kind === "neighborhood" ? "neighborhood" : "building";
}

export function isNeighborhoodProject(project?: Pick<Project, "kind"> | null): boolean {
  return projectKind(project) === "neighborhood";
}

export function findLandPlot(plots: LandPlot[] | undefined, id?: string | null) {
  if (!id) return undefined;
  return plots?.find((p) => p.id === id);
}
