"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, Phone, MapPin, ChevronDown, Check } from "lucide-react";
import { useI18n, type Lang } from "@/lib/i18n";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "/", key: "home" as const },
  { href: "/projects", key: "projects" as const },
  { href: "/calculator", key: "calculator" as const },
  { href: "/about", key: "about" as const },
  { href: "/contact", key: "contact" as const },
] as const;

function isActive(href: string, pathname: string) {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

const LANG_SHORT: Record<Lang, string> = { hy: "ՀՅ", en: "EN" };
const LANG_FULL: Record<Lang, string> = { hy: "Հայերեն", en: "English" };

function LangDropdown({ onDark = false }: { onDark?: boolean }) {
  const { lang, setLang } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Language"
        className={cn(
          "inline-flex h-9 items-center gap-1 rounded-[5px] border px-2.5 text-[11px] font-semibold transition-colors",
          onDark
            ? "border-white/35 text-white hover:border-white"
            : "border-[#E5E7EB] text-[#0c1428] hover:border-[#0c1428]",
        )}
      >
        {LANG_SHORT[lang]}
        <ChevronDown size={13} className={cn("transition-transform", open && "rotate-180")} />
      </button>
      {open && (
        <div
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 w-32 overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white py-1 shadow-[0_8px_24px_rgba(12,20,40,0.12)]"
        >
          {(["hy", "en"] as const).map((l: Lang) => (
            <button
              key={l}
              type="button"
              role="option"
              aria-selected={lang === l}
              onClick={() => {
                setLang(l);
                setOpen(false);
              }}
              className={cn(
                "flex w-full items-center justify-between px-3 py-2 text-sm transition-colors",
                lang === l
                  ? "font-semibold text-[#0c1428]"
                  : "text-[#6B7280] hover:bg-[#F9FAFB] hover:text-[#0c1428]",
              )}
            >
              {LANG_FULL[l]}
              {lang === l && <Check size={14} className="text-[#c9a96e]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t, lang } = useI18n();
  const address = lang === "hy" ? "Սայաթ-Նովա 40" : "Sayat-Nova 40";

  const isHome = pathname === "/";
  const transparent = isHome && !scrolled;
  const headerDark = transparent || mobileOpen;

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
      calculator: t.nav.calculatorShort,
      about: t.nav.about,
      contact: t.nav.contact,
    })[key];

  const linkCls = (href: string) =>
    cn(
      "px-2.5 py-2 text-sm font-medium rounded-md whitespace-nowrap",
      transparent
        ? isActive(href, pathname) ? "text-white" : "text-white/80 hover:text-white"
        : isActive(href, pathname) ? "text-[#0c1428]" : "text-[#6B7280] hover:text-[#0c1428]",
    );

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-[1100] transition-colors",
        mobileOpen
          ? "bg-[#0F172A]"
          : transparent
            ? "bg-transparent"
            : "bg-white border-b border-[#E5E7EB]",
      )}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center gap-3">
        <Link
          href="/"
          className={cn("shrink-0 text-lg font-semibold", headerDark ? "text-white" : "text-[#0c1428]")}
        >
          Casa<span className="text-[#c9a96e]">Group</span>
        </Link>

        <nav className="hidden lg:flex flex-1 items-center justify-center gap-0.5">
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} className={linkCls(href)}>{label(key)}</Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4 ml-auto lg:ml-0">
          <a
            href="tel:+37496799733"
            className={cn(
              "hidden lg:inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              transparent ? "text-white/85 hover:text-white" : "text-[#374151] hover:text-[#0c1428]",
            )}
          >
            <Phone size={14} className="text-[#c9a96e]" />
            +374 96 799733
          </a>
          <a
            href="https://maps.google.com/?q=Sayat-Nova+Avenue+40,+Yerevan"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "hidden xl:inline-flex items-center gap-1.5 text-sm font-medium whitespace-nowrap transition-colors",
              transparent ? "text-white/85 hover:text-white" : "text-[#374151] hover:text-[#0c1428]",
            )}
          >
            <MapPin size={14} className="text-[#c9a96e]" />
            {address}
          </a>
          <LangDropdown onDark={transparent} />
        </div>

        <button
          type="button"
          className={cn("md:hidden ml-auto p-2", headerDark ? "text-white" : "text-[#0c1428]")}
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Menu"
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {mobileOpen && (
        <div className="md:hidden bg-white border-t border-[#E5E7EB] px-4 py-4 space-y-1">
          <div className="flex justify-start pb-3 mb-1 border-b border-[#E5E7EB]">
            <LangDropdown />
          </div>
          {NAV_LINKS.map(({ href, key }) => (
            <Link key={href} href={href} className="block py-3 text-base font-medium text-[#0c1428]">{label(key)}</Link>
          ))}
          <div className="mt-2 space-y-1 border-t border-[#E5E7EB] pt-3">
            <a href="tel:+37496799733" className="flex items-center gap-2 py-2 text-sm font-medium text-[#374151]">
              <Phone size={15} className="text-[#c9a96e]" /> +374 96 799733
            </a>
            <a
              href="https://maps.google.com/?q=Sayat-Nova+Avenue+40,+Yerevan"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 py-2 text-sm font-medium text-[#374151]"
            >
              <MapPin size={15} className="text-[#c9a96e]" /> {address}
            </a>
          </div>
          <a href="tel:+37496799733" className="flex items-center justify-center gap-2 mt-3 h-12 rounded-lg bg-[#0c1428] text-white font-semibold">
            <Phone size={18} /> {t.nav.call}
          </a>
        </div>
      )}
    </header>
  );
}
