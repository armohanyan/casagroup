"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { buildPropertySearchQuery } from "@/lib/property-search";
import { useI18n } from "@/lib/i18n";
import { getCityDisplayName, getProjectTitle } from "@/lib/project-i18n";
import type { Project } from "@/types";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

interface Props {
  cities: string[];
  projects: Project[];
}

function HomeSearchInner({ cities, projects }: Props) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [projectSlug, setProjectSlug] = useState("");
  const [propertyType, setPropertyType] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [rooms, setRooms] = useState("");
  const [status, setStatus] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const qs = buildPropertySearchQuery({ city, maxPrice, rooms, project: projectSlug, minArea: 0 });
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <section id="search" className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t.home.searchEyebrow}
          title={t.home.searchTitle}
          subtitle={t.home.searchSubtitle}
          centered
        />

        <Reveal delay={0.15}>
          <form
            onSubmit={handleSearch}
            className="bg-white rounded-lg border border-[#E2E8F0] p-6 md:p-8 shadow-[0_8px_40px_rgba(15,23,42,0.06)]"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="field-label">{t.home.searchLocation}</label>
                <select className="field-select" value={city} onChange={(e) => setCity(e.target.value)}>
                  <option value="">{t.home.searchAllLocations}</option>
                  {cities.map((c) => (
                    <option key={c} value={c}>{getCityDisplayName(c, projects, lang)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">{t.home.searchProject}</label>
                <select className="field-select" value={projectSlug} onChange={(e) => setProjectSlug(e.target.value)}>
                  <option value="">{t.sales.anyProject}</option>
                  {projects.map((p) => (
                    <option key={p.id} value={p.slug}>{getProjectTitle(p, lang)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">{t.home.searchType}</label>
                <select className="field-select" value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
                  <option value="">{t.home.searchAnyType}</option>
                  <option value="apartment">{t.home.searchTypes.apartment}</option>
                  <option value="penthouse">{t.home.searchTypes.penthouse}</option>
                  <option value="commercial">{t.home.searchTypes.commercial}</option>
                </select>
              </div>
              <div>
                <label className="field-label">{t.home.searchPrice}</label>
                <select className="field-select" value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
                  <option value={0}>{t.home.searchAnyPrice}</option>
                  {[50_000_000, 100_000_000, 200_000_000, 400_000_000].map((limit) => (
                    <option key={limit} value={limit}>{formatPrice(limit)}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">{t.home.searchBedrooms}</label>
                <select className="field-select" value={rooms} onChange={(e) => setRooms(e.target.value)}>
                  <option value="">{t.home.searchAnyBedrooms}</option>
                  {["1", "2", "3", "4"].map((n) => (
                    <option key={n} value={n}>{n}{n === "4" ? "+" : ""}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="field-label">{t.home.searchStatus}</label>
                <select className="field-select" value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="">{t.home.searchAnyStatus}</option>
                  <option value="Ready">{t.home.searchStatusReady}</option>
                  <option value="Under Construction">{t.home.searchStatusConstruction}</option>
                  <option value="Sold Out">{t.home.searchStatusSoldOut}</option>
                </select>
              </div>
            </div>

            <div className="mt-8">
              <button
                type="submit"
                className="w-full sm:w-auto inline-flex h-14 items-center justify-center gap-2 px-12 rounded-sm bg-[#0F172A] text-white text-sm font-semibold tracking-wide hover:bg-[#1E293B] transition-colors"
              >
                <Search size={18} />
                {t.home.searchButton}
              </button>
            </div>
          </form>
        </Reveal>
      </div>
    </section>
  );
}

export function HomeSearch(props: Props) {
  return (
    <Suspense>
      <HomeSearchInner {...props} />
    </Suspense>
  );
}
