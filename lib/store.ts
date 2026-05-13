import type { Project, Apartment } from "@/types";

const STORAGE_KEY = "casagroup_projects_v1";

export function loadCustomProjects(): Project[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomProjects(projects: Project[]): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
}

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
    location: "",
    city: "Yerevan",
    description: "",
    longDescription: "",
    images: [],
    droneVideos: [],
    startingPrice: 0,
    completionDate: "",
    status: "Under Construction",
    availableApartmentsCount: 0,
    totalApartments: 0,
    floors: 0,
    amenities: [],
    nearbyPlaces: [],
    paymentOptions: [],
    apartments: [],
    developer: "CasaGroup",
    architect: "",
    coordinates: { lat: 40.1872, lng: 44.5152 },
    tags: [],
    featured: false,
  };
}

export function emptyApartment(projectId: string): Apartment {
  return {
    id: generateId(),
    projectId,
    floor: 1,
    rooms: 2,
    area: 80,
    price: 150000,
    status: "Available",
    viewType: "City",
    floorPlanImage: "",
    gallery: [],
    balcony: false,
  };
}
