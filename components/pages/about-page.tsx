"use client";

import Image from "next/image";
import Link from "next/link";
import { BadgeCheck, Building2, Globe2, Tag, Zap } from "lucide-react";
import { Container } from "@/components/site/Container";
import { HomeContactStrip } from "@/components/site/home/HomeContactStrip";
import { OwnerProfile } from "@/components/site/OwnerProfile";
import { Seo } from "@/components/seo/Seo";
import { siteImages } from "@/lib/site-images";
import { useI18n } from "@/lib/i18n";

const WHY_ICONS = [Globe2, Building2, Tag, Zap];

export default function AboutPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.about.title} description={t.seo.about.description} path="/about" lang={lang} />

      {/* Hero */}
      <section className="relative pt-header min-h-[340px] md:min-h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src={siteImages.hero.about}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <Container className="relative z-10 py-16 md:py-20 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] text-white tracking-tight">
            {t.about.pageTitle}
          </h1>
          <p className="mt-5 text-base md:text-lg text-white/85 max-w-2xl mx-auto leading-relaxed">
            {t.about.pageSubtitle}
          </p>
        </Container>
      </section>

      {/* Why CasaGroup — Liam two-column */}
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-start">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9a96e]">
                {t.about.whyEyebrow}
              </p>
              <h2 className="font-display text-3xl md:text-4xl text-[#0c1428] mt-3 tracking-tight leading-tight">
                {t.about.whyTitle}
              </h2>
              <p className="mt-5 text-base text-[#374151] leading-relaxed">{t.about.whyBody}</p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/contact"
                  className="inline-flex h-12 items-center px-7 rounded-md bg-[#0c1428] text-white text-sm font-semibold hover:bg-[#1F2937] transition-colors"
                >
                  {t.nav.contact}
                </Link>
                <Link
                  href="/projects"
                  className="inline-flex h-12 items-center px-7 rounded-md border border-[#E5E7EB] text-[#0c1428] text-sm font-semibold hover:border-[#0c1428] transition-colors"
                >
                  {t.about.storyCta}
                </Link>
              </div>
            </div>

            <div className="space-y-0">
              {t.home.whyMinimal.map((item, i) => {
                const Icon = WHY_ICONS[i] ?? BadgeCheck;
                return (
                  <div
                    key={item.title}
                    className="flex gap-5 py-8 border-b border-[#E8EAED] last:border-b-0 first:pt-0"
                  >
                    <div className="shrink-0 pt-0.5">
                      <Icon size={22} className="text-[#c9a96e]" strokeWidth={1.5} />
                    </div>
                    <div className="border-l border-[#E8EAED] pl-6">
                      <h3 className="font-semibold text-[#0c1428]">{item.title}</h3>
                      <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Container>
      </section>

      <OwnerProfile />
      <HomeContactStrip />
    </main>
  );
}
