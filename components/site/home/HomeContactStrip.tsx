"use client";

import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";

const WHATSAPP = "https://wa.me/37496799733";

const outlineBtn =
  "inline-flex h-9 flex-1 items-center justify-center gap-1.5 rounded-lg border border-[#c9a96e]/60 bg-transparent px-2 text-xs font-semibold text-[#f7f3eb] transition-colors hover:bg-white/10 sm:h-12 sm:flex-none sm:gap-2 sm:px-6 sm:text-sm";

export function HomeContactStrip() {
  const { t } = useI18n();

  return (
    <section className="py-14 md:py-16 bg-[#0c1428]">
      <Container className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">{t.home.contactStripTitle}</h2>
        <div className="mt-6 flex flex-nowrap justify-center gap-2 sm:mt-8 sm:flex-wrap sm:gap-3">
          <a href="tel:+37496799733" className={outlineBtn}>
            <Phone className="size-3.5 shrink-0 sm:size-[18px]" />
            <span className="truncate">{t.nav.call}</span>
          </a>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className={outlineBtn}
          >
            <MessageCircle className="size-3.5 shrink-0 sm:size-[18px]" />
            <span className="truncate">WhatsApp</span>
          </a>
          <Link href="/contact" className={outlineBtn}>
            <span className="truncate">{t.home.contactStripForm}</span>
          </Link>
        </div>
      </Container>
    </section>
  );
}
