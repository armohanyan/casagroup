"use client";

import Link from "next/link";
import { Calculator } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function CalculatorPromo() {
  const { t } = useI18n();

  return (
    <section className="bg-[#F3EFE8] border-y border-[#E7E0D5]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-0 py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 bg-white rounded-xl border border-[#E7E0D5] p-6 sm:p-8 shadow-sm brand-surface-top">
          <div className="flex items-start gap-4">
            <div className="hidden sm:flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-brand/8 text-brand border border-brand/10">
              <Calculator size={28} />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917]">{t.sales.calculatorTitle}</h2>
              <p className="mt-2 text-sm text-[#57534E] leading-relaxed max-w-xl">{t.sales.calculatorDesc}</p>
            </div>
          </div>
          <Link
            href="/calculator"
            className="btn-outline shrink-0 h-12 px-8 text-sm rounded-md"
          >
            {t.sales.calculatorCta}
          </Link>
        </div>
      </div>
    </section>
  );
}
