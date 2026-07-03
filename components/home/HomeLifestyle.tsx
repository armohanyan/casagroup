"use client";

import Image from "next/image";
import { useI18n } from "@/lib/i18n";
import { siteImages } from "@/lib/site-images";
import { Reveal } from "./Reveal";

export function HomeLifestyle() {
  const { t } = useI18n();

  return (
    <section className="relative py-16 md:py-0 bg-[#0F172A] overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[560px]">
        <div className="relative h-[320px] lg:h-auto">
          <Image
            src={siteImages.lifestyle.interior}
            alt=""
            fill
            unoptimized
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="flex items-center px-6 sm:px-10 lg:px-16 py-16 lg:py-24">
          <div className="max-w-lg">
            <Reveal>
              <p className="text-xs font-semibold uppercase tracking-[0.2em] text-[#C8A96A] mb-4">
                {t.home.lifestyleEyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.1}>
              <h2 className="font-display text-3xl md:text-4xl text-white leading-tight">
                {t.home.lifestyleTitle}
              </h2>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-6 text-base text-white/65 leading-relaxed">{t.home.lifestyleBody}</p>
            </Reveal>
            <Reveal delay={0.3}>
              <blockquote className="mt-10 pl-6 border-l-2 border-[#C8A96A] font-display text-xl text-white/90 italic">
                {t.home.lifestyleQuote}
              </blockquote>
            </Reveal>
          </div>
        </div>
      </div>

      <div className="hidden lg:block absolute bottom-0 right-0 w-1/3 h-2/3 pointer-events-none">
        <Image
          src={siteImages.lifestyle.family}
          alt=""
          fill
          unoptimized
          sizes="33vw"
          className="object-cover object-left opacity-20"
        />
      </div>
    </section>
  );
}
