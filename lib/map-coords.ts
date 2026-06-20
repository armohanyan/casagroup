import type { PropertyListing } from "@/lib/properties";

/** Slight offset so multiple units at one project remain clickable on the map. */
export function getMarkerCoords(listing: PropertyListing): { lat: number; lng: number } {
  const { lat, lng } = listing.project.coordinates;
  const seed = listing.apartment.id;
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = Math.imul(31, h) + seed.charCodeAt(i);
  const dx = ((h % 17) - 8) * 0.00012;
  const dy = (((h >> 4) % 17) - 8) * 0.00012;
  return { lat: lat + dy, lng: lng + dx };
}
