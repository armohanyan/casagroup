import { NextResponse } from "next/server";
import { getInternalBackendUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

/**
 * Public homepage hero slides — no admin auth.
 * Proxies Express on loopback. Prefer /api/projects/_hero-slides from the client when possible.
 */
export async function GET() {
  const backend = getInternalBackendUrl();
  const url = `${backend}/api/projects/_hero-slides`;

  try {
    const res = await fetch(url, {
      cache: "no-store",
      redirect: "manual",
      headers: { Accept: "application/json" },
    });

    if (res.status >= 300 && res.status < 400) {
      console.error("[api/hero-slides] refused redirect from", url, res.headers.get("location"));
      return NextResponse.json({ error: "Backend misconfigured" }, { status: 502 });
    }

    const body = await res.text();
    return new NextResponse(body, {
      status: res.status,
      headers: {
        "Content-Type": res.headers.get("Content-Type") || "application/json",
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    });
  } catch (err) {
    console.error("[api/hero-slides] fetch failed", url, err);
    return NextResponse.json({ error: "Failed to load hero slides" }, { status: 502 });
  }
}
