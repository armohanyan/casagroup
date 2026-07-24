"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { FaWhatsapp } from "react-icons/fa";
import { useI18n } from "@/lib/i18n";

const WHATSAPP_BASE = "https://wa.me/37496799733";

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

export function WhatsAppButton() {
  const pathname = usePathname();
  const { lang, t } = useI18n();
  const [href, setHref] = useState(WHATSAPP_BASE);

  useEffect(() => {
    setHref(buildWhatsAppUrl(pathname, lang));
  }, [pathname, lang]);

  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={t.sales.whatsappLabel}
      className="fixed bottom-20 right-4 sm:bottom-6 sm:right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg shadow-black/15 transition-all hover:scale-105 hover:bg-[#20bd5a] hover:shadow-xl focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#c9a96e] lg:bottom-6"
    >
      <FaWhatsapp size={28} aria-hidden />
    </a>
  );
}
