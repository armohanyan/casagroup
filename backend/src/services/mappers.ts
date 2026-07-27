import type { Apartment, Project } from "@prisma/client";

type ProjectWithApartments = Project & { apartments?: Apartment[] };

function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}

export function mapApartment(apt: Apartment) {
  return {
    id: apt.id,
    projectId: apt.projectId,
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

export function mapProject(project: ProjectWithApartments) {
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
