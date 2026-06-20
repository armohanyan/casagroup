import Link from "next/link";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { PageHero } from "@/components/sales/PageHero";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function CalculatorPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo
        title={t.seo.calculator.title}
        description={t.seo.calculator.description}
        path="/calculator"
        lang={lang}
      />

      <PageHero title={t.calculator.title} subtitle={t.calculator.subtitle} />

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <MortgageCalculator />
      </section>

      <section className="py-12 bg-white border-t border-[#E7E0D5]">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-xl font-bold text-[#1C1917] mb-4">{t.calculator.ctaTitle}</h2>
          <p className="text-sm text-[#57534E] mb-6">{t.calculator.ctaSubtitle}</p>
          <Link
            href="/contact"
            className="btn-outline inline-block px-8 py-3 text-sm font-semibold rounded-lg"
          >
            {t.calculator.ctaButton}
          </Link>
        </div>
      </section>
    </main>
  );
}
