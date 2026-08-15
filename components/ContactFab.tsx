"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Phone, X } from "lucide-react";
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
        : lang === "ru"
          ? `Здравствуйте, меня интересует эта квартира: ${window.location.href}`
          : `Hello, I'm interested in this apartment: ${window.location.href}`;
  } else if (isProject) {
    message =
      lang === "hy"
        ? `Բարև, ցանկանում եմ տեղեկանալ այս նախագծի մասին՝ ${window.location.href}`
        : lang === "ru"
          ? `Здравствуйте, хочу узнать больше об этом проекте: ${window.location.href}`
          : `Hello, I'd like to learn more about this project: ${window.location.href}`;
  } else if (isProperty) {
    message =
      lang === "hy"
        ? "Բարև, ցանկանում եմ գտնել բնակարան CasaGroup-ից"
        : lang === "ru"
          ? "Здравствуйте, ищу квартиру через CasaGroup"
          : "Hello, I'm looking for an apartment through CasaGroup";
  } else {
    message =
      lang === "hy"
        ? "Բարև, ցանկանում եմ խորհրդատվություն ստանալ CasaGroup-ից"
        : lang === "ru"
          ? "Здравствуйте, хочу получить консультацию в CasaGroup"
          : "Hello, I'd like to get a consultation from CasaGroup";
  }

  return `${WHATSAPP_BASE}?text=${encodeURIComponent(message)}`;
}

const BUBBLE_INTERVAL_MS = 5000;
const BUBBLE_VISIBLE_MS = 4000;

export function ContactFab() {
  const pathname = usePathname();
  const { lang, t } = useI18n();
  const [open, setOpen] = useState(false);
  const [bubbleVisible, setBubbleVisible] = useState(false);
  const [whatsAppHref, setWhatsAppHref] = useState(WHATSAPP_BASE);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setWhatsAppHref(buildWhatsAppUrl(pathname, lang));
  }, [pathname, lang]);

  useEffect(() => {
    if (open) {
      setBubbleVisible(false);
      return;
    }

    let showTimer: ReturnType<typeof setTimeout>;
    let hideTimer: ReturnType<typeof setTimeout>;

    const schedule = () => {
      showTimer = setTimeout(() => {
        setBubbleVisible(true);
        hideTimer = setTimeout(() => {
          setBubbleVisible(false);
          schedule();
        }, BUBBLE_VISIBLE_MS);
      }, BUBBLE_INTERVAL_MS);
    };

    schedule();

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [open]);

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
      className="fixed bottom-20 right-4 z-40 lg:bottom-6 lg:right-6"
    >
      <div
        className={`absolute bottom-[calc(100%+0.75rem)] right-0 flex flex-col items-end gap-3 ${
          open ? "pointer-events-auto" : "pointer-events-none"
        }`}
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
      </div>

      <div className="relative">
        <button
          type="button"
          aria-hidden={!bubbleVisible || open}
          tabIndex={bubbleVisible && !open ? 0 : -1}
          onClick={() => setOpen(true)}
          className={`absolute right-16 top-1/2 z-10 -translate-y-1/2 whitespace-nowrap rounded-2xl bg-white px-3.5 py-2 text-sm font-medium text-[#0c1428] shadow-lg shadow-black/15 ring-1 ring-black/5 transition-all duration-300 hover:bg-[#faf8f5] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e] ${
            bubbleVisible && !open
              ? "pointer-events-auto translate-x-0 scale-100 opacity-100"
              : "pointer-events-none translate-x-2 scale-95 opacity-0"
          }`}
        >
          {t.sales.contactFabBubble}
          <span
            aria-hidden
            className="absolute top-1/2 right-0 h-0 w-0 translate-x-full -translate-y-1/2 border-y-[6px] border-l-[8px] border-y-transparent border-l-white drop-shadow-sm"
          />
        </button>

        <button
          type="button"
          aria-label={t.sales.contactFabLabel}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
          className="relative h-14 w-14 overflow-hidden rounded-full shadow-lg shadow-black/20 ring-2 ring-white transition-all hover:scale-105 hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e]"
        >
          <Image
            src="/assistant-casagroup.jpg"
            alt=""
            fill
            sizes="56px"
            className={`object-cover object-[center_18%] transition-all duration-200 ${
              open ? "scale-110 brightness-75" : "scale-100 brightness-100"
            }`}
            priority
          />
          <span
            aria-hidden
            className={`absolute inset-0 flex items-center justify-center bg-[#0c1428]/55 transition-all duration-200 ${
              open ? "opacity-100" : "opacity-0"
            }`}
          >
            <X size={22} className="text-white" />
          </span>
        </button>
      </div>
    </div>
  );
}
