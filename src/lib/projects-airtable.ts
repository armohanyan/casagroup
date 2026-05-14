import Airtable from "airtable";
import type { Project } from "@/types";
import { MOCK_PROJECTS } from "@/data/mock";
import { generateId, generateSlug } from "@/lib/store";
import {
  airtableFieldsToProject,
  defaultProjectFieldSpecs,
  escapeFormulaString,
  projectToAirtableFields,
} from "@/src/lib/airtable-project-schema";
import { getAirtableBase, isAirtableConfigured, PROJECTS_TABLE_NAME } from "@/src/lib/airtable";

export { isAirtableConfigured };

/** Coerce numbers, align apartment `projectId`, trim URLs so Airtable accepts the payload. */
function normalizeProjectForAirtable(p: Project): Project {
  const n = (v: unknown, fallback: number) =>
    typeof v === "number" && !Number.isNaN(v) ? v : fallback;

  return {
    ...p,
    startingPrice: n(p.startingPrice, 0),
    floors: n(p.floors, 0),
    totalApartments: n(p.totalApartments, 0),
    availableApartmentsCount: n(p.availableApartmentsCount, 0),
    videoUrl: p.videoUrl?.trim() ? p.videoUrl.trim() : undefined,
    architect: p.architect?.trim() ? p.architect.trim() : undefined,
    apartments: p.apartments.map((a) => ({
      ...a,
      projectId: p.id,
      floor: n(a.floor, 1),
      rooms: n(a.rooms, 1),
      area: n(a.area, 0),
      price: n(a.price, 0),
      floorPlanImage: a.floorPlanImage?.trim() ?? "",
      gallery: (a.gallery ?? []).map((u) => String(u).trim()).filter(Boolean),
    })),
    droneVideos: (p.droneVideos ?? [])
      .map((d) => ({
        title: d.title?.trim() ?? "",
        url: d.url?.trim() ?? "",
        thumbnail: d.thumbnail?.trim() || undefined,
      }))
      .filter((d) => d.url.length > 0),
    images: (p.images ?? []).map((u) => String(u).trim()).filter(Boolean),
    tags: (p.tags ?? []).map((t) => String(t).trim()).filter(Boolean),
  };
}

export async function listProjectsFromAirtable(): Promise<Project[]> {
  const { base } = getAirtableBase();
  const records = await base(PROJECTS_TABLE_NAME).select({ pageSize: 100 }).all();
  return records.map((r) => airtableFieldsToProject(r.fields as Record<string, unknown>));
}

export async function getProjectsForSite(): Promise<Project[]> {
  if (!isAirtableConfigured()) return MOCK_PROJECTS;
  return listProjectsFromAirtable();
}

async function findRecordIdByAppId(appId: string): Promise<string | null> {
  const { base } = getAirtableBase();
  const rows = await base(PROJECTS_TABLE_NAME)
    .select({
      filterByFormula: `{id}='${escapeFormulaString(appId)}'`,
      maxRecords: 1,
    })
    .firstPage();
  return rows[0]?.id ?? null;
}

async function getProjectByAppId(appId: string): Promise<Project | null> {
  const rid = await findRecordIdByAppId(appId);
  if (!rid) return null;
  const { base } = getAirtableBase();
  const rec = await base(PROJECTS_TABLE_NAME).find(rid);
  return airtableFieldsToProject(rec.fields as Record<string, unknown>);
}

export async function createProjectOnAirtable(data: Omit<Project, "id" | "slug">): Promise<Project> {
  const { base } = getAirtableBase();
  const id = generateId();
  const slug = generateSlug(data.title) || id;
  const project = normalizeProjectForAirtable({ ...data, id, slug });
  const specs = defaultProjectFieldSpecs();
  const fields = projectToAirtableFields(project, specs);
  await base(PROJECTS_TABLE_NAME).create(fields as Airtable.FieldSet, { typecast: true });
  return project;
}

export async function updateProjectOnAirtable(appId: string, patch: Partial<Project>): Promise<Project> {
  const rid = await findRecordIdByAppId(appId);
  if (!rid) throw new Error("Project not found");

  const current = await getProjectByAppId(appId);
  if (!current) throw new Error("Project not found");

  const merged = normalizeProjectForAirtable({
    ...current,
    ...patch,
    id: appId,
    slug: patch.title ? generateSlug(patch.title) || current.slug : current.slug,
  });

  const specs = defaultProjectFieldSpecs();
  const fields = projectToAirtableFields(merged, specs);
  const { base } = getAirtableBase();
  await base(PROJECTS_TABLE_NAME).update(rid, fields as Airtable.FieldSet, { typecast: true });
  return merged;
}

export async function deleteProjectOnAirtable(appId: string): Promise<void> {
  const rid = await findRecordIdByAppId(appId);
  if (!rid) throw new Error("Project not found");
  const { base } = getAirtableBase();
  await base(PROJECTS_TABLE_NAME).destroy(rid);
}
