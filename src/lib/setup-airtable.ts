import Airtable from "airtable";
import { MOCK_PROJECTS } from "@/data/mock";
import {
  buildFieldSpecMap,
  escapeFormulaString,
  inferProjectFields,
  projectToAirtableFields,
} from "@/src/lib/airtable-project-schema";
import {
  PROJECTS_TABLE_NAME,
  createField,
  createTable,
  findTableInsensitive,
  getAirtableBase,
  listTables,
  patchMetaView,
  tableHasField,
  type MetaTable,
} from "@/src/lib/airtable";

/** Preferred column order for the Projects grid view (remaining fields append). */
const GRID_COLUMN_PRIORITY: readonly string[] = [
  "title",
  "slug",
  "id",
  "featured",
  "status",
  "city",
  "location",
  "startingPrice",
  "completionDate",
  "developer",
  "architect",
  "availableApartmentsCount",
  "totalApartments",
  "floors",
  "tags",
  "description",
  "longDescription",
  "videoUrl",
  "images",
  "droneVideos",
  "amenities",
  "nearbyPlaces",
  "paymentOptions",
  "apartments",
  "coordinates",
];

async function syncProjectsGridView(apiKey: string, baseId: string, logs: string[]): Promise<void> {
  try {
    const tables = await listTables(apiKey, baseId, new URLSearchParams({ include: "visibleFieldIds" }).toString());
    const t = findTableInsensitive(tables, PROJECTS_TABLE_NAME);
    if (!t?.views?.length) {
      logs.push("No views on Projects table — grid column sync skipped");
      console.log(`[setup-airtable] ${logs[logs.length - 1]}`);
      return;
    }
    const grid = t.views.find((v) => v.type === "grid");
    if (!grid?.id) {
      logs.push("No grid view found — grid column sync skipped");
      console.log(`[setup-airtable] ${logs[logs.length - 1]}`);
      return;
    }
    const byLower = new Map(t.fields.map((f) => [f.name.toLowerCase(), f]));
    const orderedNames: string[] = [];
    for (const name of GRID_COLUMN_PRIORITY) {
      const f = byLower.get(name.toLowerCase());
      if (f) orderedNames.push(f.name);
    }
    for (const f of t.fields) {
      if (!orderedNames.some((n) => n.toLowerCase() === f.name.toLowerCase())) orderedNames.push(f.name);
    }
    const visibleFieldIds = orderedNames.map((n) => byLower.get(n.toLowerCase())!.id);
    await patchMetaView(apiKey, baseId, grid.id, { visibleFieldIds });
    logs.push(`Grid view "${grid.name}" updated (${visibleFieldIds.length} visible columns)`);
    console.log(`[setup-airtable] ${logs[logs.length - 1]}`);
  } catch (e) {
    const m = e instanceof Error ? e.message : String(e);
    logs.push(`Grid view update skipped: ${m}`);
    console.warn(`[setup-airtable] ${logs[logs.length - 1]}`);
  }
}

export type SetupAirtableResult = {
  ok: true;
  table: string;
  tableId: string;
  createdTable: boolean;
  createdFields: string[];
  seeded: string[];
  skippedSeed: string[];
  logs: string[];
};

export async function runAirtableSetup(): Promise<SetupAirtableResult> {
  const logs: string[] = [];
  const { base, apiKey, baseId } = getAirtableBase();
  const inferred = inferProjectFields(MOCK_PROJECTS);
  const specByName = buildFieldSpecMap(inferred);

  const createdFields: string[] = [];
  let createdTable = false;
  let table: MetaTable;

  const tables = await listTables(apiKey, baseId);
  const existing = findTableInsensitive(tables, PROJECTS_TABLE_NAME);

  if (!existing) {
    logs.push(`Creating table "${PROJECTS_TABLE_NAME}" with ${inferred.length} fields`);
    console.log(logs[logs.length - 1]);
    table = await createTable(apiKey, baseId, PROJECTS_TABLE_NAME, inferred);
    createdTable = true;
    for (const f of table.fields) {
      logs.push(`Table field: ${f.name} (${f.type})`);
      console.log(`[setup-airtable] table field: ${f.name} (${f.type})`);
    }
  } else {
    table = existing;
    logs.push(`Table "${table.name}" already exists (${table.id})`);
    console.log(logs[logs.length - 1]);

    for (const field of inferred) {
      if (tableHasField(table, field.name)) continue;
      logs.push(`Creating missing field: ${field.name} (${field.type})`);
      console.log(logs[logs.length - 1]);
      const created = await createField(apiKey, baseId, table.id, field);
      createdFields.push(field.name);
      table = { ...table, fields: [...table.fields, created] };
    }
  }

  const seeded: string[] = [];
  const skippedSeed: string[] = [];

  for (const project of MOCK_PROJECTS) {
    const formula = `{slug}='${escapeFormulaString(project.slug)}'`;
    const existingRows = await base(table.name)
      .select({ filterByFormula: formula, maxRecords: 1 })
      .firstPage();

    if (existingRows.length > 0) {
      skippedSeed.push(project.slug);
      logs.push(`Seed skip (exists): ${project.slug}`);
      console.log(logs[logs.length - 1]);
      continue;
    }

    const fields = projectToAirtableFields(project, specByName);
    await base(table.name).create(fields as Airtable.FieldSet, { typecast: true });
    seeded.push(project.slug);
    logs.push(`Seeded project: ${project.slug}`);
    console.log(logs[logs.length - 1]);
  }

  await syncProjectsGridView(apiKey, baseId, logs);

  return {
    ok: true,
    table: table.name,
    tableId: table.id,
    createdTable,
    createdFields,
    seeded,
    skippedSeed,
    logs,
  };
}
