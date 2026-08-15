"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, MapPin, Search } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { buildPropertySearchQuery } from "@/lib/property-search";
import { useI18n } from "@/lib/i18n";
import { getCityDisplayName, getProjectTitle } from "@/lib/project-i18n";
import type { Project } from "@/types";

interface Props {
  cities: string[];
  projects: Project[];
  variant?: "grid" | "map";
}

const selectCls = "field-select";

function ListingSearchPanelSkeleton() {
  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl border border-[#E7E0D5] h-[168px] sm:h-[152px] skeleton" />
    </div>
  );
}

function ListingSearchPanelInner({ cities, projects, variant = "grid" }: Props) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"developer" | "all">("developer");
  const [city, setCity] = useState(() => searchParams.get("city") ?? "");
  const [maxPrice, setMaxPrice] = useState(() => Number(searchParams.get("maxPrice") ?? 0));
  const [rooms, setRooms] = useState(() => searchParams.get("rooms") ?? "");
  const [projectSlug, setProjectSlug] = useState(() => searchParams.get("project") ?? "");
  const [minArea, setMinArea] = useState(() => Number(searchParams.get("minArea") ?? 0));

  function currentFilters() {
    return { city, maxPrice, rooms, project: projectSlug, minArea };
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const qs = buildPropertySearchQuery(currentFilters());
    const base = variant === "map" ? "/properties/map" : "/properties";
    router.push(qs ? `${base}?${qs}` : base);
  }

  function goToMap() {
    const qs = buildPropertySearchQuery(currentFilters());
    router.push(qs ? `/properties/map?${qs}` : "/properties/map");
  }

  function goToGrid() {
    const qs = buildPropertySearchQuery(currentFilters());
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <div className="mx-auto max-w-[1320px] px-4 sm:px-6 lg:px-8">
      <div className="bg-white rounded-xl shadow-lg shadow-black/10 border border-[#E7E0D5] overflow-hidden brand-surface-top">
        <div className="flex flex-wrap items-center gap-2 px-4 pt-4 pb-2 border-b border-[#E7E0D5] bg-[#FAF8F5]">
          <button
            type="button"
            onClick={() => setTab("developer")}
            className={
              tab === "developer"
                ? "btn-outline-active h-11 px-6 rounded-md text-sm"
                : "btn-outline h-11 px-6 rounded-md text-sm"
            }
          >
            {t.sales.tabDeveloper}
          </button>
          <button
            type="button"
            onClick={() => setTab("all")}
            className={
              tab === "all"
                ? "btn-outline-active h-11 px-6 rounded-md text-sm"
                : "btn-outline h-11 px-6 rounded-md text-sm"
            }
          >
            {t.sales.tabAll}
          </button>
          {variant === "grid" ? (
            <button
              type="button"
              onClick={goToMap}
              className="ml-auto btn-outline h-9 shrink-0 px-4 text-sm rounded-md whitespace-nowrap"
            >
              <MapPin size={16} className="shrink-0" />
              {t.sales.mapSearch}
            </button>
          ) : (
            <button
              type="button"
              onClick={goToGrid}
              className="ml-auto btn-outline h-9 shrink-0 px-4 text-sm rounded-md whitespace-nowrap"
            >
              <LayoutGrid size={16} />
              {t.sales.gridSearch}
            </button>
          )}
        </div>

        <form onSubmit={handleSearch} className="p-4 sm:p-5">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3">
            <div className="col-span-2 lg:col-span-1">
              <label className="field-label">{t.sales.filterType}</label>
              <select className={selectCls} defaultValue="apartment">
                <option value="apartment">{t.home.searchTypes.apartment}</option>
                <option value="penthouse">{t.home.searchTypes.penthouse}</option>
                <option value="commercial">{t.home.searchTypes.commercial}</option>
              </select>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <label className="field-label">{t.sales.filterRegion}</label>
              <select className={selectCls} value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="">{t.home.searchAllLocations}</option>
                {cities.map((c) => (
                  <option key={c} value={c}>{getCityDisplayName(c, projects, lang)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 lg:col-span-1">
              <label className="field-label">{t.sales.filterPrice}</label>
              <select className={selectCls} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
                <option value={0}>{t.home.searchAnyPrice}</option>
                {[20_000_000, 40_000_000, 60_000_000, 100_000_000].map((limit) => (
                  <option key={limit} value={limit}>{formatPrice(limit)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-1 lg:col-span-1">
              <label className="field-label">{t.sales.filterRooms}</label>
              <select className={selectCls} value={rooms} onChange={(e) => setRooms(e.target.value)}>
                <option value="">{t.home.searchAnyBedrooms}</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
            </div>
            <div className="col-span-1 lg:col-span-1">
              <label className="field-label">{t.sales.filterArea}</label>
              <select className={selectCls} value={minArea} onChange={(e) => setMinArea(Number(e.target.value))}>
                <option value={0}>{t.sales.anyArea}</option>
                <option value={50}>50+ m²</option>
                <option value={80}>80+ m²</option>
                <option value={100}>100+ m²</option>
              </select>
            </div>
            <div className="col-span-2 lg:col-span-1 min-w-0">
              <label className="field-label">{t.sales.filterProject}</label>
              <select className={selectCls} value={projectSlug} onChange={(e) => setProjectSlug(e.target.value)}>
                <option value="">{t.sales.anyProject}</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.slug}>{getProjectTitle(p, lang)}</option>
                ))}
              </select>
            </div>
            <div className="col-span-2 lg:col-span-2 flex items-end">
              <button
                type="submit"
                className="btn-outline w-full h-11 shrink-0 px-4 text-sm rounded-md whitespace-nowrap"
              >
                <Search size={16} className="shrink-0" />
                {t.home.searchButton}
              </button>
            </div>
          </div>
          {tab === "developer" && (
            <p className="mt-3 text-xs text-[#A8A29E]">{t.sales.developerTabHint}</p>
          )}
        </form>
      </div>
    </div>
  );
}

export function ListingSearchPanel(props: Props) {
  return (
    <Suspense fallback={<ListingSearchPanelSkeleton />}>
      <ListingSearchPanelInner {...props} />
    </Suspense>
  );
}
