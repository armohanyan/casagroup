import { NextResponse } from "next/server";
import type { Project } from "@/types";
import { MOCK_PROJECTS } from "@/data/mock";
import { createProjectOnAirtable, isAirtableConfigured, listProjectsFromAirtable } from "@/src/lib/projects-airtable";

export const dynamic = "force-dynamic";

/** GET — list projects (Airtable when configured, otherwise mock seed data). */
export async function GET() {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json(MOCK_PROJECTS);
    }
    const projects = await listProjectsFromAirtable();
    return NextResponse.json(projects);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/projects] GET", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

/** POST — create project (requires Airtable env). */
export async function POST(request: Request) {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({ error: "Airtable is not configured (AIRTABLE_API_KEY / AIRTABLE_BASE_ID)." }, { status: 503 });
    }
    const body = (await request.json()) as Omit<Project, "id" | "slug">;
    const project = await createProjectOnAirtable(body);
    return NextResponse.json(project);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/projects] POST", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
