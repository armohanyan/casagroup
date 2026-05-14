import type { Project, ProjectStatus } from "@/types";
import { emptyProject } from "@/lib/store";
import { MOCK_PROJECTS } from "@/data/mock";

/** Stays aligned with `Project["status"]` — used for singleSelect options. */
export const PROJECT_STATUS_OPTIONS: readonly ProjectStatus[] = [
  "Under Construction",
  "Ready",
  "Sold Out",
] as const;

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/;

/** Keys that exist on `Project` but may be absent from `emptyProject()` / mocks. */
const EXTRA_PROJECT_KEYS: (keyof Project)[] = ["videoUrl"];

/** Stored as JSON strings in multilineText (plus `coordinates`). */
const JSON_IN_MULTILINE: (keyof Project)[] = [
  "images",
  "droneVideos",
  "amenities",
  "nearbyPlaces",
  "paymentOptions",
  "apartments",
  "coordinates",
];

export type FieldCreatePayload = {
  name: string;
  type: string;
  options?: Record<string, unknown>;
};

function projectTemplate(): Project {
  return { id: "", slug: "", ...emptyProject() };
}

function allProjectKeys(projects: readonly Project[]): (keyof Project)[] {
  const keys = new Set<string>();
  for (const k of Object.keys(projectTemplate())) keys.add(k);
  for (const k of EXTRA_PROJECT_KEYS) keys.add(k);
  for (const p of projects) {
    for (const k of Object.keys(p)) keys.add(k);
  }
  return [...keys] as (keyof Project)[];
}

function sampleValuesForKey(projects: readonly Project[], key: keyof Project): unknown[] {
  const rows: Project[] = [projectTemplate(), ...projects];
  return rows.map((p) => p[key]);
}

/**
 * Maps runtime `Project` values to Airtable field definitions.
 * Arrays of structured data use multilineText + JSON.
 * `tags` uses multipleSelects with choices unioned from sample data.
 */
export function inferProjectFields(projects: readonly Project[]): FieldCreatePayload[] {
  const keys = allProjectKeys(projects);
  const inferred: FieldCreatePayload[] = [];
  for (const key of keys) {
    inferred.push(inferField(key, sampleValuesForKey(projects, key)));
  }
  return sortFieldsForPrimaryTitle(inferred);
}

function sortFieldsForPrimaryTitle(fields: FieldCreatePayload[]): FieldCreatePayload[] {
  const title = fields.find((f) => f.name === "title");
  const rest = fields.filter((f) => f.name !== "title");
  return title ? [title, ...rest] : fields;
}

function inferField(key: keyof Project, values: unknown[]): FieldCreatePayload {
  const compact = values.filter((v) => v !== undefined);

  if (key === "status") {
    return {
      name: key,
      type: "singleSelect",
      options: { choices: PROJECT_STATUS_OPTIONS.map((name) => ({ name })) },
    };
  }

  if (key === "tags") {
    const set = new Set<string>();
    for (const v of values) {
      if (!Array.isArray(v)) continue;
      for (const t of v) {
        if (typeof t === "string" && t.length > 0) set.add(t);
      }
    }
    const choices = [...set].sort().map((name) => ({ name }));
    if (choices.length === 0) choices.push({ name: "tag" });
    return { name: key, type: "multipleSelects", options: { choices } };
  }

  if (key === "coordinates") {
    return { name: key, type: "multilineText" };
  }

  const allBool = compact.length > 0 && compact.every((v) => typeof v === "boolean");
  if (allBool) {
    return {
      name: key,
      type: "checkbox",
      options: { color: "greenBright", icon: "check" },
    };
  }

  const allNum = compact.length > 0 && compact.every((v) => typeof v === "number");
  if (allNum) {
    const decimals = (compact as number[]).some((n) => !Number.isInteger(n));
    return { name: key, type: "number", options: { precision: decimals ? 2 : 0 } };
  }

  const allArrays = compact.length > 0 && compact.every((v) => Array.isArray(v));
  if (allArrays) {
    return { name: key, type: "multilineText" };
  }

  const allStr = compact.length > 0 && compact.every((v) => typeof v === "string");
  if (allStr) {
    const strs = compact as string[];
    if (key === "videoUrl" || (typeof key === "string" && key.endsWith("Url"))) {
      return { name: key, type: "url" };
    }
    if (key === "longDescription" || key === "description") {
      return { name: key, type: "multilineText" };
    }
    const maxLen = Math.max(...strs.map((s) => s.length), 0);
    if (maxLen > 280) {
      return { name: key, type: "multilineText" };
    }
    if (key === "completionDate") {
      const iso = strs.every((s) => s.length === 0 || ISO_DATE.test(s));
      if (iso && strs.some((s) => s.length > 0)) {
        return {
          name: key,
          type: "date",
          options: { dateFormat: { name: "iso", format: "YYYY-MM-DD" } },
        };
      }
      return { name: key, type: "singleLineText" };
    }
    const iso = strs.every((s) => s.length === 0 || ISO_DATE.test(s));
    if (iso && strs.some((s) => s.length > 0)) {
      return {
        name: key,
        type: "date",
        options: { dateFormat: { name: "iso", format: "YYYY-MM-DD" } },
      };
    }
    return { name: key, type: "singleLineText" };
  }

  if (compact.length === 0) {
    if (key === "videoUrl") return { name: key, type: "url" };
    return { name: key, type: "singleLineText" };
  }

  return { name: key, type: "singleLineText" };
}

export function buildFieldSpecMap(fields: FieldCreatePayload[]): Map<string, FieldCreatePayload> {
  return new Map(fields.map((f) => [f.name, f]));
}

/** Default field specs used for read/write when shape matches seeded schema. */
export function defaultProjectFieldSpecs(): Map<string, FieldCreatePayload> {
  return buildFieldSpecMap(inferProjectFields(MOCK_PROJECTS));
}

function fieldPayloadToJsonValue(_key: keyof Project, v: unknown, spec: FieldCreatePayload): unknown {
  if (v === undefined) return undefined;
  if (spec.type === "multilineText") {
    if (typeof v === "string") return v;
    return JSON.stringify(v);
  }
  if (spec.type === "multipleSelects" && Array.isArray(v)) {
    return v.filter((x): x is string => typeof x === "string");
  }
  return v;
}

export function projectToAirtableFields(
  p: Project,
  specByName: Map<string, FieldCreatePayload>
): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const key of Object.keys(p) as (keyof Project)[]) {
    const spec = specByName.get(key);
    if (!spec) continue;
    const v = p[key];
    const mapped = fieldPayloadToJsonValue(key, v, spec);
    if (mapped === undefined) continue;
    if (spec.type === "url" && (mapped === "" || mapped === null)) continue;
    out[key] = mapped;
  }
  return out;
}

export function escapeFormulaString(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/'/g, "\\'");
}

function isProjectStatus(v: string): v is ProjectStatus {
  return (PROJECT_STATUS_OPTIONS as readonly string[]).includes(v);
}

function parseJsonField<T>(key: keyof Project, raw: unknown, fallback: T): T {
  if (raw == null || raw === "") return fallback;
  if (typeof raw === "object") return raw as T;
  if (typeof raw === "string") {
    if (!JSON_IN_MULTILINE.includes(key)) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** Converts one Airtable record `fields` object into a `Project`. */
export function airtableFieldsToProject(fields: Record<string, unknown>): Project {
  const t = projectTemplate();
  const str = (k: keyof Project): string => {
    const v = fields[k as string];
    if (typeof v === "string") return v;
    if (typeof v === "number" && !Number.isNaN(v)) return String(v);
    return "";
  };
  const num = (k: keyof Project): number => {
    const v = fields[k as string];
    if (typeof v === "number" && !Number.isNaN(v)) return v;
    if (typeof v === "string" && v.trim() !== "" && !Number.isNaN(Number(v))) return Number(v);
    const d = t[k];
    return typeof d === "number" ? d : 0;
  };
  const bool = (k: keyof Project): boolean => {
    const v = fields[k as string];
    if (typeof v === "boolean") return v;
    return false;
  };

  const statusRaw = str("status");
  const status: ProjectStatus = isProjectStatus(statusRaw) ? statusRaw : t.status;

  const tagsRaw = fields.tags;
  const tags =
    Array.isArray(tagsRaw) && tagsRaw.every((x) => typeof x === "string")
      ? (tagsRaw as string[])
      : parseJsonField("tags", tagsRaw, t.tags);

  return {
    id: str("id") || t.id,
    slug: str("slug") || t.slug,
    title: str("title") || t.title,
    location: str("location") || t.location,
    city: str("city") || t.city,
    description: str("description") || t.description,
    longDescription: str("longDescription") || t.longDescription,
    images: parseJsonField("images", fields.images, t.images),
    videoUrl: (() => {
      const v = str("videoUrl");
      return v.length > 0 ? v : undefined;
    })(),
    droneVideos: parseJsonField("droneVideos", fields.droneVideos, t.droneVideos ?? []),
    startingPrice: num("startingPrice"),
    completionDate: str("completionDate") || t.completionDate,
    status,
    availableApartmentsCount: num("availableApartmentsCount"),
    totalApartments: num("totalApartments"),
    floors: num("floors"),
    amenities: parseJsonField("amenities", fields.amenities, t.amenities),
    nearbyPlaces: parseJsonField("nearbyPlaces", fields.nearbyPlaces, t.nearbyPlaces),
    paymentOptions: parseJsonField("paymentOptions", fields.paymentOptions, t.paymentOptions),
    apartments: parseJsonField("apartments", fields.apartments, t.apartments),
    developer: str("developer") || t.developer,
    architect: str("architect") || undefined,
    coordinates: parseJsonField("coordinates", fields.coordinates, t.coordinates),
    tags,
    featured: bool("featured"),
  };
}
