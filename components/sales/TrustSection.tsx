"use client";

import Image from "next/image";
import { Shield, TrendingUp, Building2, Landmark } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { siteImages } from "@/lib/site-images";

const STATS = [
  { value: "12+", key: "projects" as const },
  { value: "500+", key: "units" as const },
  { value: "8", key: "developers" as const },
  { value: "15+", key: "years" as const },
];

const BANKS = ["Ameriabank", "ACBA", "Inecobank", "Ardshinbank"];

export function TrustSection() {
  const { t } = useI18n();

  const highlights = [
    { icon: Shield, title: t.trust.verifiedTitle, desc: t.trust.verifiedDesc },
    { icon: Building2, title: t.trust.developerTitle, desc: t.trust.developerDesc },
    { icon: TrendingUp, title: t.trust.investmentTitle, desc: t.trust.investmentDesc },
    { icon: Landmark, title: t.trust.mortgageTitle, desc: t.trust.mortgageDesc },
  ];

  return (
    <section className="py-14 sm:py-16 bg-white border-y border-[#E7E0D5]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          <div>
            <p className="brand-eyebrow">{t.trust.eyebrow}</p>
            <h2 className="type-section-heading text-[#1C1917] section-heading">{t.trust.title}</h2>
            <p className="type-body text-[#57534E] mt-4 max-w-lg">{t.trust.subtitle}</p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
              {STATS.map((stat) => (
                <div key={stat.key} className="text-center sm:text-left">
                  <p className="text-2xl font-bold text-brand tabular-nums">{stat.value}</p>
                  <p className="text-xs text-[#A8A29E] mt-0.5">{t.trust.stats[stat.key]}</p>
                </div>
              ))}
            </div>

            <div className="mt-8">
              <p className="type-label text-[#A8A29E] mb-3">{t.trust.partnerBanks}</p>
              <div className="flex flex-wrap gap-2">
                {BANKS.map((bank) => (
                  <span
                    key={bank}
                    className="px-3 py-1.5 text-xs font-medium text-[#57534E] bg-[#FAF8F5] border border-[#E7E0D5] rounded-md"
                  >
                    {bank}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] rounded-2xl overflow-hidden shadow-lg">
              <Image
                src={siteImages.lifestyle.interior}
                alt=""
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-brand/40 to-transparent" />
            </div>
            <div className="absolute -bottom-4 -left-4 sm:-bottom-6 sm:-left-6 hidden sm:block">
              <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-xl overflow-hidden border-4 border-white shadow-lg">
                <Image
                  src={siteImages.lifestyle.building}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {highlights.map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="card-premium p-5 hover:translate-y-[-2px]"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand/5 border border-brand/10 mb-3">
                <Icon size={18} className="text-[#c9a96e]" />
              </div>
              <h3 className="type-card-title text-[#1C1917]">{title}</h3>
              <p className="text-sm text-[#57534E] mt-1.5 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
