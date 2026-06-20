import { useMemo, useState } from "react";
import { DeveloperCarouselCard } from "@/components/sales/DeveloperCarouselCard";
import { ListingSearchPanel } from "@/components/sales/ListingSearchPanel";
import { PageHero } from "@/components/sales/PageHero";
import { FilterBar, type FilterState } from "@/components/FilterBar";
import { Seo } from "@/components/seo/Seo";
import { useProjects } from "@/lib/projects-context";
import { useI18n } from "@/lib/i18n";

export default function ProjectsPage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();

  const CITIES = useMemo(() => [...new Set(projects.map((p) => p.city))], [projects]);

  const [filters, setFilters] = useState<FilterState>({
    city: "",
    status: "",
    minPrice: 0,
    maxPrice: 0,
    rooms: "",
  });

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.city && p.city !== filters.city) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (filters.maxPrice > 0 && p.startingPrice > filters.maxPrice) return false;
      if (filters.rooms) {
        const r = parseInt(filters.rooms);
        const hasRoom = p.apartments.some((a) =>
          filters.rooms === "4" ? a.rooms >= 4 : a.rooms === r
        );
        if (!hasRoom) return false;
      }
      return true;
    });
  }, [filters, projects]);

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo
        title={t.seo.projects.title}
        description={t.seo.projects.description}
        path="/projects"
        lang={lang}
      />

      <PageHero title={t.projects.title} subtitle={t.sales.fromDevelopers} overlap>
        <ListingSearchPanel cities={CITIES} projects={projects} />
      </PageHero>

      <section className="pt-4 sm:pt-6 max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-16">
        <div className="mb-6">
          <FilterBar filters={filters} onChange={setFilters} cities={CITIES} />
        </div>

        <p className="text-sm text-[#57534E] mb-6">
          {t.projects.showing}{" "}
          <span className="font-semibold text-[#1C1917]">{filtered.length}</span>{" "}
          {filtered.length !== 1 ? t.projects.projectsWord : t.projects.projectWord}
        </p>

        {filtered.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl border border-[#E7E0D5]">
            <p className="text-lg font-semibold text-[#1C1917] mb-2">{t.projects.noResults}</p>
            <p className="text-sm text-[#A8A29E]">{t.projects.noResultsHint}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((project) => (
              <DeveloperCarouselCard key={project.id} project={project} className="!w-full" />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
