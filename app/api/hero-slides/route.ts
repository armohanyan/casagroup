import { NextResponse } from "next/server";
import { getInternalBackendUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

/** Proxy public hero slides from Express (avoids nginx rewrite loops to the site origin). */
export async function GET() {
  try {
    const res = await fetch(`${getInternalBackendUrl()}/api/hero-slides`, {
      cache: "no-store",
      headers: { Accept: "application/json" },
    });
    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[api/hero-slides]", err);
    return NextResponse.json({ error: "Failed to load hero slides" }, { status: 502 });
  }
}
