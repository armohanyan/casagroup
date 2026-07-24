"use client";

import {
  Building2,
  Clock,
  CreditCard,
  Landmark,
  MapPin,
  ShieldCheck,
} from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const ICONS = [ShieldCheck, MapPin, CreditCard, Building2, Landmark, Clock];

export function HomeWhyCards() {
  const { t } = useI18n();

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t.home.whyCardsEyebrow}
          title={t.home.whyCardsTitle}
          subtitle={t.home.whyCardsSubtitle}
          centered
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {t.home.whyCards.map((card, i) => {
            const Icon = ICONS[i] ?? ShieldCheck;
            return (
              <Reveal key={card.title} delay={i * 0.06}>
                <div className="group h-full p-8 rounded-lg border border-[#E2E8F0] bg-[#F8FAFC] hover:bg-white hover:border-[#c9a96e]/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(15,23,42,0.08)] transition-all duration-300">
                  <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-[#0F172A] text-[#c9a96e] mb-6 group-hover:scale-105 transition-transform">
                    <Icon size={22} strokeWidth={1.5} />
                  </div>
                  <h3 className="font-display text-xl text-[#0F172A] mb-3">{card.title}</h3>
                  <p className="text-sm text-[#6B7280] leading-relaxed">{card.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
