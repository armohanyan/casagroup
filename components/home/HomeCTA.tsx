"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import { useConsultationModal } from "@/lib/consultation-modal";
import { siteImages } from "@/lib/site-images";
import { Reveal } from "./Reveal";

export function HomeCTA() {
  const { t } = useI18n();
  const { openConsultation } = useConsultationModal();

  return (
    <section className="relative py-24 md:py-32 overflow-hidden">
      <Image
        src={siteImages.lifestyle.building}
        alt=""
        fill
        unoptimized
        sizes="100vw"
        className="object-cover"
      />
      <div className="absolute inset-0 bg-[#0F172A]/75" />

      <div className="relative z-10 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <Reveal>
          <h2 className="font-display text-3xl md:text-5xl text-white leading-tight max-w-2xl mx-auto">
            {t.home.ctaTitle}
          </h2>
        </Reveal>
        <Reveal delay={0.15}>
          <p className="mt-6 text-base md:text-lg text-white/65 max-w-xl mx-auto leading-relaxed">
            {t.home.ctaSubtitle}
          </p>
        </Reveal>
        <Reveal delay={0.25} className="mt-10 flex flex-wrap justify-center gap-4">
          <button
            type="button"
            onClick={openConsultation}
            className="inline-flex h-12 items-center justify-center px-8 rounded-sm bg-[#C8A96A] text-[#0F172A] text-sm font-semibold tracking-wide hover:bg-[#d4b87a] transition-colors"
          >
            {t.home.ctaConsultation}
          </button>
          <Link
            href="/contact"
            className="inline-flex h-12 items-center justify-center px-8 rounded-sm border border-white/40 text-white text-sm font-semibold tracking-wide hover:bg-white/10 transition-colors"
          >
            {t.home.ctaContact}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
