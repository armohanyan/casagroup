import { Prisma } from "@prisma/client";
import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";
import { slugify } from "../utils/slug.js";
import { mapApartment, mapProject } from "./mappers.js";

export interface ProjectFilters {
  city?: string;
  status?: string;
  maxPrice?: number;
  rooms?: number;
  featured?: boolean;
}

function parseJsonField<T>(value: unknown, fallback: T): T {
  if (value === undefined || value === null) return fallback;
  return value as T;
}

function jsonOrNull(value: unknown): Prisma.InputJsonValue | typeof Prisma.JsonNull | undefined {
  if (value === undefined) return undefined;
  if (value === null) return Prisma.JsonNull;
  return value as Prisma.InputJsonValue;
}

export async function listProjects(filters: ProjectFilters = {}) {
  const where: Record<string, unknown> = {};
  if (filters.city) where.city = filters.city;
  if (filters.status) where.status = filters.status;
  if (filters.featured !== undefined) where.featured = filters.featured;
  if (filters.maxPrice !== undefined) where.startingPrice = { lte: filters.maxPrice };

  let projects = await prisma.project.findMany({
    where,
    include: { apartments: true },
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  if (filters.rooms !== undefined) {
    projects = projects.filter((p) => p.apartments.some((a) => a.rooms === filters.rooms));
  }

  return projects.map(mapProject);
}

export async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { apartments: true },
  });
  if (!project) throw httpError(404, "Project not found");
  return mapProject(project);
}

export async function getApartmentByProjectSlug(slug: string, apartmentId: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: { apartments: true },
  });
  if (!project) throw httpError(404, "Project not found");
  const apt = project.apartments.find((a) => a.id === apartmentId);
  if (!apt) throw httpError(404, "Apartment not found");
  return { project: mapProject(project), apartment: mapApartment(apt) };
}

async function uniqueSlug(base: string, excludeId?: string) {
  let slug = slugify(base);
  let i = 0;
  while (true) {
    const existing = await prisma.project.findUnique({ where: { slug } });
    if (!existing || existing.id === excludeId) return slug;
    i += 1;
    slug = `${slugify(base)}-${i}`;
  }
}

export async function createProject(input: Record<string, unknown>) {
  const title = String(input.title || "");
  const slug = await uniqueSlug(String(input.slug || title));
  const coords = (input.coordinates as { lat?: number; lng?: number }) || {};
  const apartments = Array.isArray(input.apartments) ? input.apartments : [];

  const project = await prisma.project.create({
    data: {
      title,
      slug,
      location: String(input.location || ""),
      city: String(input.city || ""),
      description: String(input.description || ""),
      descriptionHy: (input.descriptionHy as string) || null,
      longDescription: String(input.longDescription || ""),
      longDescriptionHy: (input.longDescriptionHy as string) || null,
      images: parseJsonField(input.images, []),
      gallery: jsonOrNull(input.gallery ?? null) ?? Prisma.JsonNull,
      videoUrl: (input.videoUrl as string) || null,
      droneVideos: jsonOrNull(input.droneVideos ?? null) ?? Prisma.JsonNull,
      startingPrice: Number(input.startingPrice || 0),
      completionDate: String(input.completionDate || ""),
      status: String(input.status || "Under Construction"),
      availableApartmentsCount: Number(input.availableApartmentsCount || apartments.length || 0),
      totalApartments: Number(input.totalApartments || apartments.length || 0),
      floors: Number(input.floors || 0),
      amenities: parseJsonField(input.amenities, []),
      nearbyPlaces: parseJsonField(input.nearbyPlaces, []),
      paymentOptions: parseJsonField(input.paymentOptions, []),
      developer: String(input.developer || "CasaGroup"),
      architect: (input.architect as string) || null,
      managementCompany: (input.managementCompany as string) || null,
      partnerBank: (input.partnerBank as string) || null,
      constructionStart: (input.constructionStart as string) || null,
      exclusiveSalesRights: (input.exclusiveSalesRights as string) || null,
      lat: Number(coords.lat ?? 40.1872),
      lng: Number(coords.lng ?? 44.5152),
      tags: parseJsonField(input.tags, []),
      featured: Boolean(input.featured),
      apartments: {
        create: apartments.map((raw) => {
          const a = raw as Record<string, unknown>;
          return {
            ...(typeof a.id === "string" && a.id ? { id: a.id } : {}),
            floor: Number(a.floor || 1),
            rooms: Number(a.rooms || 1),
            area: Number(a.area || 0),
            price: Number(a.price || 0),
            status: String(a.status || "Available"),
            viewType: String(a.viewType || ""),
            floorPlanImage: String(a.floorPlanImage || ""),
            gallery: parseJsonField(a.gallery, []),
            balcony: Boolean(a.balcony),
          };
        }),
      },
    },
    include: { apartments: true },
  });

  return mapProject(project);
}

export async function updateProject(id: string, input: Record<string, unknown>) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Project not found");

  const coords = (input.coordinates as { lat?: number; lng?: number }) || {};
  const slug =
    input.slug || input.title
      ? await uniqueSlug(String(input.slug || input.title || existing.title), id)
      : existing.slug;

  const data: Record<string, unknown> = {};
  const assign = (key: string, value: unknown) => {
    if (value !== undefined) data[key] = value;
  };

  assign("title", input.title !== undefined ? String(input.title) : undefined);
  assign("slug", input.slug !== undefined || input.title !== undefined ? slug : undefined);
  assign("location", input.location !== undefined ? String(input.location) : undefined);
  assign("city", input.city !== undefined ? String(input.city) : undefined);
  assign("description", input.description !== undefined ? String(input.description) : undefined);
  assign("descriptionHy", input.descriptionHy !== undefined ? input.descriptionHy || null : undefined);
  assign("longDescription", input.longDescription !== undefined ? String(input.longDescription) : undefined);
  assign("longDescriptionHy", input.longDescriptionHy !== undefined ? input.longDescriptionHy || null : undefined);
  assign("images", input.images !== undefined ? parseJsonField(input.images, []) : undefined);
  assign("gallery", input.gallery !== undefined ? jsonOrNull(input.gallery) : undefined);
  assign("videoUrl", input.videoUrl !== undefined ? input.videoUrl || null : undefined);
  assign("droneVideos", input.droneVideos !== undefined ? jsonOrNull(input.droneVideos) : undefined);
  assign("startingPrice", input.startingPrice !== undefined ? Number(input.startingPrice) : undefined);
  assign("completionDate", input.completionDate !== undefined ? String(input.completionDate) : undefined);
  assign("status", input.status !== undefined ? String(input.status) : undefined);
  assign(
    "availableApartmentsCount",
    input.availableApartmentsCount !== undefined ? Number(input.availableApartmentsCount) : undefined
  );
  assign("totalApartments", input.totalApartments !== undefined ? Number(input.totalApartments) : undefined);
  assign("floors", input.floors !== undefined ? Number(input.floors) : undefined);
  assign("amenities", input.amenities !== undefined ? parseJsonField(input.amenities, []) : undefined);
  assign("nearbyPlaces", input.nearbyPlaces !== undefined ? parseJsonField(input.nearbyPlaces, []) : undefined);
  assign("paymentOptions", input.paymentOptions !== undefined ? parseJsonField(input.paymentOptions, []) : undefined);
  assign("developer", input.developer !== undefined ? String(input.developer) : undefined);
  assign("architect", input.architect !== undefined ? input.architect || null : undefined);
  assign("managementCompany", input.managementCompany !== undefined ? input.managementCompany || null : undefined);
  assign("partnerBank", input.partnerBank !== undefined ? input.partnerBank || null : undefined);
  assign("constructionStart", input.constructionStart !== undefined ? input.constructionStart || null : undefined);
  assign("exclusiveSalesRights", input.exclusiveSalesRights !== undefined ? input.exclusiveSalesRights || null : undefined);
  assign("lat", input.coordinates !== undefined ? Number(coords.lat ?? existing.lat) : undefined);
  assign("lng", input.coordinates !== undefined ? Number(coords.lng ?? existing.lng) : undefined);
  assign("tags", input.tags !== undefined ? parseJsonField(input.tags, []) : undefined);
  assign("featured", input.featured !== undefined ? Boolean(input.featured) : undefined);

  const project = await prisma.project.update({
    where: { id },
    data,
    include: { apartments: true },
  });

  if (Array.isArray(input.apartments)) {
    const incoming = input.apartments as Record<string, unknown>[];
    const existingApts = await prisma.apartment.findMany({ where: { projectId: id } });
    const keepIds = new Set(
      incoming.map((a) => a.id).filter((x): x is string => typeof x === "string" && x.length > 0)
    );

    for (const old of existingApts) {
      if (!keepIds.has(old.id)) {
        await prisma.apartment.delete({ where: { id: old.id } });
      }
    }

    for (const raw of incoming) {
      const aptData = {
        floor: Number(raw.floor || 1),
        rooms: Number(raw.rooms || 1),
        area: Number(raw.area || 0),
        price: Number(raw.price || 0),
        status: String(raw.status || "Available"),
        viewType: String(raw.viewType || ""),
        floorPlanImage: String(raw.floorPlanImage || ""),
        gallery: parseJsonField(raw.gallery, []),
        balcony: Boolean(raw.balcony),
      };

      if (typeof raw.id === "string" && existingApts.some((e) => e.id === raw.id)) {
        await prisma.apartment.update({ where: { id: raw.id }, data: aptData });
      } else {
        await prisma.apartment.create({
          data: { projectId: id, ...aptData },
        });
      }
    }

    const available = await prisma.apartment.count({
      where: { projectId: id, status: "Available" },
    });
    const total = await prisma.apartment.count({ where: { projectId: id } });
    await prisma.project.update({
      where: { id },
      data: {
        availableApartmentsCount:
          input.availableApartmentsCount !== undefined
            ? Number(input.availableApartmentsCount)
            : available,
        totalApartments:
          input.totalApartments !== undefined ? Number(input.totalApartments) : total,
      },
    });

    return getProjectById(id);
  }

  return mapProject(project);
}

export async function deleteProject(id: string) {
  const existing = await prisma.project.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Project not found");
  await prisma.project.delete({ where: { id } });
  return { ok: true };
}

export async function getProjectById(id: string) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: { apartments: true },
  });
  if (!project) throw httpError(404, "Project not found");
  return mapProject(project);
}

export async function createApartment(projectId: string, input: Record<string, unknown>) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw httpError(404, "Project not found");

  const apt = await prisma.apartment.create({
    data: {
      projectId,
      floor: Number(input.floor || 1),
      rooms: Number(input.rooms || 1),
      area: Number(input.area || 0),
      price: Number(input.price || 0),
      status: String(input.status || "Available"),
      viewType: String(input.viewType || ""),
      floorPlanImage: String(input.floorPlanImage || ""),
      gallery: parseJsonField(input.gallery, []),
      balcony: Boolean(input.balcony),
    },
  });

  await prisma.project.update({
    where: { id: projectId },
    data: {
      totalApartments: { increment: 1 },
      availableApartmentsCount:
        apt.status === "Available" ? { increment: 1 } : undefined,
    },
  });

  return mapApartment(apt);
}

export async function updateApartment(projectId: string, aptId: string, input: Record<string, unknown>) {
  const existing = await prisma.apartment.findFirst({ where: { id: aptId, projectId } });
  if (!existing) throw httpError(404, "Apartment not found");

  const data: Record<string, unknown> = {};
  if (input.floor !== undefined) data.floor = Number(input.floor);
  if (input.rooms !== undefined) data.rooms = Number(input.rooms);
  if (input.area !== undefined) data.area = Number(input.area);
  if (input.price !== undefined) data.price = Number(input.price);
  if (input.status !== undefined) data.status = String(input.status);
  if (input.viewType !== undefined) data.viewType = String(input.viewType);
  if (input.floorPlanImage !== undefined) data.floorPlanImage = String(input.floorPlanImage);
  if (input.gallery !== undefined) data.gallery = parseJsonField(input.gallery, []);
  if (input.balcony !== undefined) data.balcony = Boolean(input.balcony);

  const apt = await prisma.apartment.update({ where: { id: aptId }, data });

  const available = await prisma.apartment.count({
    where: { projectId, status: "Available" },
  });
  const total = await prisma.apartment.count({ where: { projectId } });
  await prisma.project.update({
    where: { id: projectId },
    data: { availableApartmentsCount: available, totalApartments: total },
  });

  return mapApartment(apt);
}

export async function deleteApartment(projectId: string, aptId: string) {
  const existing = await prisma.apartment.findFirst({ where: { id: aptId, projectId } });
  if (!existing) throw httpError(404, "Apartment not found");
  await prisma.apartment.delete({ where: { id: aptId } });

  const available = await prisma.apartment.count({
    where: { projectId, status: "Available" },
  });
  const total = await prisma.apartment.count({ where: { projectId } });
  await prisma.project.update({
    where: { id: projectId },
    data: { availableApartmentsCount: available, totalApartments: total },
  });

  return { ok: true };
}
