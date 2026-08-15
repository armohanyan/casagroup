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

const projectInclude = {
  apartments: true,
  buildings: {
    orderBy: [{ sortOrder: "asc" as const }, { name: "asc" as const }],
    include: {
      floors: { orderBy: [{ sortOrder: "asc" as const }, { label: "asc" as const }] },
    },
  },
};

async function attachViewCounts<T extends { id: string }>(projects: T[]) {
  const counts = new Map<string, number>();
  if (projects.length > 0) {
    try {
      const grouped = await prisma.projectView.groupBy({
        by: ["projectId"],
        where: { projectId: { in: projects.map((p) => p.id) } },
        _count: { _all: true },
      });
      for (const row of grouped) {
        counts.set(row.projectId, row._count._all);
      }
    } catch (err) {
      console.error("[views] count failed", err);
    }
  }
  return projects.map((project) => ({
    ...project,
    _count: { views: counts.get(project.id) ?? 0 },
  }));
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

function normalizeHotspots(raw: unknown) {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((h) => {
      if (!h || typeof h !== "object") return null;
      const item = h as Record<string, unknown>;
      const apartmentId = typeof item.apartmentId === "string" ? item.apartmentId : "";
      if (!apartmentId) return null;
      const points = Array.isArray(item.points)
        ? item.points
            .filter((p): p is [number, number] => Array.isArray(p) && p.length >= 2)
            .map((p) => [Number(p[0]), Number(p[1])] as [number, number])
            .filter((p) => Number.isFinite(p[0]) && Number.isFinite(p[1]))
        : [];
      if (points.length < 3) return null;
      return { apartmentId, points };
    })
    .filter((h): h is { apartmentId: string; points: [number, number][] } => h !== null);
}

function floorCreateData(raw: Record<string, unknown>, sortOrder: number) {
  return {
    label: String(raw.label || "").trim() || String(sortOrder + 1),
    sortOrder: raw.sortOrder !== undefined ? Number(raw.sortOrder) : sortOrder,
    imageUrl: String(raw.imageUrl || ""),
    hotspots: normalizeHotspots(raw.hotspots),
  };
}

function aptCreateData(a: Record<string, unknown>) {
  return {
    apartmentNumber: String(a.apartmentNumber || "").trim(),
    floor: Number(a.floor || 1),
    rooms: Number(a.rooms || 1),
    area: Number(a.area || 0),
    price: Number(a.price || 0),
    status: String(a.status || "Available"),
    viewType: String(a.viewType || ""),
    viewTypeHy: (a.viewTypeHy as string) || null,
    floorPlanImage: String(a.floorPlanImage || ""),
    planPdfUrl: (a.planPdfUrl as string) || null,
    description: (a.description as string) || null,
    descriptionHy: (a.descriptionHy as string) || null,
    gallery: parseJsonField(a.gallery, []),
    balcony: Boolean(a.balcony),
    buildingId: typeof a.buildingId === "string" && a.buildingId ? a.buildingId : null,
  };
}

async function syncBuildingFloors(buildingId: string, incoming: Record<string, unknown>[]) {
  const existing = await prisma.buildingFloor.findMany({ where: { buildingId } });
  const keepIds = new Set(
    incoming.map((f) => f.id).filter((x): x is string => typeof x === "string" && x.length > 0),
  );

  for (const old of existing) {
    if (!keepIds.has(old.id)) {
      await prisma.buildingFloor.delete({ where: { id: old.id } });
    }
  }

  for (let i = 0; i < incoming.length; i++) {
    const raw = incoming[i];
    const data = floorCreateData(raw, i);

    if (typeof raw.id === "string" && existing.some((e) => e.id === raw.id)) {
      await prisma.buildingFloor.update({ where: { id: raw.id }, data });
    } else {
      await prisma.buildingFloor.create({
        data: {
          buildingId,
          ...(typeof raw.id === "string" && raw.id ? { id: raw.id } : {}),
          ...data,
        },
      });
    }
  }
}

async function syncBuildings(projectId: string, incoming: Record<string, unknown>[]) {
  const existing = await prisma.building.findMany({ where: { projectId } });
  const keepIds = new Set(
    incoming.map((b) => b.id).filter((x): x is string => typeof x === "string" && x.length > 0)
  );

  for (const old of existing) {
    if (!keepIds.has(old.id)) {
      await prisma.building.delete({ where: { id: old.id } });
    }
  }

  const idMap = new Map<string, string>();

  for (let i = 0; i < incoming.length; i++) {
    const raw = incoming[i];
    const name = String(raw.name || "").trim();
    if (!name) continue;

    const data = {
      name,
      sortOrder: raw.sortOrder !== undefined ? Number(raw.sortOrder) : i,
    };

    let buildingId: string;
    if (typeof raw.id === "string" && existing.some((e) => e.id === raw.id)) {
      await prisma.building.update({ where: { id: raw.id }, data });
      buildingId = raw.id;
      idMap.set(raw.id, raw.id);
    } else {
      const created = await prisma.building.create({
        data: {
          projectId,
          ...(typeof raw.id === "string" && raw.id ? { id: raw.id } : {}),
          ...data,
        },
      });
      buildingId = created.id;
      if (typeof raw.id === "string" && raw.id) {
        idMap.set(raw.id, created.id);
      }
      idMap.set(created.id, created.id);
    }

    if (Array.isArray(raw.floors)) {
      await syncBuildingFloors(buildingId, raw.floors as Record<string, unknown>[]);
    }
  }

  return idMap;
}

export async function listProjects(filters: ProjectFilters = {}) {
  const where: Record<string, unknown> = {};
  if (filters.city) where.city = filters.city;
  if (filters.status) where.status = filters.status;
  if (filters.featured !== undefined) where.featured = filters.featured;
  if (filters.maxPrice !== undefined) where.startingPrice = { lte: filters.maxPrice };

  let projects = await prisma.project.findMany({
    where,
    include: projectInclude,
    orderBy: [{ featured: "desc" }, { updatedAt: "desc" }],
  });

  if (filters.rooms !== undefined) {
    projects = projects.filter((p) => p.apartments.some((a) => a.rooms === filters.rooms));
  }

  return (await attachViewCounts(projects)).map(mapProject);
}

export async function getProjectBySlug(slug: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: projectInclude,
  });
  if (!project) throw httpError(404, "Project not found");
  const [withViews] = await attachViewCounts([project]);
  return mapProject(withViews);
}

export async function getApartmentByProjectSlug(slug: string, apartmentId: string) {
  const project = await prisma.project.findUnique({
    where: { slug },
    include: projectInclude,
  });
  if (!project) throw httpError(404, "Project not found");
  const apt = project.apartments.find((a) => a.id === apartmentId);
  if (!apt) throw httpError(404, "Apartment not found");
  const [withViews] = await attachViewCounts([project]);
  return { project: mapProject(withViews), apartment: mapApartment(apt) };
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
  const buildings = Array.isArray(input.buildings) ? (input.buildings as Record<string, unknown>[]) : [];
  const apartments = Array.isArray(input.apartments) ? (input.apartments as Record<string, unknown>[]) : [];

  const project = await prisma.project.create({
    data: {
      title,
      titleHy: (input.titleHy as string) || null,
      slug,
      location: String(input.location || ""),
      locationHy: (input.locationHy as string) || null,
      city: String(input.city || ""),
      cityHy: (input.cityHy as string) || null,
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
      buildings: {
        create: buildings
          .map((raw, i) => {
            const name = String(raw.name || "").trim();
            if (!name) return null;
            const floors = Array.isArray(raw.floors) ? (raw.floors as Record<string, unknown>[]) : [];
            return {
              ...(typeof raw.id === "string" && raw.id ? { id: raw.id } : {}),
              name,
              sortOrder: raw.sortOrder !== undefined ? Number(raw.sortOrder) : i,
              floors: {
                create: floors.map((f, fi) => ({
                  ...(typeof f.id === "string" && f.id ? { id: f.id } : {}),
                  ...floorCreateData(f, fi),
                })),
              },
            };
          })
          .filter((b): b is NonNullable<typeof b> => b !== null),
      },
      apartments: {
        create: apartments.map((raw) => {
          const a = raw as Record<string, unknown>;
          return {
            ...(typeof a.id === "string" && a.id ? { id: a.id } : {}),
            ...aptCreateData(a),
          };
        }),
      },
    },
    include: projectInclude,
  });

  const [createdWithViews] = await attachViewCounts([project]);
  return mapProject(createdWithViews);
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
  assign("titleHy", input.titleHy !== undefined ? input.titleHy || null : undefined);
  assign("slug", input.slug !== undefined || input.title !== undefined ? slug : undefined);
  assign("location", input.location !== undefined ? String(input.location) : undefined);
  assign("locationHy", input.locationHy !== undefined ? input.locationHy || null : undefined);
  assign("city", input.city !== undefined ? String(input.city) : undefined);
  assign("cityHy", input.cityHy !== undefined ? input.cityHy || null : undefined);
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

  await prisma.project.update({
    where: { id },
    data,
  });

  if (Array.isArray(input.buildings)) {
    await syncBuildings(id, input.buildings as Record<string, unknown>[]);
  }

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
      const aptData = aptCreateData(raw);

      if (typeof raw.id === "string" && existingApts.some((e) => e.id === raw.id)) {
        await prisma.apartment.update({ where: { id: raw.id }, data: aptData });
      } else {
        await prisma.apartment.create({
          data: {
            projectId: id,
            ...(typeof raw.id === "string" && raw.id ? { id: raw.id } : {}),
            ...aptData,
          },
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
  }

  return getProjectById(id);
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
    include: projectInclude,
  });
  if (!project) throw httpError(404, "Project not found");
  const [withViews] = await attachViewCounts([project]);
  return mapProject(withViews);
}

export async function createApartment(projectId: string, input: Record<string, unknown>) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) throw httpError(404, "Project not found");

  const apt = await prisma.apartment.create({
    data: {
      projectId,
      ...aptCreateData(input),
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
  if (input.apartmentNumber !== undefined) data.apartmentNumber = String(input.apartmentNumber || "").trim();
  if (input.floor !== undefined) data.floor = Number(input.floor);
  if (input.rooms !== undefined) data.rooms = Number(input.rooms);
  if (input.area !== undefined) data.area = Number(input.area);
  if (input.price !== undefined) data.price = Number(input.price);
  if (input.status !== undefined) data.status = String(input.status);
  if (input.viewType !== undefined) data.viewType = String(input.viewType);
  if (input.viewTypeHy !== undefined) data.viewTypeHy = input.viewTypeHy ? String(input.viewTypeHy) : null;
  if (input.floorPlanImage !== undefined) data.floorPlanImage = String(input.floorPlanImage);
  if (input.planPdfUrl !== undefined) data.planPdfUrl = input.planPdfUrl ? String(input.planPdfUrl) : null;
  if (input.description !== undefined) data.description = input.description ? String(input.description) : null;
  if (input.descriptionHy !== undefined) data.descriptionHy = input.descriptionHy ? String(input.descriptionHy) : null;
  if (input.gallery !== undefined) data.gallery = parseJsonField(input.gallery, []);
  if (input.balcony !== undefined) data.balcony = Boolean(input.balcony);
  if (input.buildingId !== undefined) {
    data.buildingId = typeof input.buildingId === "string" && input.buildingId ? input.buildingId : null;
  }

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
