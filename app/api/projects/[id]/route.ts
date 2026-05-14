import { NextResponse } from "next/server";
import { deleteProjectOnAirtable, isAirtableConfigured, updateProjectOnAirtable } from "@/src/lib/projects-airtable";
import type { Project } from "@/types";

export const dynamic = "force-dynamic";

/** PATCH / DELETE by app `Project.id` (stored in the `id` column in Airtable). */
export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({ error: "Airtable is not configured." }, { status: 503 });
    }
    const { id } = await context.params;
    const patch = (await request.json()) as Partial<Project>;
    const project = await updateProjectOnAirtable(decodeURIComponent(id), patch);
    return NextResponse.json(project);
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/projects/:id] PATCH", e);
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}

export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json({ error: "Airtable is not configured." }, { status: 503 });
    }
    const { id } = await context.params;
    await deleteProjectOnAirtable(decodeURIComponent(id));
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/projects/:id] DELETE", e);
    const status = message.includes("not found") ? 404 : 500;
    return NextResponse.json({ error: message }, { status });
  }
}
