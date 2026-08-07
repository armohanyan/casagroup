"use client";

import { useMemo } from "react";
import { Seo } from "@/components/seo/Seo";
import { HomeHero } from "@/components/site/home/HomeHero";
import { HomeFeaturedProjects } from "@/components/site/home/HomeFeaturedProjects";
import { HomeProjectsMap } from "@/components/site/home/HomeProjectsMap";
import { HomeWhy } from "@/components/site/home/HomeWhy";
import { OwnerProfile } from "@/components/site/OwnerProfile";
import { FaqSection } from "@/components/site/FaqSection";
import { HomeContactStrip } from "@/components/site/home/HomeContactStrip";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";

export default function HomePage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();

  const featured = useMemo(() => {
    const marked = projects.filter((p) => p.featured);
    return marked.length > 0 ? marked : projects;
  }, [projects]);

  const startingPrice = useMemo(() => {
    const prices = featured.map((p) => p.startingPrice).filter((p) => p > 0);
    if (prices.length === 0) return undefined;
    return Math.min(...prices);
  }, [featured]);

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.home.title} description={t.seo.home.description} path="/" lang={lang} />
      <HomeHero />
      <HomeFeaturedProjects projects={featured} />
      <HomeProjectsMap projects={projects} />
      <HomeWhy />

      <section id="mortgage" className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
        <Container className="py-10 md:py-14">
          <div className="mb-8 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">
              {t.calculator.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-[#0c1428] sm:text-2xl">
              {t.calculator.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
              {t.calculator.subtitle}
            </p>
          </div>
          <div className="rounded-[5px] bg-white p-5 shadow-sm sm:p-8">
            <MortgageCalculator initialPrice={startingPrice} />
          </div>
        </Container>
      </section>

      <FaqSection previewCount={5} />
      <OwnerProfile />
      <HomeContactStrip />
    </main>
  );
}
