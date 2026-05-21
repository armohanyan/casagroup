import { NextResponse } from "next/server";
import type { Lang } from "@/lib/i18n";
import { getTeamSectionsForSite } from "@/src/lib/team-airtable";

export const dynamic = "force-dynamic";

function parseLang(value: string | null): Lang {
  return value === "en" ? "en" : "hy";
}

/** GET — team sections for About page (Airtable "Team" table when configured, else seed copy). */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const lang = parseLang(searchParams.get("lang"));
    const sections = await getTeamSectionsForSite(lang);
    return NextResponse.json({ sections });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/team] GET", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
