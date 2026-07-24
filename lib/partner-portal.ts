export const PARTNER_PORTAL_PREFIX = "/partners";

export function isPartnerPortalPath(pathname: string): boolean {
  return pathname === PARTNER_PORTAL_PREFIX || pathname.startsWith(`${PARTNER_PORTAL_PREFIX}/`);
}
