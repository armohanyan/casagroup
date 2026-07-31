"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle, Phone, X } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_BASE = "https://wa.me/37496799733";
const PHONE_HREF = "tel:+37496799733";

function buildWhatsAppUrl(pathname: string, lang: string): string {
  const isApartment = /\/projects\/[^/]+\/apartments\//.test(pathname);
  const isProperty = pathname.startsWith("/properties");
  const isProject = /\/projects\/[^/]+$/.test(pathname);

  let message = "";
  if (isApartment) {
    message =
      lang === "hy"
        ? `Բարև, հետաքրքրված եմ այս բնակարանով՝ ${window.location.href}`
        : `Hello, I'm interested in this apartment: ${window.location.href}`;
  } else if (isProject) {
    message =
      lang === "hy"
        ? `Բարև, ցանկանում եմ տեղեկանալ այս նախագծի մասին՝ ${window.location.href}`
        : `Hello, I'd like to learn more about this project: ${window.location.href}`;
  } else if (isProperty) {
    message =
      lang === "hy"
        ? "Բարև, ցանկանում եմ գտնել բնակարան CasaGroup-ից"
        : "Hello, I'm looking for an apartment through CasaGroup";
  } else {
    message =
      lang === "hy"
        ? "Բարև, ցանկանում եմ խորհրդատվություն ստանալ CasaGroup-ից"
        : "Hello, I'd like to get a consultation from CasaGroup";
  }

  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

export function ContactFab() {
  const pathname = usePathname();
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [whatsAppHref, setWhatsAppHref] = useState(WHATSAPP_BASE);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWhatsAppHref(buildWhatsAppUrl(pathname, lang));
  }, [pathname, lang]);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open]);

  const actionBase =
    "flex h-12 w-12 items-center justify-center rounded-full text-white shadow-lg shadow-black/15 transition-all duration-300 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]";
  const hiddenState = "pointer-events-none translate-y-3 scale-90 opacity-0";
  const shownState = "pointer-events-auto translate-y-0 scale-100 opacity-100";

  return (
    <div
      ref={rootRef}
      className="fixed bottom-20 right-4 lg:bottom-6 lg:right-6 z-40 flex flex-col items-center gap-3"
    >
      <a
        href={PHONE_HREF}
        aria-label={t.sales.callLabel}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`${actionBase} bg-[#0c1428] hover:bg-[#1a2540] ${open ? shownState : hiddenState}`}
        style={{ transitionDelay: open ? "60ms" : "0ms" }}
      >
        <Phone size={20} aria-hidden />
      </a>
      <a
        href={whatsAppHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={t.sales.whatsappLabel}
        aria-hidden={!open}
        tabIndex={open ? 0 : -1}
        onClick={() => setOpen(false)}
        className={`${actionBase} bg-[#25D366] hover:bg-[#20bd5a] ${open ? shownState : hiddenState}`}
      >
        <FaWhatsapp size={24} aria-hidden />
      </a>
      <button
        type="button"
        aria-label={t.sales.contactFabLabel}
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        className="flex h-14 w-14 items-center justify-center rounded-full bg-[#c9a96e] text-white shadow-lg shadow-black/20 transition-all hover:scale-105 hover:bg-[#b8975c] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#0c1428]"
      >
        <span className="relative flex h-7 w-7 items-center justify-center">
          <MessageCircle
            size={26}
            aria-hidden
            className={`absolute transition-all duration-200 ${open ? "rotate-90 scale-50 opacity-0" : "rotate-0 scale-100 opacity-100"}`}
          />
          <X
            size={26}
            aria-hidden
            className={`absolute transition-all duration-200 ${open ? "rotate-0 scale-100 opacity-100" : "-rotate-90 scale-50 opacity-0"}`}
          />
        </span>
      </button>
    </div>
  );
}
