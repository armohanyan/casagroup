"use client";

import { BadgeCheck, Building2, Tag, Zap } from "lucide-react";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";

const ICONS = [BadgeCheck, Building2, Tag, Zap];

export function HomeWhy() {
  const { t } = useI18n();

  return (
    <section className="py-14 md:py-16 bg-white">
      <Container>
        <h2 className="text-2xl font-semibold text-[#0c1428] mb-8">{t.home.whyMinimalTitle}</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {t.home.whyMinimal.map((item, i) => {
            const Icon = ICONS[i] ?? BadgeCheck;
            return (
              <div key={item.title} className="p-5 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                <Icon size={22} className="text-[#c9a96e] mb-3" strokeWidth={1.5} />
                <h3 className="font-semibold text-[#0c1428] text-sm">{item.title}</h3>
                <p className="mt-1.5 text-sm text-[#6B7280]">{item.desc}</p>
              </div>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
