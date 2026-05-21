import { en } from "@/lib/translations-en";
import { hyTranslations } from "@/content/hy";
import type { TeamMemberRow } from "@/types";

/** Flat rows for Airtable "Team" table — built from static EN/HY copy. */
export function buildTeamSeedRows(): TeamMemberRow[] {
  const rows: TeamMemberRow[] = [];
  en.about.teamSections.forEach((enSec, si) => {
    const hySec = hyTranslations.about.teamSections[si];
    if (!hySec) return;
    enSec.members.forEach((enMem, mi) => {
      const hyMem = hySec.members[mi];
      if (!hyMem) return;
      rows.push({
        id: `team-${si}-${mi}`,
        sectionKey: `section-${si}`,
        sectionSort: si,
        memberSort: mi,
        sectionEyebrowEn: enSec.sectionEyebrow,
        sectionEyebrowHy: hySec.sectionEyebrow,
        sectionTitleEn: enSec.sectionTitle,
        sectionTitleHy: hySec.sectionTitle,
        nameEn: enMem.name,
        nameHy: hyMem.name,
        roleEn: enMem.role,
        roleHy: hyMem.role,
        photoUrl: "",
        published: true,
      });
    });
  });
  return rows;
}

export const TEAM_SEED_ROWS = buildTeamSeedRows();
