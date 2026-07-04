"use client";

import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";

const WHATSAPP = "https://wa.me/37496799733";

export function HomeContactStrip() {
  const { t } = useI18n();

  return (
    <section className="py-14 md:py-16 bg-[#0c1428]">
      <Container className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">{t.home.contactStripTitle}</h2>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <a
            href="tel:+37496799733"
            className="inline-flex h-12 items-center gap-2 px-6 rounded-lg bg-[#c9a96e] text-[#0c1428] text-sm font-semibold hover:bg-[#d4b87a]"
          >
            <Phone size={18} />
            {t.home.contactStripCall}
          </a>
          <a
            href={WHATSAPP}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-12 items-center gap-2 px-6 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:opacity-90"
          >
            <MessageCircle size={18} />
            WhatsApp
          </a>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center px-6 rounded-lg border border-white/40 text-white text-sm font-semibold hover:bg-white/10"
          >
            {t.home.contactStripForm}
          </Link>
        </div>
      </Container>
    </section>
  );
}
