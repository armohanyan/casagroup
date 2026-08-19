import type { Apartment, Building, BuildingKind } from "@/types";

export function buildingKind(building?: Pick<Building, "kind"> | null): BuildingKind {
  return building?.kind === "neighborhood" ? "neighborhood" : "building";
}

export function isNeighborhood(building?: Pick<Building, "kind"> | null): boolean {
  return buildingKind(building) === "neighborhood";
}

export function findBuilding(buildings: Building[] | undefined, id?: string | null) {
  if (!id) return undefined;
  return buildings?.find((b) => b.id === id);
}

export function isHouseUnit(apt: Pick<Apartment, "buildingId">, buildings?: Building[]): boolean {
  return isNeighborhood(findBuilding(buildings, apt.buildingId));
}
