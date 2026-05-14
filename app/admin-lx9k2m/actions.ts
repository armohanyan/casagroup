"use server";

import { runAirtableSetup, type SetupAirtableResult } from "@/src/lib/setup-airtable";

export type AirtableSetupActionResult = SetupAirtableResult | { ok: false; error: string };

/** Creates/updates the Airtable Projects table and seeds from `MOCK_PROJECTS`. Uses `AIRTABLE_*` env on the server (e.g. Vercel). */
export async function runAirtableSetupFromAdmin(): Promise<AirtableSetupActionResult> {
  try {
    return await runAirtableSetup();
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error("[runAirtableSetupFromAdmin]", e);
    return { ok: false, error: message };
  }
}
