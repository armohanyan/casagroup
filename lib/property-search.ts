import type { ReadonlyURLSearchParams } from "next/navigation";
import type { PropertyListing } from "@/lib/properties";
import { filterProperties } from "@/lib/properties";

export interface PropertyFilterState {
  city: string;
  maxPrice: number;
  rooms: string;
  project: string;
  minArea: number;
}

export function parsePropertyFilters(
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
): PropertyFilterState {
  return {
    city: searchParams.get("city") ?? "",
    maxPrice: Number(searchParams.get("maxPrice") ?? 0),
    rooms: searchParams.get("rooms") ?? "",
    project: searchParams.get("project") ?? "",
    minArea: Number(searchParams.get("minArea") ?? 0),
  };
}

export function buildPropertySearchQuery(filters: Partial<PropertyFilterState>): string {
  const params = new URLSearchParams();
  if (filters.city) params.set("city", filters.city);
  if (filters.maxPrice && filters.maxPrice > 0) params.set("maxPrice", String(filters.maxPrice));
  if (filters.rooms) params.set("rooms", filters.rooms);
  if (filters.project) params.set("project", filters.project);
  if (filters.minArea && filters.minArea > 0) params.set("minArea", String(filters.minArea));
  return params.toString();
}

export function filterListingsFromSearchParams(
  listings: PropertyListing[],
  searchParams: ReadonlyURLSearchParams | URLSearchParams,
  statusFilter = "",
): PropertyListing[] {
  const filters = parsePropertyFilters(searchParams);
  return filterProperties(listings, {
    city: filters.city,
    maxPrice: filters.maxPrice,
    rooms: filters.rooms,
    project: filters.project,
    minArea: filters.minArea,
    status: statusFilter,
  });
}
