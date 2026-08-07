"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/site/Container";
import { ProjectsMapExplorer } from "@/components/site/ProjectsMapExplorer";
import { ProjectsSidebarFilters } from "@/components/site/ProjectsSidebarFilters";
import type { FilterState } from "@/components/FilterBar";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";

const emptyFilters: FilterState = {
  city: "",
  status: "",
  minPrice: 0,
  maxPrice: 0,
  rooms: "",
};

export function HomeProjectsMap({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const [filters, setFilters] = useState<FilterState>(emptyFilters);

  const cities = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.city && p.city !== filters.city) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.maxPrice > 0 && p.startingPrice > filters.maxPrice) return false;
      if (filters.rooms) {
        const r = parseInt(filters.rooms, 10);
        const has = p.apartments.some((a) => (filters.rooms === "4" ? a.rooms >= 4 : a.rooms === r));
        if (!has) return false;
      }
      return true;
    });
  }, [filters, projects]);

  if (projects.length === 0) return null;

  return (
    <section className="border-t border-[#E5E7EB] bg-white py-16 md:py-24">
      <Container>
        <div className="mb-8 max-w-2xl md:mb-10">
          {t.home.mapEyebrow ? (
            <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9a96e]">
              {t.home.mapEyebrow}
            </p>
          ) : null}
          <h2 className="mt-2 font-display text-3xl tracking-tight text-[#0c1428] md:text-[2.75rem] leading-tight">
            {t.home.mapTitle}
          </h2>
          <p className="mt-3 text-sm leading-relaxed text-[#6B7280] md:text-base">
            {t.home.mapSubtitle}
          </p>
        </div>

        <div className="mb-6">
          <ProjectsSidebarFilters filters={filters} onChange={setFilters} cities={cities} />
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-2xl border border-[#E5E7EB] bg-[#F9FAFB] py-16 text-center">
            <p className="font-medium text-[#0c1428]">{t.projects.noResults}</p>
            <p className="mt-1 text-sm text-[#6B7280]">{t.projects.noResultsHint}</p>
          </div>
        ) : (
          <ProjectsMapExplorer projects={filtered} />
        )}
      </Container>
    </section>
  );
}
