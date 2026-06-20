"use client";

import { Suspense, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { CompactListingCard } from "@/components/sales/CompactListingCard";
import { ListingSearchPanel } from "@/components/sales/ListingSearchPanel";
import { PageHero } from "@/components/sales/PageHero";
import { Seo } from "@/components/seo/Seo";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { useProjects } from "@/lib/projects-context";
import { useI18n } from "@/lib/i18n";
import { PropertiesViewToggle } from "@/components/sales/PropertiesViewToggle";
import { getAllProperties } from "@/lib/properties";
import { filterListingsFromSearchParams } from "@/lib/property-search";
import { siteImages } from "@/lib/site-images";

function PropertiesResults() {
  const { t } = useI18n();
  const { projects } = useProjects();
  const searchParams = useSearchParams();

  const allListings = useMemo(() => getAllProperties(projects), [projects]);
  const [statusFilter] = useState("");

  const filtered = useMemo(
    () => filterListingsFromSearchParams(allListings, searchParams, statusFilter),
    [allListings, searchParams, statusFilter],
  );

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <p className="type-body text-[#57534E]">
          {t.properties.showing}{" "}
          <span className="font-semibold text-[#1C1917]">{filtered.length}</span>{" "}
          {filtered.length !== 1 ? t.properties.propertiesWord : t.properties.propertyWord}
        </p>
        <PropertiesViewToggle view="grid" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E7E0D5] card-premium">
          <div className="relative w-48 h-32 mx-auto mb-6 rounded-lg overflow-hidden">
            <Image src={siteImages.empty.noResults} alt="" fill sizes="192px" className="object-cover opacity-80" />
          </div>
          <p className="text-lg font-semibold text-[#1C1917] mb-2">{t.properties.noResults}</p>
          <p className="text-sm text-[#A8A29E] mb-6">{t.properties.noResultsHint}</p>
          <Link href="/projects" className="btn-primary inline-flex h-10 px-6 rounded-md type-button">
            {t.properties.viewDevelopment}
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((listing) => (
            <CompactListingCard
              key={`${listing.project.id}-${listing.apartment.id}`}
              listing={listing}
              fullWidth
            />
          ))}
        </div>
      )}
    </>
  );
}

function PropertiesResultsSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between gap-4">
        <div className="h-5 w-40 rounded skeleton" />
        <div className="h-11 w-48 rounded-lg skeleton" />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-72 rounded-xl skeleton" />
        ))}
      </div>
    </div>
  );
}

export default function PropertiesPage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const CITIES = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo
        title={t.seo.properties.title}
        description={t.seo.properties.description}
        path="/properties"
        lang={lang}
      />

      <PageHero
        title={t.properties.title}
        subtitle={t.properties.subtitle}
        image={siteImages.hero.properties}
        overlap
      >
        <ListingSearchPanel cities={CITIES} projects={projects} />
      </PageHero>

      <section className="pt-4 sm:pt-6 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <Breadcrumbs
          items={[
            { label: t.nav.home, href: "/" },
            { label: t.nav.apartments },
          ]}
          className="mb-6 text-[#A8A29E]"
        />

        <Suspense fallback={<PropertiesResultsSkeleton />}>
          <PropertiesResults />
        </Suspense>
      </section>
    </main>
  );
}
