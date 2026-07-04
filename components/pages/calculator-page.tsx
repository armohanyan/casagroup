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
      <Container className="py-10 max-w-2xl">
        <MortgageCalculator />
        <p className="mt-8 text-center text-sm text-[#6B7280]">
          <Link href="/contact" className="font-semibold text-[#0c1428] hover:underline">{t.calculator.ctaButton}</Link>
        </p>
      </Container>
    </main>
  );
}
