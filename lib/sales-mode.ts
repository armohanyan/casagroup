import type { Project, SalesMode } from "@/types";
import { hasBuildingFloorPlates, projectKind } from "@/lib/project-kind";

export const SALES_MODES: SalesMode[] = ["master", "complex", "buildings", "floors", "plans"];

export function parseSalesMode(raw: unknown): SalesMode {
  if (raw === "master" || raw === "complex" || raw === "buildings" || raw === "floors" || raw === "plans") {
    return raw;
  }
  return "plans";
}

/** Effective sales mode for apartment projects; neighborhood ignores this. */
export function projectSalesMode(
  project?: Pick<Project, "kind" | "salesMode" | "buildings"> | null,
): SalesMode {
  if (projectKind(project) === "neighborhood") return "plans";
  if (project?.salesMode) return parseSalesMode(project.salesMode);
  return hasBuildingFloorPlates(project) ? "floors" : "plans";
}

export function usesMapStages(mode: SalesMode): boolean {
  return mode === "master" || mode === "complex" || mode === "buildings";
}

export function usesBuildingExterior(mode: SalesMode): boolean {
  return mode === "master" || mode === "complex" || mode === "buildings" || mode === "floors";
}

export function usesFloorJourney(mode: SalesMode): boolean {
  return mode !== "plans";
}
