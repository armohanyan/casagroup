import { listingCode } from "@/lib/listing-code";

/** Prefer admin-set apartment number; fall back to stable listing code. */
export function apartmentDisplayNumber(apartment: {
  id: string;
  apartmentNumber?: string | null;
}): string {
  const n = apartment.apartmentNumber?.trim();
  if (n) return n;
  return String(listingCode(apartment.id));
}

/** Whether the number was set by admin (vs generated listing code). */
export function hasApartmentNumber(apartment: {
  apartmentNumber?: string | null;
}): boolean {
  return Boolean(apartment.apartmentNumber?.trim());
}
