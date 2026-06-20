"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ChevronDown, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useConsultationModal } from "@/lib/consultation-modal";
import { cn } from "@/lib/utils";

type NavLink = { label: string; href: string; description?: string };

type NavMenu = {
  id: string;
  label: string;
  links: NavLink[];
};

/** Pick the single most specific nav href that matches the current path. */
function resolveActiveHref(pathname: string, hrefs: readonly string[]): string | null {
  const matches = hrefs.filter((href) => {
    if (href === "/") return pathname === "/";
    return pathname === href || pathname.startsWith(`${href}/`);
  });
  if (matches.length === 0) return null;
  return matches.reduce((best, href) => (href.length > best.length ? href : best));
}

function isNavActive(href: string, pathname: string, allHrefs: readonly string[]) {
  return resolveActiveHref(pathname, allHrefs) === href;
}

function menuIsActive(links: NavLink[], pathname: string, allHrefs: readonly string[]) {
  const active = resolveActiveHref(pathname, allHrefs);
  return active !== null && links.some((link) => link.href === active);
}

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();
  const { openConsultation } = useConsultationModal();
  const menuRef = useRef<HTMLDivElement>(null);

  const menus: NavMenu[] = useMemo(
    () => [
      {
        id: "realty",
        label: t.sales.realty,
        links: [
          { label: t.nav.apartments, href: "/properties" },
          { label: t.sales.mapSearch, href: "/properties/map" },
          { label: t.nav.developments, href: "/projects" },
          { label: t.nav.investment, href: "/investment" },
          { label: t.nav.calculator, href: "/calculator" },
        ],
      },
      {
        id: "about",
        label: t.sales.aboutMenu,
        links: [
          { label: t.footer.links.about, href: "/about" },
          { label: t.footer.links.blog, href: "/blog" },
          { label: t.footer.links.partner, href: "/partners" },
        ],
      },
      {
        id: "services",
        label: t.sales.servicesMenu,
        links: [{ label: t.nav.services, href: "/partners/services" }],
      },
    ],
    [t],
  );

  const allNavHrefs = useMemo(
    () => [...menus.flatMap((menu) => menu.links.map((link) => link.href)), "/contact"],
    [menus],
  );

  const isHeroPage =
    pathname === "/" ||
    pathname === "/properties" ||
    pathname.startsWith("/properties/") ||
    pathname === "/projects" ||
    pathname === "/about" ||
    pathname === "/contact" ||
    pathname === "/blog" ||
    pathname === "/investment" ||
    pathname === "/calculator";

  const transparentNav = isHeroPage && !scrolled;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(null);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 8);
    window.addEventListener("scroll", handler, { passive: true });
    handler();
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
      setOpenMenu(null);
    });
  }, [pathname]);

  useEffect(() => {
    if (!mobileOpen) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [mobileOpen]);

  const triggerCls = (menu: NavMenu) =>
    cn(
      "flex items-center gap-1 px-3.5 py-2 text-sm font-medium transition-colors rounded-md type-button",
      transparentNav
        ? menuIsActive(menu.links, pathname, allNavHrefs) || openMenu === menu.id
          ? "text-white bg-white/15"
          : "text-white/90 hover:text-white hover:bg-white/10"
        : menuIsActive(menu.links, pathname, allNavHrefs) || openMenu === menu.id
          ? "text-[#c9a96e] bg-[#FAF8F5]"
          : "text-[#1C1917] hover:text-[#c9a96e]",
    );

  return (
    <div ref={menuRef} className="fixed top-0 left-0 right-0 z-50">
      {/* Top info bar */}
      <div
        className={cn(
          "hidden lg:block text-white text-xs border-b transition-colors duration-300",
          transparentNav
            ? "bg-brand/45 border-white/10 backdrop-blur-sm"
            : "bg-brand border-white/10",
        )}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between">
          <span className="text-white/70 truncate pr-4">{t.contact.address}</span>
          <div className="flex items-center gap-4 shrink-0">
            <a
              href="tel:+37496799733"
              className="flex items-center gap-1.5 hover:text-[#c9a96e] transition-colors whitespace-nowrap"
            >
              <Phone size={12} />
              +374 96 799733
            </a>
            <a
              href="mailto:casagroup@gmail.com"
              className="hover:text-[#c9a96e] transition-colors whitespace-nowrap"
            >
              casagroup@gmail.com
            </a>
          </div>
        </div>
      </div>

      <header
        className={cn(
          "transition-[box-shadow,background-color,border-color] duration-300",
          transparentNav
            ? "bg-transparent border-b border-white/10 backdrop-blur-[2px]"
            : scrolled
              ? "bg-white shadow-md border-b border-[#E7E0D5]"
              : "bg-white border-b border-[#E7E0D5]",
        )}
      >
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <Link
            href="/"
            className={cn(
              "shrink-0 font-bold text-xl sm:text-2xl transition-colors tracking-tight",
              transparentNav ? "text-white" : "text-[#1C1917]",
            )}
          >
            Casa<span className="text-[#c9a96e]">Group</span>
          </Link>

          {/* Desktop dropdown nav */}
          <nav className="hidden lg:flex items-center gap-0.5 flex-1 justify-center">
            {menus.map((menu) => (
              <div key={menu.id} className="relative">
                <button
                  type="button"
                  onClick={() => setOpenMenu(openMenu === menu.id ? null : menu.id)}
                  className={triggerCls(menu)}
                  aria-expanded={openMenu === menu.id}
                  aria-haspopup="true"
                >
                  {menu.label}
                  <ChevronDown
                    size={14}
                    className={cn("transition-transform", openMenu === menu.id && "rotate-180")}
                  />
                </button>
                {openMenu === menu.id && (
                  <div className="absolute top-full left-0 mt-1 min-w-[220px] bg-white border border-[#E7E0D5] rounded-lg shadow-lg py-2 z-50">
                    {menu.links.map((link) => (
                      <Link
                        key={`${menu.id}-${link.href}`}
                        href={link.href}
                        className={cn(
                          "block px-4 py-2.5 text-sm transition-colors",
                          isNavActive(link.href, pathname, allNavHrefs)
                            ? "text-[#c9a96e] font-medium bg-[#FAF8F5]"
                            : "text-[#57534E] hover:bg-[#FAF8F5] hover:text-[#c9a96e]",
                        )}
                        onClick={() => setOpenMenu(null)}
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <Link
              href="/contact"
              className={cn(
                "px-3.5 py-2 text-sm font-medium transition-colors rounded-md type-button",
                transparentNav
                  ? isNavActive("/contact", pathname, allNavHrefs)
                    ? "text-white bg-white/15"
                    : "text-white/90 hover:text-white hover:bg-white/10"
                  : isNavActive("/contact", pathname, allNavHrefs)
                    ? "text-[#c9a96e] bg-[#FAF8F5]"
                    : "text-[#1C1917] hover:text-[#c9a96e]",
              )}
            >
              {t.nav.contact}
            </Link>
          </nav>

          <div className="hidden lg:flex items-center gap-2 shrink-0">
            {(["en", "hy"] as const).map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={cn(
                  "px-2.5 py-1 text-xs font-medium rounded border transition-colors",
                  transparentNav
                    ? lang === l
                      ? "border-white text-white bg-white/15"
                      : "border-white/30 text-white/80 hover:text-white hover:border-white/50"
                    : lang === l
                      ? "border-brand bg-brand text-white"
                      : "border border-[#E7E0D5] bg-white text-[#57534E] hover:text-brand hover:border-brand/30",
                )}
              >
                {l === "en" ? "EN" : "ՀՅ"}
              </button>
            ))}
            <button
              type="button"
              onClick={openConsultation}
              className={cn(
                "ml-2 h-10 px-5 rounded-md type-button",
                transparentNav ? "btn-outline-light" : "btn-primary",
              )}
            >
              {t.nav.inquire}
            </button>
          </div>

          <button
            type="button"
            className={cn("lg:hidden p-2 transition-colors", transparentNav ? "text-white" : "text-[#1C1917]")}
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
          >
            {mobileOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </header>

      {mobileOpen && (
        <>
          <button
            type="button"
            className="fixed inset-0 z-40 bg-black/40 lg:hidden top-header"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          />
          <aside className="fixed top-header bottom-0 right-0 z-50 w-[min(100%,20rem)] bg-white border-l border-[#E7E0D5] overflow-y-auto lg:hidden shadow-xl">
            <nav className="p-4 space-y-1">
              {menus.map((menu) => (
                <div key={menu.id}>
                  <p className="px-3 py-2 text-xs font-semibold uppercase tracking-wide text-[#A8A29E]">
                    {menu.label}
                  </p>
                  {menu.links.map((link) => (
                    <Link
                      key={`${menu.id}-${link.href}`}
                      href={link.href}
                      className={cn(
                        "block px-3 py-2.5 text-[#1C1917] font-medium rounded-lg transition-colors",
                        isNavActive(link.href, pathname, allNavHrefs) && "bg-[#FAF8F5] text-[#c9a96e]",
                      )}
                      onClick={() => setMobileOpen(false)}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>
              ))}
              <div className="flex gap-2 px-3 pt-4 border-t border-[#E7E0D5] mt-4">
                {(["en", "hy"] as const).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLang(l)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded border",
                      lang === l ? "border-brand bg-brand text-white" : "border border-[#E7E0D5] bg-white text-[#57534E]",
                    )}
                  >
                    {l === "en" ? "EN" : "ՀՅ"}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="block w-[calc(100%-1.5rem)] mx-3 mt-3 text-center btn-primary py-3.5 rounded-lg type-button"
                onClick={() => {
                  setMobileOpen(false);
                  openConsultation();
                }}
              >
                {t.nav.inquire}
              </button>
              <a
                href="tel:+37496799733"
                className="flex items-center justify-center gap-2 mx-3 mt-2 py-3 text-sm font-semibold text-[#57534E] border border-[#E7E0D5] rounded-lg"
              >
                <Phone size={16} />
                +374 96 799733
              </a>
            </nav>
          </aside>
        </>
      )}
    </div>
  );
}
