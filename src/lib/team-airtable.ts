import type { Lang } from "@/lib/i18n";
import type { TeamMemberRow, TeamSectionDisplay } from "@/types";
import { TEAM_SEED_ROWS } from "@/data/team-seed";
import {
  airtableFieldsToTeamRow,
  groupTeamRowsToSections,
} from "@/src/lib/airtable-team-schema";
import { getAirtableBase, isAirtableConfigured, TEAM_TABLE_NAME } from "@/src/lib/airtable";

export { isAirtableConfigured };

export async function listTeamFromAirtable(): Promise<TeamMemberRow[]> {
  const { base } = getAirtableBase();
  const records = await base(TEAM_TABLE_NAME).select({ pageSize: 100 }).all();
  return records
    .map((r) => airtableFieldsToTeamRow(r.fields as Record<string, unknown>))
    .filter((row) => row.id);
}

export function teamSectionsFromRows(rows: TeamMemberRow[], lang: Lang): TeamSectionDisplay[] {
  return groupTeamRowsToSections(rows, lang);
}

export async function getTeamSectionsForSite(lang: Lang): Promise<TeamSectionDisplay[]> {
  if (!isAirtableConfigured()) {
    return teamSectionsFromRows(TEAM_SEED_ROWS, lang);
  }
  const rows = await listTeamFromAirtable();
  const sections = teamSectionsFromRows(rows, lang);
  if (sections.length > 0) return sections;
  return teamSectionsFromRows(TEAM_SEED_ROWS, lang);
}
