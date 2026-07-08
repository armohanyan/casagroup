"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { siteImages } from "@/lib/site-images";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { Container } from "@/components/site/Container";
import { PropertySearchBar } from "@/components/site/PropertySearchBar";

export function HomeHero() {
  const { t } = useI18n();
  const { projects } = useProjects();
  const pathname = usePathname();
  const cities = [...new Set(projects.map((p) => p.city))];
  const listings = projects.reduce((n, p) => n + p.availableApartmentsCount, 0);

  return (
    <section className={`relative overflow-hidden bg-[#0c1428] ${pathname === "/" ? "min-h-[88vh] flex items-end" : ""}`}>
      <Image src={siteImages.hero.home} alt="" fill priority unoptimized sizes="100vw" className="object-cover opacity-60" />
      <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/20 to-black/70" />
      <Container className="relative z-10 w-full pb-10 pt-28 md:pt-36 md:pb-14">
        <div className="max-w-3xl">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-[2.75rem] font-semibold text-white leading-snug tracking-tight">
            {t.home.heroHeadline}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-white/85 max-w-xl leading-relaxed">{t.home.heroSubline}</p>
        </div>

        <div className="mt-8 max-w-5xl">
          <PropertySearchBar cities={cities} variant="hero" />
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/projects" className="inline-flex h-11 items-center px-6 rounded-lg bg-white text-[#0c1428] text-sm font-semibold hover:bg-[#F3F4F6] transition-colors shadow-sm">
            {t.home.heroCtaProjects}
          </Link>
          <a href="tel:+37496799733" className="inline-flex h-11 items-center px-6 rounded-lg bg-[#c9a96e] text-[#0c1428] text-sm font-semibold hover:bg-[#d4b87a] transition-colors shadow-sm">
            {t.home.heroCtaAgent}
          </a>
        </div>

        <dl className="mt-12 flex flex-wrap gap-8 md:gap-14">
          {[
            { value: t.home.trustYears, label: t.home.trustYearsLabel },
            { value: String(listings), label: t.home.trustListings },
            { value: String(cities.length), label: t.home.trustLocations },
          ].map((item) => (
            <div key={item.label} className="drop-shadow-[0_2px_8px_rgba(0,0,0,0.4)]">
              <dt className="text-2xl md:text-3xl font-semibold text-white tabular-nums">{item.value}</dt>
              <dd className="text-sm text-white/90 mt-1 font-medium">{item.label}</dd>
            </div>
          ))}
        </dl>
      </Container>
    </section>
  );
}
