"use client";

import { useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Seo } from "@/components/seo/Seo";
import { Container } from "@/components/site/Container";
import { PropertyCard } from "@/components/site/PropertyCard";
import { ProjectsMapExplorer } from "@/components/site/ProjectsMapExplorer";
import { ProjectsSidebarFilters } from "@/components/site/ProjectsSidebarFilters";
import { useProjects } from "@/lib/projects-context";
import { useI18n } from "@/lib/i18n";
import type { FilterState } from "@/components/FilterBar";
import { cn } from "@/lib/utils";

export default function ProjectsPage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const searchParams = useSearchParams();
  const cities = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);

  const [filters, setFilters] = useState<FilterState>(() => ({
    city: searchParams.get("city") ?? "",
    status: searchParams.get("status") ?? "",
    minPrice: 0,
    maxPrice: Number(searchParams.get("maxPrice") ?? 0),
    rooms: searchParams.get("rooms") ?? "",
  }));

  const [view, setView] = useState<"list" | "map">("list");

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

  return (
    <main className="bg-[#F9FAFB] min-h-screen pt-header">
      <Seo title={t.seo.projects.title} description={t.seo.projects.description} path="/projects" lang={lang} />

      <Container className="py-6 md:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-semibold text-[#111827]">{t.projects.title}</h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              {filtered.length} {filtered.length === 1 ? t.projects.projectWord : t.projects.projectsWord}
            </p>
          </div>
          <div className="flex rounded-lg border border-[#E5E7EB] bg-white p-1 self-start">
            {(["list", "map"] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setView(v)}
                className={cn(
                  "px-4 py-2 text-sm font-medium rounded-md transition-colors",
                  view === v ? "bg-[#111827] text-white" : "text-[#6B7280] hover:text-[#111827]",
                )}
              >
                {v === "list" ? t.projects.viewList : t.projects.viewMap}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
          <aside className="lg:sticky lg:top-20 lg:self-start">
            <ProjectsSidebarFilters filters={filters} onChange={setFilters} cities={cities} />
          </aside>

          <div>
            {filtered.length === 0 ? (
              <div className="text-center py-16 bg-white rounded-lg border border-[#E5E7EB]">
                <p className="font-medium text-[#111827]">{t.projects.noResults}</p>
                <p className="mt-1 text-sm text-[#6B7280]">{t.projects.noResultsHint}</p>
              </div>
            ) : view === "map" ? (
              <ProjectsMapExplorer projects={filtered} />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-2 gap-5">
                {filtered.map((project) => (
                  <PropertyCard key={project.id} project={project} />
                ))}
              </div>
            )}
          </div>
        </div>
      </Container>
    </main>
  );
}
