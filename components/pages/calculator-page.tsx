"use client";

import Link from "next/link";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { PageIntro } from "@/components/site/PageIntro";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function CalculatorPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.calculator.title} description={t.seo.calculator.description} path="/calculator" lang={lang} />
      <PageIntro title={t.calculator.title} subtitle={t.calculator.subtitle} />
      <section className="bg-[#F9FAFB] border-t border-[#E5E7EB]">
        <Container className="py-10 md:py-14">
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
            <MortgageCalculator />
          </div>
          <div className="mt-10 text-center">
            <Link
              href="/contact"
              className="inline-flex h-11 items-center rounded-lg bg-[#0c1428] px-6 text-sm font-semibold text-white hover:bg-[#1F2937]"
            >
              {t.calculator.ctaButton}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
