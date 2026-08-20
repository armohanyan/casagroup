import type { Apartment, Building, BuildingFloor, LandPlot, Project } from "@prisma/client";

type BuildingWithFloors = Building & { floors?: BuildingFloor[] };

type ProjectWithRelations = Project & {
  apartments?: Apartment[];
  buildings?: BuildingWithFloors[];
  landPlots?: LandPlot[];
  _count?: { views?: number };
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
  const kind = building.kind === "neighborhood" ? "neighborhood" : "building";
  const images = asArray<string>(building.images);
  return {
    id: building.id,
    projectId: building.projectId,
    name: building.name,
    sortOrder: building.sortOrder,
    kind,
    landArea: building.landArea ?? undefined,
    price: building.price ?? undefined,
    images: images.length ? images : undefined,
    floors: floors.map(mapBuildingFloor),
  };
}

function parsePoints(raw: unknown): [number, number][] {
  if (!Array.isArray(raw)) return [];
  return raw
    .filter((p): p is [number, number] => Array.isArray(p) && p.length >= 2)
    .map((p) => [Number(p[0]), Number(p[1])] as [number, number])
    .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]));
}

export function mapLandPlot(plot: LandPlot) {
  return {
    id: plot.id,
    projectId: plot.projectId,
    label: plot.label,
    sortOrder: plot.sortOrder,
    area: plot.area ?? undefined,
    price: plot.price ?? undefined,
    status: plot.status,
    points: parsePoints(plot.points),
  };
}

export function mapApartment(apt: Apartment) {
  const apartmentNumber = apt.apartmentNumber?.trim() || undefined;
  return {
    id: apt.id,
    projectId: apt.projectId,
    buildingId: apt.buildingId ?? undefined,
    landPlotId: apt.landPlotId ?? undefined,
    apartmentNumber,
    floor: apt.floor,
    rooms: apt.rooms,
    area: apt.area,
    landArea: apt.landArea ?? undefined,
    price: apt.price,
    status: apt.status,
    viewType: apt.viewType,
    viewTypeHy: apt.viewTypeHy ?? undefined,
    viewTypeRu: apt.viewTypeRu ?? undefined,
    floorPlanImage: apt.floorPlanImage,
    planPdfUrl: apt.planPdfUrl ?? undefined,
    description: apt.description ?? undefined,
    descriptionHy: apt.descriptionHy ?? undefined,
    descriptionRu: apt.descriptionRu ?? undefined,
    gallery: asArray<string>(apt.gallery),
    balcony: apt.balcony,
  };
}

export function mapProject(project: ProjectWithRelations) {
  const buildings = [...(project.buildings ?? [])].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
  const landPlots = [...(project.landPlots ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
  return {
    id: project.id,
    kind: project.kind === "neighborhood" ? "neighborhood" : "building",
    sitePlanImage: project.sitePlanImage || undefined,
    landPlots: landPlots.map(mapLandPlot),
    title: project.title,
    titleHy: project.titleHy ?? undefined,
    titleRu: project.titleRu ?? undefined,
    slug: project.slug,
    location: project.location,
    locationHy: project.locationHy ?? undefined,
    locationRu: project.locationRu ?? undefined,
    city: project.city,
    cityHy: project.cityHy ?? undefined,
    cityRu: project.cityRu ?? undefined,
    description: project.description,
    descriptionHy: project.descriptionHy ?? undefined,
    descriptionRu: project.descriptionRu ?? undefined,
    longDescription: project.longDescription,
    longDescriptionHy: project.longDescriptionHy ?? undefined,
    longDescriptionRu: project.longDescriptionRu ?? undefined,
    images: asArray<string>(project.images),
    gallery: project.gallery ?? undefined,
    videoUrl: project.videoUrl ?? undefined,
    droneVideos: project.droneVideos ?? undefined,
    startingPrice: project.startingPrice,
    completionDate: project.completionDate,
    completionDateHy: project.completionDateHy ?? undefined,
    completionDateRu: project.completionDateRu ?? undefined,
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
    constructionStartHy: project.constructionStartHy ?? undefined,
    constructionStartRu: project.constructionStartRu ?? undefined,
    exclusiveSalesRights: project.exclusiveSalesRights ?? undefined,
    coordinates: { lat: project.lat, lng: project.lng },
    tags: asArray<string>(project.tags),
    featured: project.featured,
    viewCount: project._count?.views ?? 0,
  };
}
