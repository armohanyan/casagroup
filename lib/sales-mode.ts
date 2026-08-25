import type { Project, SalesMode } from "@/types";
import { hasBuildingFloorPlates, projectKind } from "@/lib/project-kind";

/** The three supported public sales flows. */
export const SALES_MODES: SalesMode[] = ["plans", "floors", "buildings"];

/**
 * Normalize stored / legacy values.
 * `master` and `complex` map to `buildings` (multi-building map entry).
 */
export function parseSalesMode(raw: unknown): SalesMode {
  if (raw === "master" || raw === "complex" || raw === "buildings") return "buildings";
  if (raw === "floors") return "floors";
  if (raw === "plans") return "plans";
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

/** Multi-building site map (case 3). */
export function usesMapStages(mode: SalesMode): boolean {
  return mode === "buildings";
}

/** Building exterior with floor bands (cases 2–3). */
export function usesBuildingExterior(mode: SalesMode): boolean {
  return mode === "buildings" || mode === "floors";
}

export function usesFloorJourney(mode: SalesMode): boolean {
  return mode !== "plans";
}
