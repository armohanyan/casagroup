import { NextResponse } from "next/server";
import { getInternalBackendUrl } from "@/lib/backend-url";

export const dynamic = "force-dynamic";

/**
 * Public homepage hero slides — no admin auth.
 * Proxies Express /api/hero-slides on loopback (never the public site origin).
 */
export async function GET() {
  const backend = getInternalBackendUrl();
  const url = `${backend}/api/hero-slides`;

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
    // Never forward auth challenges — this endpoint is public.
    if (res.status === 401 || res.status === 403) {
      console.error("[api/hero-slides] unexpected auth status from", url, body.slice(0, 200));
      return NextResponse.json({ error: "Hero slides backend misconfigured" }, { status: 502 });
    }

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
