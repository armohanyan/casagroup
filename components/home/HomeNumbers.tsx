"use client";

import { useI18n } from "@/lib/i18n";
import { AnimatedCounter } from "./AnimatedCounter";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function HomeNumbers() {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-0">
        <SectionHeader
          eyebrow={t.home.numbersEyebrow}
          title={t.home.numbersTitle}
          centered
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
          {t.home.numbers.map((stat, i) => (
            <Reveal key={stat.label} delay={i * 0.08} className="text-center">
              <AnimatedCounter
                value={stat.value}
                suffix={stat.suffix}
                className="font-display text-4xl md:text-5xl font-medium text-[#0F172A] tabular-nums"
              />
              <p className="mt-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#6B7280]">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
