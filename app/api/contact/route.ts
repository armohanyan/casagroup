import { NextResponse } from "next/server";
import type { InquiryFormData } from "@/types";
import { createInquiryOnAirtable, isAirtableConfigured } from "@/src/lib/inquiries-airtable";

export const dynamic = "force-dynamic";

function isValidEmail(email: string): boolean {
  return /\S+@\S+\.\S+/.test(email);
}

type ParsedContactBody = InquiryFormData & { kind?: string };

function parseBody(body: unknown): ParsedContactBody | null {
  if (!body || typeof body !== "object") return null;
  const o = body as Record<string, unknown>;
  const fullName = typeof o.fullName === "string" ? o.fullName : "";
  const phone = typeof o.phone === "string" ? o.phone : "";
  const email = typeof o.email === "string" ? o.email : "";
  const interestedProject = typeof o.interestedProject === "string" ? o.interestedProject : "";
  const message = typeof o.message === "string" ? o.message : "";
  const kind = typeof o.kind === "string" ? o.kind : undefined;
  return { fullName, phone, email, interestedProject, message, kind };
}

function validate(data: ParsedContactBody): string | null {
  if (!data.fullName.trim()) return "fullName is required";
  if (!data.phone.trim()) return "phone is required";
  const simpleKinds = ["consultation", "callback", "visit"];
  if (data.kind && simpleKinds.includes(data.kind)) return null;
  if (!data.email.trim() || !isValidEmail(data.email)) return "valid email is required";
  if (!data.message.trim()) return "message is required";
  return null;
}

/** POST — store a contact / inquiry form submission in Airtable "Inquiries" table. */
export async function POST(request: Request) {
  try {
    if (!isAirtableConfigured()) {
      return NextResponse.json(
        { error: "Airtable is not configured (AIRTABLE_API_KEY / AIRTABLE_BASE_ID)." },
        { status: 503 }
      );
    }

    const data = parseBody(await request.json());
    if (!data) {
      return NextResponse.json({ error: "Invalid request body" }, { status: 400 });
    }

    const validationError = validate(data);
    if (validationError) {
      return NextResponse.json({ error: validationError }, { status: 400 });
    }

    const inquiry: InquiryFormData = {
      fullName: data.fullName,
      phone: data.phone,
      email: data.email,
      interestedProject: data.interestedProject,
      message:
        (data.kind === "consultation" || data.kind === "callback" || data.kind === "visit") &&
        !data.message.trim()
          ? `${data.kind ?? "Inquiry"} request`
          : data.message,
    };

    const result = await createInquiryOnAirtable(inquiry);
    return NextResponse.json({ ok: true, id: result.id });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[api/contact] POST", e);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
