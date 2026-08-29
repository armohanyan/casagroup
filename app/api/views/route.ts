import { NextResponse } from "next/server";
import { getInternalBackendUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

async function proxy(path: string, init?: RequestInit) {
  const res = await fetch(`${getInternalBackendUrl()}${path}`, {
    ...init,
    cache: "no-store",
  });
  const body = await res.text();
  return new NextResponse(body, {
    status: res.status,
    headers: {
      "Content-Type": res.headers.get("Content-Type") || "application/json",
    },
  });
}

/** POST /api/views - record a project view */
export async function POST(request: Request) {
  try {
    const raw = await request.text();
    return await proxy("/api/views", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: raw,
    });
  } catch (err) {
    console.error("[api/views] POST", err);
    return NextResponse.json({ error: "Failed to record view" }, { status: 502 });
  }
}
