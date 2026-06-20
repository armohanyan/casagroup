/** Stable numeric listing code (redinvest-style) from an id string. */
export function listingCode(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = Math.imul(31, h) + id.charCodeAt(i);
  return 10000 + (Math.abs(h) % 90000);
}
