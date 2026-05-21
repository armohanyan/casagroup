import type { InquiryFormData } from "@/types";
import type { FieldCreatePayload } from "@/src/lib/airtable-project-schema";

export const INQUIRY_FIELD_SPECS: FieldCreatePayload[] = [
  { name: "fullName", type: "singleLineText" },
  { name: "phone", type: "phoneNumber" },
  { name: "email", type: "email" },
  { name: "interestedProject", type: "singleLineText" },
  { name: "message", type: "multilineText" },
  {
    name: "submittedAt",
    type: "dateTime",
    options: {
      dateFormat: { name: "iso" },
      timeFormat: { name: "24hour" },
      timeZone: "client",
    },
  },
];

export function inquiryToAirtableFields(data: InquiryFormData): Record<string, unknown> {
  return {
    fullName: data.fullName.trim(),
    phone: data.phone.trim(),
    email: data.email.trim(),
    interestedProject: data.interestedProject.trim(),
    message: data.message.trim(),
    submittedAt: new Date().toISOString(),
  };
}
