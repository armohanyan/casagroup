"use client";

import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function CalculatorPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-[#F9FAFB]">
      <Seo title={t.seo.calculator.title} description={t.seo.calculator.description} path="/calculator" lang={lang} />

      <div className="pt-header bg-white border-b border-[#E5E7EB]">
        <Container className="py-8 md:py-10">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#c9a96e]/10 text-[#c9a96e] border border-[#c9a96e]/15">
              <Calculator size={22} />
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">
                {t.calculator.eyebrow}
              </p>
              <h1 className="mt-2 text-2xl md:text-3xl font-semibold text-[#0c1428] tracking-tight">
                {t.calculator.title}
              </h1>
              <p className="mt-2 text-sm md:text-base text-[#6B7280] max-w-2xl leading-relaxed">
                {t.calculator.subtitle}
              </p>
            </div>
          </div>
        </Container>
      </div>

      <section>
        <Container className="py-8 md:py-10">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8 border border-[#E5E7EB]/70">
            <MortgageCalculator />
          </div>
        </Container>
      </section>

      <section className="bg-[#0c1428]">
        <Container className="py-10 md:py-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 text-center md:text-left">
            <div className="max-w-xl mx-auto md:mx-0">
              <h2 className="text-xl md:text-2xl font-semibold text-white tracking-tight">{t.calculator.ctaTitle}</h2>
              <p className="mt-2 text-sm text-white/70 leading-relaxed">{t.calculator.ctaSubtitle}</p>
            </div>
            <Link
              href="/contact"
              className="inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#c9a96e] px-6 text-sm font-semibold text-[#0c1428] hover:bg-[#d4b87e] transition-colors mx-auto md:mx-0"
            >
              {t.calculator.ctaButton}
              <ArrowRight size={16} aria-hidden />
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
