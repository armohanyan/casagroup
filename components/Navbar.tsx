import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ExternalLink, Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { t, lang, setLang } = useI18n();

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handler, { passive: true });
    return () => window.removeEventListener("scroll", handler);
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      setMobileOpen(false);
    });
  }, [pathname]);

  const navLinks = [
    { label: t.nav.about, href: "/about" },
    { label: t.nav.services, href: "/services" },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.academy, href: "/#academy" },
    { label: t.nav.faq, href: "/#faq" },
    { label: t.nav.contact, href: "/contact" },
  ];

  /** Armenian labels need more horizontal space; switch to full nav + CTA a bit later. */
  const desktopNavFrom = lang === "hy" ? "xl" : "lg";
  const desktopNavHidden = desktopNavFrom === "xl" ? "hidden xl:flex" : "hidden lg:flex";
  const mobileBarVisible = desktopNavFrom === "xl" ? "xl:hidden" : "lg:hidden";

  return (
    <>
      <motion.header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? "bg-[#0C1428]/95 backdrop-blur-md border-b border-[#1e2d4a]" : "bg-transparent"
        }`}
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-10 min-h-20 py-2 flex items-center justify-between gap-4">
          {/* Logo */}
          <Link href="/" className="shrink-0">
            <span className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light tracking-widest text-[#f0ece4] cursor-pointer select-none">
              Casa<span className="text-[#c9a96e]">Group</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav
            className={cn(
              desktopNavHidden,
              "flex-1 min-w-0 flex-wrap items-center justify-end gap-x-2 gap-y-2 sm:gap-x-3 xl:gap-x-5 2xl:gap-x-7"
            )}
          >
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href} className="shrink-0">
                <span
                  className={cn(
                    "inline-block text-center text-[10px] xl:text-xs font-medium transition-colors duration-200 cursor-pointer leading-snug",
                    lang === "en" &&
                      "whitespace-nowrap tracking-[0.18em] xl:tracking-[0.2em] uppercase",
                    lang === "hy" && "whitespace-normal tracking-normal normal-case",
                    pathname === link.href ? "text-[#c9a96e]" : "text-[#9a9085] hover:text-[#f0ece4]"
                  )}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            <a
              href="https://gortsin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0"
            >
              <span
                className={cn(
                  "inline-flex items-center gap-1.5 rounded-full border border-dashed border-[#c9a96e]/50 bg-[#c9a96e]/[0.07] px-2.5 py-1 text-[10px] xl:text-[11px] font-medium text-[#c9a96e] transition-all duration-200 hover:border-[#c9a96e] hover:bg-[#c9a96e]/15",
                  lang === "en" && "tracking-[0.14em] uppercase",
                  lang === "hy" && "tracking-normal normal-case"
                )}
              >
                {t.nav.gortsin}
                <ExternalLink className="size-2.5 shrink-0 opacity-75 xl:size-3" aria-hidden />
              </span>
            </a>

            {/* Language switcher */}
            <div className="flex shrink-0 items-center gap-1 pl-1 sm:ml-1 sm:pl-2">
              {(["en", "hy"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-sm px-2 py-1 text-xs font-medium transition-colors duration-200",
                    lang === "en" && "tracking-[0.15em] uppercase",
                    lang === "hy" && "tracking-normal normal-case",
                    lang === l
                      ? "border border-[#c9a96e]/40 text-[#c9a96e]"
                      : "text-[#9a9085] hover:text-[#f0ece4]"
                  )}
                >
                  {l === "en" ? "EN" : "ՀՅ"}
                </button>
              ))}
            </div>

            <Link
              href="/contact"
              className={cn(
                "inline-flex min-w-0 items-center justify-center self-center",
                lang === "en" && "shrink-0",
                lang === "hy" && "max-w-[11rem] shrink xl:max-w-[13rem] 2xl:max-w-none"
              )}
            >
              <span
                className={cn(
                  "inline-flex w-full min-w-0 cursor-pointer items-center justify-center rounded-sm border border-[#c9a96e] text-center text-xs font-medium text-[#c9a96e] leading-snug transition-all duration-200 whitespace-normal [text-wrap:balance] hover:bg-[#c9a96e] hover:text-[#0C1428]",
                  lang === "en" && "px-6 py-2.5 tracking-[0.2em] uppercase",
                  lang === "hy" && "px-3 py-2 tracking-wide normal-case"
                )}
              >
                {t.nav.inquire}
              </span>
            </Link>
          </nav>

          {/* Mobile / compact: lang + menu (breakpoint matches desktop nav) */}
          <div className={cn("flex items-center gap-3", mobileBarVisible)}>
            <div className="flex items-center gap-1">
              {(["en", "hy"] as const).map((l) => (
                <button
                  key={l}
                  type="button"
                  onClick={() => setLang(l)}
                  className={cn(
                    "rounded-sm px-2 py-1 text-xs font-medium transition-colors duration-200",
                    lang === "en" && "tracking-[0.15em] uppercase",
                    lang === "hy" && "tracking-normal normal-case",
                    lang === l
                      ? "border border-[#c9a96e]/40 text-[#c9a96e]"
                      : "text-[#9a9085] hover:text-[#f0ece4]"
                  )}
                >
                  {l === "en" ? "EN" : "ՀՅ"}
                </button>
              ))}
            </div>
            <button
              className="text-[#f0ece4] p-2"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </motion.header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="fixed inset-0 z-40 bg-[#0C1428] flex flex-col items-center justify-center"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <nav className="flex flex-col items-center gap-10">
              {navLinks.map((link, i) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.05 * i }}
                >
                  <Link href={link.href}>
                    <span className="font-['Cormorant_Garamond'] text-4xl font-light text-[#f0ece4] hover:text-[#c9a96e] transition-colors cursor-pointer tracking-widest">
                      {link.label}
                    </span>
                  </Link>
                </motion.div>
              ))}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 * navLinks.length }}
              >
                <a
                  href="https://gortsin.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full border-2 border-dashed border-[#c9a96e]/60 bg-[#c9a96e]/10 px-6 py-2.5 text-lg font-medium tracking-wide text-[#c9a96e] transition-colors hover:border-[#c9a96e] hover:bg-[#c9a96e]/20"
                >
                  {t.nav.gortsin}
                  <ExternalLink className="size-5 shrink-0 opacity-80" aria-hidden />
                </a>
              </motion.div>
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Link href="/contact" className="inline-flex max-w-[min(100vw-3rem,22rem)] justify-center">
                  <span
                    className={cn(
                      "inline-flex cursor-pointer items-center justify-center border border-[#c9a96e] px-8 py-3 text-center text-sm text-[#c9a96e] leading-snug transition-all whitespace-normal hover:bg-[#c9a96e] hover:text-[#0C1428]",
                      lang === "en" && "tracking-[0.25em] uppercase",
                      lang === "hy" && "tracking-wide normal-case"
                    )}
                  >
                    {t.nav.inquire}
                  </span>
                </Link>
              </motion.div>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
