"use client";

import { Phone } from "lucide-react";
import { usePathname } from "next/navigation";
import { isPartnerPortalPath } from "@/lib/partner-portal";

const ADMIN_PREFIX = "/admin-lx9k2m";

export function StickyCallButton() {
  const pathname = usePathname();
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  if (isAdmin || isPartnerPortalPath(pathname)) return null;

  return (
    <a
      href="tel:+37496799733"
      className="fixed bottom-5 right-5 z-40 lg:hidden flex items-center justify-center w-14 h-14 rounded-full bg-[#0c1428] text-white shadow-lg"
      aria-label="Call sales"
    >
      <Phone size={22} />
    </a>
  );
}
