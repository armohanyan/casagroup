"use client";

import Image from "next/image";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";

const OWNER_PHOTO = "/owner.jpg";

export function OwnerProfile() {
  const { t } = useI18n();

  return (
    <section id="owner" className="py-16 md:py-24 bg-white border-t border-[#F0F1F3]">
      <Container className="max-w-5xl">
        <div className="flex flex-col md:flex-row gap-8 md:gap-14 items-stretch md:items-start">
          <div className="relative w-full md:w-80 lg:w-96 shrink-0">
            <div className="relative aspect-[4/5] md:aspect-[3/4] rounded-[5px] overflow-hidden bg-[#F3F4F6] shadow-[0_16px_48px_rgba(15,23,42,0.12)] ring-1 ring-[#E8EAED]">
              <Image
                src={OWNER_PHOTO}
                alt={t.owner.name}
                fill
                unoptimized
                sizes="(max-width: 768px) 100vw, 384px"
                className="object-cover object-top"
                priority
              />
            </div>
            <div className="absolute -bottom-3 -right-3 w-24 h-24 rounded-[5px] bg-[#c9a96e]/15 -z-10 hidden md:block" aria-hidden />
          </div>

          <div className="flex-1 w-full text-center md:text-left">
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9a96e]">{t.owner.role}</p>
            <h2 className="mt-2 font-display text-3xl md:text-4xl text-[#0c1428] tracking-tight">{t.owner.name}</h2>
            <p className="mt-5 text-base md:text-lg text-[#374151] leading-relaxed">
              {t.owner.bio}
            </p>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 sm:gap-8 text-sm text-[#6B7280] justify-center md:justify-start">
              <a href="tel:+37496799733" className="hover:text-[#0c1428] transition-colors font-medium">
                +374 96 799733
              </a>
              <a href="mailto:casagroup@gmail.com" className="hover:text-[#0c1428] transition-colors font-medium">
                casagroup@gmail.com
              </a>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
