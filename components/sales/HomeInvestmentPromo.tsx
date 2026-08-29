"use client";

import Link from "next/link";
import { TrendingUp } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function HomeInvestmentPromo() {
  const { t } = useI18n();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-0">
        <div className="rounded-2xl border border-[#E7E0D5] bg-[#FAF8F5] overflow-hidden brand-surface-top">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 p-6 sm:p-8 lg:p-10">
            <div>
              <p className="brand-eyebrow">{t.home.investEyebrow}</p>
              <h2 className="type-section-heading text-[#1C1917] section-heading">{t.home.investTitle}</h2>
              <p className="type-body text-[#57534E] mt-4 leading-relaxed">{t.home.investSubtitle}</p>
              <Link
                href="/investment"
                className="btn-primary inline-flex h-11 items-center px-6 mt-6 rounded-md type-button"
              >
                {t.home.investCta}
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3 gap-3 content-start">
              {t.home.investHighlights.map((item) => (
                <div
                  key={item.stat}
                  className="flex flex-col p-4 rounded-xl bg-white border border-[#E7E0D5] shadow-sm shadow-black/[0.02]"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp size={14} className="text-[#c9a96e] shrink-0" />
                    <p className="text-2xl font-bold text-[#c9a96e] tabular-nums">{item.stat}</p>
                  </div>
                  <p className="text-sm text-[#57534E] leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
