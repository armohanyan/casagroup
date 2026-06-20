"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Building2, Search, Calculator, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import { isPartnerPortalPath } from "@/lib/partner-portal";

const ADMIN_PREFIX = "/admin-lx9k2m";

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MobileBottomNav() {
  const pathname = usePathname();
  const { t } = useI18n();

  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  if (isAdmin || isPartnerPortalPath(pathname)) return null;

  const items = [
    { href: "/", label: t.nav.home, icon: Home },
    { href: "/properties", label: t.nav.apartments, icon: Search },
    { href: "/projects", label: t.nav.developments, icon: Building2 },
    { href: "/calculator", label: t.nav.calculatorShort, icon: Calculator },
    { href: "/contact", label: t.nav.contact, icon: Phone },
  ];

  return (
    <nav
      className="fixed bottom-0 inset-x-0 z-40 lg:hidden bg-white/95 backdrop-blur-md border-t border-[#E7E0D5] shadow-[0_-4px_20px_rgba(12,20,40,0.06)]"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
      aria-label="Mobile navigation"
    >
      <div className="flex items-stretch justify-around h-16">
        {items.map(({ href, label, icon: Icon }) => {
          const active = isActive(href, pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 min-w-0 px-1 transition-colors",
                active ? "text-brand" : "text-[#A8A29E] hover:text-[#57534E]",
              )}
            >
              <Icon size={20} strokeWidth={active ? 2.25 : 1.75} />
              <span className="text-[10px] font-medium truncate max-w-full">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
