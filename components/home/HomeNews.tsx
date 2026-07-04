"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function HomeNews() {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 md:mb-16">
          <SectionHeader
            eyebrow={t.home.newsEyebrow}
            title={t.home.newsTitle}
            subtitle={t.home.newsSubtitle}
            className="mb-0"
          />
          <Link
            href="/blog"
            className="shrink-0 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52] transition-colors"
          >
            {t.sales.viewAll} →
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
          {t.home.newsItems.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <Link
                href="/blog"
                className="group block h-full bg-white rounded-lg border border-[#E2E8F0] p-6 md:p-8 hover:border-[#c9a96e]/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-[#c9a96e]">
                    {item.category}
                  </span>
                  <span className="text-xs text-[#6B7280]">{item.date}</span>
                </div>
                <h3 className="font-display text-lg text-[#0F172A] leading-snug group-hover:text-[#c9a96e] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-3 text-sm text-[#6B7280] leading-relaxed line-clamp-3">{item.excerpt}</p>
                <span className="mt-6 inline-flex items-center gap-1 text-sm font-semibold text-[#0F172A] group-hover:text-[#c9a96e] transition-colors">
                  {t.home.readMore}
                  <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
