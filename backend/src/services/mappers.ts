import type { Apartment, Building, BuildingFloor, Project } from "@prisma/client";

type BuildingWithFloors = Building & { floors?: BuildingFloor[] };

type ProjectWithRelations = Project & {
  apartments?: Apartment[];
  buildings?: BuildingWithFloors[];
};

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function mapBuildingFloor(floor: BuildingFloor) {
  return {
    id: floor.id,
    buildingId: floor.buildingId,
    label: floor.label,
    sortOrder: floor.sortOrder,
    imageUrl: floor.imageUrl,
    hotspots: asArray<{ apartmentId: string; points: [number, number][] }>(floor.hotspots),
  };
}

export function mapBuilding(building: BuildingWithFloors) {
  const floors = [...(building.floors ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
  return {
    id: building.id,
    projectId: building.projectId,
    name: building.name,
    sortOrder: building.sortOrder,
    floors: floors.map(mapBuildingFloor),
  };
}

export function mapApartment(apt: Apartment) {
  return {
    id: apt.id,
    projectId: apt.projectId,
    buildingId: apt.buildingId ?? undefined,
    floor: apt.floor,
    rooms: apt.rooms,
    area: apt.area,
    price: apt.price,
    status: apt.status,
    viewType: apt.viewType,
    floorPlanImage: apt.floorPlanImage,
    planPdfUrl: apt.planPdfUrl ?? undefined,
    description: apt.description ?? undefined,
    gallery: asArray<string>(apt.gallery),
    balcony: apt.balcony,
  };
}

export function mapProject(project: ProjectWithRelations) {
  const buildings = [...(project.buildings ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  return {
    id: project.id,
    title: project.title,
    slug: project.slug,
    location: project.location,
    city: project.city,
    description: project.description,
    descriptionHy: project.descriptionHy ?? undefined,
    longDescription: project.longDescription,
    longDescriptionHy: project.longDescriptionHy ?? undefined,
    images: asArray<string>(project.images),
    gallery: project.gallery ?? undefined,
    videoUrl: project.videoUrl ?? undefined,
    droneVideos: project.droneVideos ?? undefined,
    startingPrice: project.startingPrice,
    completionDate: project.completionDate,
    status: project.status,
    availableApartmentsCount: project.availableApartmentsCount,
    totalApartments: project.totalApartments,
    floors: project.floors,
    amenities: asArray(project.amenities),
    nearbyPlaces: asArray(project.nearbyPlaces),
    paymentOptions: asArray(project.paymentOptions),
    buildings: buildings.map(mapBuilding),
    apartments: (project.apartments ?? []).map(mapApartment),
    developer: project.developer,
    architect: project.architect ?? undefined,
    managementCompany: project.managementCompany ?? undefined,
    partnerBank: project.partnerBank ?? undefined,
    constructionStart: project.constructionStart ?? undefined,
    exclusiveSalesRights: project.exclusiveSalesRights ?? undefined,
    coordinates: { lat: project.lat, lng: project.lng },
    tags: asArray<string>(project.tags),
    featured: project.featured,
  };
}
