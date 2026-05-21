import type { TeamMemberRow, TeamSectionDisplay } from "@/types";
import type { FieldCreatePayload } from "@/src/lib/airtable-project-schema";

export const TEAM_FIELD_SPECS: FieldCreatePayload[] = [
  { name: "id", type: "singleLineText" },
  { name: "sectionKey", type: "singleLineText" },
  { name: "sectionSort", type: "number", options: { precision: 0 } },
  { name: "memberSort", type: "number", options: { precision: 0 } },
  { name: "sectionEyebrowEn", type: "singleLineText" },
  { name: "sectionEyebrowHy", type: "singleLineText" },
  { name: "sectionTitleEn", type: "singleLineText" },
  { name: "sectionTitleHy", type: "singleLineText" },
  { name: "nameEn", type: "singleLineText" },
  { name: "nameHy", type: "singleLineText" },
  { name: "roleEn", type: "singleLineText" },
  { name: "roleHy", type: "singleLineText" },
  { name: "photoUrl", type: "singleLineText" },
  {
    name: "published",
    type: "checkbox",
    options: { icon: "check", color: "greenBright" },
  },
];

function str(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

function num(v: unknown, fallback: number): number {
  return typeof v === "number" && !Number.isNaN(v) ? v : fallback;
}

function bool(v: unknown, fallback: boolean): boolean {
  return typeof v === "boolean" ? v : fallback;
}

export function teamRowToAirtableFields(row: TeamMemberRow): Record<string, unknown> {
  return {
    id: row.id,
    sectionKey: row.sectionKey,
    sectionSort: row.sectionSort,
    memberSort: row.memberSort,
    sectionEyebrowEn: row.sectionEyebrowEn,
    sectionEyebrowHy: row.sectionEyebrowHy,
    sectionTitleEn: row.sectionTitleEn,
    sectionTitleHy: row.sectionTitleHy,
    nameEn: row.nameEn,
    nameHy: row.nameHy,
    roleEn: row.roleEn,
    roleHy: row.roleHy,
    photoUrl: row.photoUrl?.trim() ?? "",
    published: row.published !== false,
  };
}

export function airtableFieldsToTeamRow(fields: Record<string, unknown>): TeamMemberRow {
  return {
    id: str(fields.id),
    sectionKey: str(fields.sectionKey),
    sectionSort: num(fields.sectionSort, 0),
    memberSort: num(fields.memberSort, 0),
    sectionEyebrowEn: str(fields.sectionEyebrowEn),
    sectionEyebrowHy: str(fields.sectionEyebrowHy),
    sectionTitleEn: str(fields.sectionTitleEn),
    sectionTitleHy: str(fields.sectionTitleHy),
    nameEn: str(fields.nameEn),
    nameHy: str(fields.nameHy),
    roleEn: str(fields.roleEn),
    roleHy: str(fields.roleHy),
    photoUrl: str(fields.photoUrl) || undefined,
    published: bool(fields.published, true),
  };
}

export function groupTeamRowsToSections(
  rows: TeamMemberRow[],
  lang: "en" | "hy"
): TeamSectionDisplay[] {
  const visible = rows.filter((r) => r.published !== false && r.id);
  const sorted = [...visible].sort(
    (a, b) => a.sectionSort - b.sectionSort || a.memberSort - b.memberSort
  );

  const sectionOrder: string[] = [];
  const byKey = new Map<string, TeamSectionDisplay>();

  for (const row of sorted) {
    if (!byKey.has(row.sectionKey)) {
      sectionOrder.push(row.sectionKey);
      byKey.set(row.sectionKey, {
        sectionEyebrow: lang === "hy" ? row.sectionEyebrowHy : row.sectionEyebrowEn,
        sectionTitle: lang === "hy" ? row.sectionTitleHy : row.sectionTitleEn,
        members: [],
      });
    }
    const section = byKey.get(row.sectionKey)!;
    const name = lang === "hy" ? row.nameHy : row.nameEn;
    const role = lang === "hy" ? row.roleHy : row.roleEn;
    if (!name) continue;
    section.members.push({
      name,
      role,
      imageUrl: row.photoUrl?.trim() || undefined,
    });
  }

  return sectionOrder
    .map((key) => byKey.get(key))
    .filter((s): s is TeamSectionDisplay => !!s && s.members.length > 0);
}
