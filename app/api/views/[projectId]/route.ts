import { NextResponse } from "next/server";
import { getInternalBackendUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

/** GET /api/views/:projectId - view count */
export async function GET(
  _request: Request,
  context: { params: Promise<{ projectId: string }> }
) {
  try {
    const { projectId } = await context.params;
    const res = await fetch(
      `${getInternalBackendUrl()}/api/views/${encodeURIComponent(projectId)}`,
      { cache: "no-store", headers: { Accept: "application/json" } }
    );
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
      },
    });
  } catch (err) {
    console.error("[api/views/:projectId] GET", err);
    return NextResponse.json({ error: "Failed to load views" }, { status: 502 });
  }
}
