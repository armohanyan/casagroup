import Airtable from "airtable";
import type { InquiryFormData } from "@/types";
import { inquiryToAirtableFields } from "@/src/lib/airtable-inquiries-schema";
import { getAirtableBase, INQUIRIES_TABLE_NAME, isAirtableConfigured } from "@/src/lib/airtable";

export { isAirtableConfigured };

export async function createInquiryOnAirtable(data: InquiryFormData): Promise<{ id: string }> {
  const { base } = getAirtableBase();
  const fields = inquiryToAirtableFields(data);
  const [record] = await base(INQUIRIES_TABLE_NAME).create([fields as Airtable.FieldSet], { typecast: true });
  return { id: record.id };
}
