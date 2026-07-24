import type { Lang } from "@/lib/i18n";
import type { TeamMemberRow, TeamSectionDisplay } from "@/types";
import { TEAM_SEED_ROWS } from "@/data/team-seed";

export function groupTeamRowsToSections(
  rows: TeamMemberRow[],
  lang: Lang,
): TeamSectionDisplay[] {
  const visible = rows.filter((r) => r.published !== false && r.id);
  const sorted = [...visible].sort(
    (a, b) => a.sectionSort - b.sectionSort || a.memberSort - b.memberSort,
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

export function getTeamSectionsForSite(lang: Lang): TeamSectionDisplay[] {
  return groupTeamRowsToSections(TEAM_SEED_ROWS, lang);
}
