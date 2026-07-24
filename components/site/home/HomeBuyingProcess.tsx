"use client";

import { Container } from "@/components/site/Container";
import { SectionHeading } from "@/components/site/SectionHeading";
import { useI18n } from "@/lib/i18n";

export function HomeBuyingProcess() {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-20 bg-white">
      <Container>
        <SectionHeading title={t.home.buyingProcessTitle} subtitle={t.home.buyingProcessSubtitle} centered />
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          {t.home.buyingProcessSteps.map((step) => (
            <li key={step.title} className="text-center md:text-left">
              <span className="inline-flex w-10 h-10 items-center justify-center rounded-full bg-[#0c1428] text-white text-sm font-semibold mb-4">
                {step.step}
              </span>
              <h3 className="text-lg font-semibold text-[#0c1428]">{step.title}</h3>
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{step.desc}</p>
            </li>
          ))}
        </ol>
      </Container>
    </section>
  );
}
