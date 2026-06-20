import { useMemo } from "react";
import Link from "next/link";
import { Seo } from "@/components/seo/Seo";
import { PageHero } from "@/components/sales/PageHero";
import { ListingSearchPanel } from "@/components/sales/ListingSearchPanel";
import { DeveloperCarouselCard } from "@/components/sales/DeveloperCarouselCard";
import { CompactListingCard } from "@/components/sales/CompactListingCard";
import { HorizontalScroll } from "@/components/sales/HorizontalScroll";
import { CalculatorPromo } from "@/components/sales/CalculatorPromo";
import { HomeInvestmentPromo } from "@/components/sales/HomeInvestmentPromo";
import { TrustSection } from "@/components/sales/TrustSection";
import { RecentlyViewedSection } from "@/components/sales/RecentlyViewedSection";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { getAvailableProperties } from "@/lib/properties";
import { siteImages } from "@/lib/site-images";

export default function HomePage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const CITIES = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);
  const developerProjects = useMemo(
    () => (projects.filter((p) => p.featured).length > 0 ? projects.filter((p) => p.featured) : projects),
    [projects],
  );
  const listings = useMemo(() => getAvailableProperties(projects).slice(0, 12), [projects]);

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo title={t.seo.home.title} description={t.seo.home.description} path="/" lang={lang} />

      <PageHero
        overlap
        image={siteImages.hero.home}
        title={
          <>
            {t.home.heroTitle1}{" "}
            <span className="text-[#c9a96e]">{t.home.heroTitle2}</span>
          </>
        }
        subtitle={t.home.heroSubtitle}
        action={
          <div className="flex flex-wrap gap-3">
            <Link href="/properties" className="btn-primary h-11 px-6 rounded-md type-button">
              {t.home.heroCtaSearch}
            </Link>
            <Link href="/contact" className="btn-outline-light h-11 px-6 rounded-md type-button">
              {t.home.heroCtaConsultation}
            </Link>
          </div>
        }
      >
        <ListingSearchPanel cities={CITIES} projects={projects} />
      </PageHero>

      <section className="pt-4 sm:pt-6 pb-10 bg-[#F6F7FB]">
        <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="type-section-heading text-[#1C1917] section-heading mb-6">{t.sales.fromDevelopers}</h2>
          <HorizontalScroll>
            {developerProjects.map((project) => (
              <div key={project.id} className="snap-start">
                <DeveloperCarouselCard project={project} />
              </div>
            ))}
          </HorizontalScroll>
        </div>
      </section>

      <TrustSection />

      <CalculatorPromo />

      {listings.length > 0 && (
        <section className="py-10 bg-white border-y border-[#E7E0D5]">
          <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="type-section-heading text-[#1C1917] section-heading">{t.sales.urgentListings}</h2>
              <Link href="/properties" className="text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]">
                {t.sales.viewAll} →
              </Link>
            </div>
            <HorizontalScroll>
              {listings.map((listing) => (
                <div key={`${listing.project.id}-${listing.apartment.id}`} className="snap-start">
                  <CompactListingCard listing={listing} />
                </div>
              ))}
            </HorizontalScroll>
          </div>
        </section>
      )}

      <RecentlyViewedSection />
      <HomeInvestmentPromo />
    </main>
  );
}
