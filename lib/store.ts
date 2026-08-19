import type { Project, Apartment, Building, BuildingFloor } from "@/types";

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
  };
}

export function emptyApartment(projectId: string, buildingId?: string): Apartment {
  return {
    id: generateId(),
    projectId,
    buildingId,
    apartmentNumber: "",
    floor: 1,
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
