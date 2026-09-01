import type { Project, Apartment, Building, BuildingFloor, LandPlot, ProjectMapStage } from "@/types";

export function generateId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export function emptyProject(): Omit<Project, "id" | "slug"> {
  return {
    title: "",
    titleHy: "",
    titleRu: "",
    location: "",
    locationHy: "",
    locationRu: "",
    city: "Yerevan",
    cityHy: "Երևան",
    cityRu: "Ереван",
    description: "",
    descriptionHy: "",
    descriptionRu: "",
    longDescription: "",
    longDescriptionHy: "",
    longDescriptionRu: "",
    images: [],
    droneVideos: [],
    startingPrice: 0,
    completionDate: "",
    completionDateHy: "",
    completionDateRu: "",
    constructionStart: "",
    constructionStartHy: "",
    constructionStartRu: "",
    status: "Under Construction",
    availableApartmentsCount: 0,
    totalApartments: 0,
    floors: 0,
    amenities: [],
    nearbyPlaces: [],
    paymentOptions: [],
    kind: "building",
    salesMode: "plans",
    mapStages: [],
    sitePlanImage: "",
    landPlots: [],
    buildings: [],
    apartments: [],
    developer: "CasaGroup",
    architect: "",
    coordinates: { lat: 40.1872, lng: 44.5152 },
    tags: [],
    featured: true,
  };
}

export function emptyBuilding(
  projectId: string,
  sortOrder = 0,
  kind: Building["kind"] = "building",
): Building {
  return {
    id: generateId(),
    projectId,
    name: "",
    sortOrder,
    kind,
    exteriorImageUrl: "",
    textLabels: [],
    landArea: kind === "neighborhood" ? 0 : undefined,
    price: kind === "neighborhood" ? 0 : undefined,
    images: kind === "neighborhood" ? [] : undefined,
    floors: [],
  };
}

export function emptyBuildingFloor(buildingId: string, sortOrder = 0): BuildingFloor {
  return {
    id: generateId(),
    buildingId,
    label: String(sortOrder + 1),
    sortOrder,
    imageUrl: "",
    hotspots: [],
    textLabels: [],
    exteriorHotspot: [],
  };
}

export function emptyMapStage(projectId: string, parentId?: string | null, sortOrder = 0): ProjectMapStage {
  return {
    id: generateId(),
    projectId,
    parentId: parentId ?? null,
    label: "",
    labelHy: "",
    labelRu: "",
    imageUrl: "",
    sortOrder,
    hotspots: [],
    textLabels: [],
  };
}

export function emptyLandPlot(projectId: string, sortOrder = 0): LandPlot {
  return {
    id: generateId(),
    projectId,
    label: String(sortOrder + 1),
    sortOrder,
    area: 0,
    price: 0,
    status: "Available",
    points: [],
  };
}

export function emptyApartment(projectId: string, buildingId?: string, landPlotId?: string): Apartment {
  return {
    id: generateId(),
    projectId,
    buildingId,
    landPlotId,
    apartmentNumber: "",
    floor: landPlotId ? 0 : 1,
    rooms: 2,
    area: 80,
    landArea: 0,
    price: 150000,
    status: "Available",
    viewType: "City",
    viewTypeHy: "Քաղաք",
    viewTypeRu: "Город",
    floorPlanImage: "",
    planPdfUrl: "",
    description: "",
    descriptionHy: "",
    descriptionRu: "",
    gallery: [],
    balcony: false,
  };
}

/** Copy a unit plan for another apartment. Room number stays empty unless overridden. */
export function cloneApartmentPlan(
  source: Apartment,
  overrides: Partial<Apartment> = {},
): Apartment {
  return {
    ...source,
    ...overrides,
    id: generateId(),
    apartmentNumber: overrides.apartmentNumber ?? "",
    status: overrides.status ?? "Available",
    gallery: overrides.gallery ?? [...(source.gallery ?? [])],
  };
}
