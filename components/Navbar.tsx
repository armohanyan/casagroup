"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", key: "home" as const },
  { href: "/projects", key: "projects" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
] as const;

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    queueMicrotask(() => setMobileOpen(false));
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [mobileOpen]);

  const label = (key: (typeof NAV_LINKS)[number]["key"]) =>
    ({
      home: t.nav.home,
      projects: t.nav.projects,
      about: t.nav.about,
      contact: t.nav.contact,
    })[key];

  const linkCls = (href: string) =>
    cn(
      "px-2.5 py-2 text-sm font-medium rounded-md whitespace-nowrap",
      transparent
        ? isActive(href, pathname) ? "text-white" : "text-white/80 hover:text-white"
        : isActive(href, pathname) ? "text-[#111827]" : "text-[#6B7280] hover:text-[#111827]",
    );

  return (
    <header className={cn("fixed top-0 inset-x-0 z-50 transition-colors", transparent ? "bg-transparent" : "bg-white border-b border-[#E5E7EB]")}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-4">
        <Link href="/" className={cn("shrink-0 text-lg font-semibold", transparent ? "text-white" : "text-[#111827]")}>
          Casa<span className="text-[#C8A96A]">Group</span>
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} className={linkCls(href)}>{label(key)}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-2 ml-auto lg:ml-0">
          <a href="tel:+37496799733" className={cn("text-sm font-medium hidden xl:block", transparent ? "text-white/80" : "text-[#6B7280]")}>
            +374 96 799733
          </a>
          {(["en", "hy"] as const).map((l) => (
            <button
              key={l}
              type="button"
              onClick={() => setLang(l)}
              className={cn(
                "w-8 h-8 text-[10px] font-semibold rounded border",
                lang === l
                  ? transparent ? "border-white text-white bg-white/15" : "border-[#111827] bg-[#111827] text-white"
                  : transparent ? "border-white/30 text-white/70" : "border-[#E5E7EB] text-[#6B7280]",
              )}
            >
              {l === "en" ? "EN" : "ՀՅ"}
            </button>
          ))}
          <Link
            href="/contact"
            className={cn(
              "inline-flex h-9 items-center gap-1.5 px-4 rounded-lg text-sm font-semibold",
              transparent ? "bg-[#C8A96A] text-[#111827]" : "bg-[#111827] text-white",
            )}
          >
            {t.nav.contact}
          </Link>
        </div>

        <button type="button" className={cn("md:hidden ml-auto p-2", transparent ? "text-white" : "text-[#111827]")} onClick={() => setMobileOpen(!mobileOpen)} aria-label="Menu">
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-4 space-y-1">
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} className="block py-3 text-base font-medium text-[#111827]">{label(key)}</Link>
          ))}
          <a href="tel:+37496799733" className="flex items-center justify-center gap-2 mt-3 h-12 rounded-lg bg-[#111827] text-white font-semibold">
            <Phone size={18} /> {t.nav.call}
          </a>
        </div>
      )}
    </header>
  );
}
