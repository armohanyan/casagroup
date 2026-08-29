"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

function isActive(href: string, pathname: string) {
  if (href === "/partners") return pathname === "/partners";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function PartnerNavbar() {
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const links = [
    { label: t.nav.home, href: "/partners" },
    { label: t.nav.services, href: "/partners/services" },
    { label: t.nav.academy, href: "/partners#academy" },
    { label: t.nav.faq, href: "/partners#faq" },
    { label: t.nav.contact, href: "/partners#contact" },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-[#E7E0D5] shadow-sm">
      <div className="max-w-7xl mx-auto h-16 flex items-center justify-between gap-4">
        <Link href="/partners" className="font-brand shrink-0 font-bold text-xl text-[#1C1917]">
          Casa<span className="text-[#c9a96e]">Group</span>
          <span className="ml-2 text-[10px] sm:text-xs text-[#A8A29E] font-semibold uppercase tracking-wide">
            Partner
          </span>
        </Link>

        <nav className="hidden lg:flex items-center gap-1">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "px-3 py-2 text-sm font-medium rounded-md transition-colors",
                isActive(link.href.split("#")[0]!, pathname)
                  ? "text-brand bg-brand-soft"
                  : "text-[#57534E] hover:text-brand hover:bg-brand-soft/50"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-2 shrink-0">
          {(["hy", "ru", "en"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "px-2.5 py-1 text-xs font-medium rounded border transition-colors",
                lang === l
                  ? "border-brand bg-brand text-white"
                  : "border border-[#E7E0D5] bg-white text-[#57534E] hover:text-brand hover:border-brand/30"
              )}
            >
              {l === "en" ? "EN" : l === "ru" ? "РУ" : "ՀՅ"}
            </button>
          ))}
          <Link href="/partners#contact" className="btn-outline h-9 px-4 text-sm rounded-md">
            {t.nav.contact}
          </Link>
          <Link
            href="/"
            className="ml-1 text-sm font-medium text-[#57534E] hover:text-brand transition-colors whitespace-nowrap"
          >
            {t.partner.backToMain}
          </Link>
        </div>

        <button
          type="button"
          className="lg:hidden p-2 text-[#1C1917]"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label={mobileOpen ? "Close menu" : "Open menu"}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden top-16"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <nav className="lg:hidden relative z-50 bg-white border-t border-[#E7E0D5] px-4 py-3 space-y-1 shadow-lg">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block px-3 py-2.5 text-sm font-medium text-[#1C1917]"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <Link
              href="/partners#contact"
              className="block mx-3 mt-3 text-center btn-outline py-3 rounded-md"
              onClick={() => setMobileOpen(false)}
            >
              {t.nav.contact}
            </Link>
            <Link
              href="/"
              className="block px-3 py-2.5 text-sm text-brand font-semibold border-t border-[#E7E0D5] mt-2"
              onClick={() => setMobileOpen(false)}
            >
              {t.partner.backToMain}
            </Link>
            <div className="flex gap-2 px-3 pt-3">
              {(["hy", "ru", "en"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "px-3 py-1.5 text-sm rounded border",
                    lang === l ? "border-brand bg-brand text-white" : "border border-[#E7E0D5] bg-white text-[#57534E]"
                  )}
                >
                  {l === "en" ? "EN" : l === "ru" ? "РУ" : "ՀՅ"}
                </button>
              ))}
            </div>
          </nav>
        </>
      )}
    </header>
  );
}
