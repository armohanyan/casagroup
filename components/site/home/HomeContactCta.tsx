"use client";

import Link from "next/link";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import { useConsultationModal } from "@/lib/consultation-modal";

export function HomeContactCta() {
  const { t } = useI18n();
  const { openConsultation } = useConsultationModal();

  return (
    <section className="py-16 md:py-20 bg-[#0c1428]">
      <Container className="text-center">
        <h2 className="text-2xl md:text-3xl font-semibold text-white">{t.home.ctaTitle}</h2>
        <p className="mt-3 text-base text-white/70 max-w-lg mx-auto">{t.home.ctaSubtitleShort}</p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={openConsultation}
            className="inline-flex h-12 items-center px-6 rounded-lg bg-white text-[#0c1428] text-sm font-semibold hover:bg-[#F3F4F6] transition-colors"
          >
            {t.home.ctaConsultation}
          </button>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center px-6 rounded-lg border border-white/40 text-white text-sm font-semibold hover:bg-white/10 transition-colors"
          >
            {t.home.ctaContact}
          </Link>
        </div>
      </Container>
    </section>
  );
}
