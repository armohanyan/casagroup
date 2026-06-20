"use client";

import dynamic from "next/dynamic";
import { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ListingSearchPanel } from "@/components/sales/ListingSearchPanel";
import { MapListingCard } from "@/components/sales/MapListingCard";
import { PageHero } from "@/components/sales/PageHero";
import { PropertiesViewToggle } from "@/components/sales/PropertiesViewToggle";
import { Seo } from "@/components/seo/Seo";
import { useProjects } from "@/lib/projects-context";
import { useI18n } from "@/lib/i18n";
import { getAllProperties } from "@/lib/properties";
import { filterListingsFromSearchParams } from "@/lib/property-search";

const PropertiesMap = dynamic(
  () => import("@/components/sales/PropertiesMap").then((m) => m.PropertiesMap),
  {
    ssr: false,
    loading: () => (
      <div className="h-full w-full min-h-[320px] bg-[#E7E0D5]/40 animate-pulse rounded-xl" />
    ),
  },
);

function MapResults() {
  const { t } = useI18n();
  const { projects } = useProjects();
  const searchParams = useSearchParams();
  const listRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const allListings = useMemo(() => getAllProperties(projects), [projects]);
  const filtered = useMemo(
    () => filterListingsFromSearchParams(allListings, searchParams),
    [allListings, searchParams],
  );

  const [selectedId, setSelectedId] = useState<string | null>(null);

  const handleSelect = useCallback((apartmentId: string) => {
    setSelectedId(apartmentId);
    const el = cardRefs.current[apartmentId];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, []);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <p className="text-sm text-[#57534E]">
          {t.properties.showing}{" "}
          <span className="font-semibold text-[#1C1917]">{filtered.length}</span>{" "}
          {filtered.length !== 1 ? t.properties.propertiesWord : t.properties.propertyWord}
        </p>
        <PropertiesViewToggle view="map" />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-xl border border-[#E7E0D5]">
          <p className="text-lg font-semibold text-[#1C1917] mb-2">{t.properties.noResults}</p>
          <p className="text-sm text-[#A8A29E] mb-6">{t.properties.noResultsHint}</p>
          <Link href="/projects" className="text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]">
            {t.properties.viewDevelopment} →
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-4 lg:gap-5">
          <div className="relative h-[50vh] lg:h-[calc(100vh-var(--header-h)-220px)] min-h-[360px] rounded-xl overflow-hidden border border-[#E7E0D5] bg-white shadow-sm">
            <PropertiesMap
              listings={filtered}
              selectedId={selectedId}
              onSelect={handleSelect}
            />
          </div>

          <div
            ref={listRef}
            className="flex flex-col gap-3 max-h-[50vh] lg:max-h-[calc(100vh-var(--header-h)-220px)] overflow-y-auto pr-1"
          >
            {filtered.map((listing) => {
              const id = listing.apartment.id;
              return (
                <div
                  key={`${listing.project.id}-${id}`}
                  ref={(el) => {
                    cardRefs.current[id] = el;
                  }}
                >
                  <MapListingCard
                    listing={listing}
                    selected={selectedId === id}
                    onSelect={() => handleSelect(id)}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
}

function MapResultsSkeleton() {
  return (
    <div className="space-y-5">
      <div className="flex justify-between gap-4">
        <div className="h-5 w-40 rounded skeleton" />
        <div className="h-11 w-48 rounded-lg skeleton" />
      </div>
      <div className="h-[50vh] min-h-[360px] rounded-xl skeleton" />
    </div>
  );
}

export default function PropertiesMapPage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const CITIES = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo
        title={t.seo.propertiesMap.title}
        description={t.seo.propertiesMap.description}
        path="/properties/map"
        lang={lang}
      />

      <PageHero title={t.properties.mapTitle} subtitle={t.properties.mapSubtitle} overlap>
        <ListingSearchPanel cities={CITIES} projects={projects} variant="map" />
      </PageHero>

      <section className="pt-4 sm:pt-6 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <Suspense fallback={<MapResultsSkeleton />}>
          <MapResults />
        </Suspense>
      </section>
    </main>
  );
}
