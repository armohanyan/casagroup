import { NextResponse } from "next/server";
import { isAirtableConfigured } from "@/src/lib/projects-airtable";

export const dynamic = "force-dynamic";

/** Whether server env has Airtable keys (admin UI / diagnostics). */
export async function GET() {
  return NextResponse.json({ airtableConfigured: isAirtableConfigured() });
}
