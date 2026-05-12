import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [location] = useLocation();
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
  }, [location]);

  const navLinks = [
    { label: t.nav.home, href: "/" },
    { label: t.nav.about, href: "/about" },
    { label: t.nav.services, href: "/services" },
    { label: t.nav.projects, href: "/projects" },
    { label: t.nav.academy, href: "/#academy" },
    { label: t.nav.faq, href: "/#faq" },
    { label: t.nav.contact, href: "/contact" },
  ];

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
        <div className="max-w-7xl mx-auto px-6 lg:px-10 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/">
            <span className="font-['Cormorant_Garamond'] text-xl sm:text-2xl font-light tracking-widest text-[#f0ece4] cursor-pointer select-none">
              Casa<span className="text-[#c9a96e]">Group</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <span
                  className={`text-[10px] xl:text-xs tracking-[0.18em] xl:tracking-[0.2em] uppercase font-medium transition-colors duration-200 cursor-pointer ${
                    location === link.href ? "text-[#c9a96e]" : "text-[#9a9085] hover:text-[#f0ece4]"
                  }`}
                >
                  {link.label}
                </span>
              </Link>
            ))}

            {/* Language switcher */}
            <div className="flex items-center gap-1 ml-2">
              {(["en", "hy"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs tracking-[0.15em] uppercase font-medium px-2 py-1 rounded-sm transition-colors duration-200 ${
                    lang === l
                      ? "text-[#c9a96e] border border-[#c9a96e]/40"
                      : "text-[#9a9085] hover:text-[#f0ece4]"
                  }`}
                >
                  {l === "en" ? "EN" : "ՀՅ"}
                </button>
              ))}
            </div>

            <Link href="/contact">
              <span className="px-6 py-2.5 border border-[#c9a96e] text-[#c9a96e] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#c9a96e] hover:text-[#0C1428] transition-all duration-200 cursor-pointer rounded-sm">
                {t.nav.inquire}
              </span>
            </Link>
          </nav>

          {/* Mobile: lang + menu */}
          <div className="md:hidden flex items-center gap-3">
            <div className="flex items-center gap-1">
              {(["en", "hy"] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => setLang(l)}
                  className={`text-xs tracking-[0.15em] uppercase font-medium px-2 py-1 rounded-sm transition-colors duration-200 ${
                    lang === l
                      ? "text-[#c9a96e] border border-[#c9a96e]/40"
                      : "text-[#9a9085] hover:text-[#f0ece4]"
                  }`}
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
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
                <Link href="/contact">
                  <span className="px-8 py-3 border border-[#c9a96e] text-[#c9a96e] text-sm tracking-[0.25em] uppercase cursor-pointer hover:bg-[#c9a96e] hover:text-[#0C1428] transition-all">
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
