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
    location: "",
    locationHy: "",
    city: "Yerevan",
    cityHy: "Երևան",
    description: "",
    descriptionHy: "",
    longDescription: "",
    longDescriptionHy: "",
    images: [],
    droneVideos: [],
    startingPrice: 0,
    completionDate: "",
    constructionStart: "",
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

export function emptyBuilding(projectId: string, sortOrder = 0): Building {
  return {
    id: generateId(),
    projectId,
    name: "",
    sortOrder,
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
    price: 150000,
    status: "Available",
    viewType: "City",
    viewTypeHy: "Քաղաք",
    floorPlanImage: "",
    planPdfUrl: "",
    description: "",
    descriptionHy: "",
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
