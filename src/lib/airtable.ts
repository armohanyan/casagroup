import Airtable from "airtable";
import type { FieldCreatePayload } from "@/src/lib/airtable-project-schema";

export const PROJECTS_TABLE_NAME = "Projects";

const META_BASE = "https://api.airtable.com/v0/meta/bases";

export type MetaField = {
  id: string;
  name: string;
  type: string;
  options?: Record<string, unknown>;
};

export type MetaView = {
  id: string;
  name: string;
  type: string;
  visibleFieldIds?: string[];
};

export type MetaTable = {
  id: string;
  name: string;
  primaryFieldId: string;
  fields: MetaField[];
  views?: MetaView[];
};

export function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required environment variable: ${name}`);
  return v;
}

/** Official Airtable.js client — records API only (server-side). */
export function getAirtableBase() {
  const apiKey = requireEnv("AIRTABLE_API_KEY");
  const baseId = requireEnv("AIRTABLE_BASE_ID");
  Airtable.configure({ apiKey });
  return { base: Airtable.base(baseId), apiKey, baseId };
}

/** True when both env vars are non-empty (trimmed). */
export function isAirtableConfigured(): boolean {
  return !!(process.env.AIRTABLE_API_KEY?.trim() && process.env.AIRTABLE_BASE_ID?.trim());
}

/** Metadata / schema API (REST). */
export async function metaRequest<T>(apiKey: string, baseId: string, path: string, init?: RequestInit): Promise<T> {
  const url = `${META_BASE}/${baseId}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Airtable metadata API ${res.status}: ${text}`);
  }
  return (text ? JSON.parse(text) : {}) as T;
}

export async function listTables(apiKey: string, baseId: string, query?: string): Promise<MetaTable[]> {
  const suffix = query ? (query.startsWith("?") ? query : `?${query}`) : "";
  const data = await metaRequest<{ tables: MetaTable[] }>(apiKey, baseId, `/tables${suffix}`);
  return data.tables ?? [];
}

export async function createTable(
  apiKey: string,
  baseId: string,
  name: string,
  fields: FieldCreatePayload[]
): Promise<MetaTable> {
  return metaRequest<MetaTable>(apiKey, baseId, "/tables", {
    method: "POST",
    body: JSON.stringify({ name, fields }),
  });
}

export async function createField(
  apiKey: string,
  baseId: string,
  tableId: string,
  field: FieldCreatePayload
): Promise<MetaField> {
  return metaRequest<MetaField>(apiKey, baseId, `/tables/${tableId}/fields`, {
    method: "POST",
    body: JSON.stringify(field),
  });
}

/** Update grid view column visibility (Metadata API). Safe to ignore failures on older plans. */
export async function patchMetaView(
  apiKey: string,
  baseId: string,
  viewId: string,
  body: Record<string, unknown>
): Promise<void> {
  await metaRequest(apiKey, baseId, `/views/${viewId}`, {
    method: "PATCH",
    body: JSON.stringify(body),
  });
}

export function findTableInsensitive(tables: MetaTable[], name: string): MetaTable | undefined {
  const n = name.toLowerCase();
  return tables.find((t) => t.name.toLowerCase() === n);
}

export function tableHasField(table: MetaTable, fieldName: string): boolean {
  const lower = fieldName.toLowerCase();
  return table.fields.some((f) => f.name.toLowerCase() === lower);
}
