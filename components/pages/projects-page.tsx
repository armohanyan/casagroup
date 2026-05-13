import { useState, useMemo } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { ProjectCard } from "@/components/ProjectCard";
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
    maxPrice: 9999999,
    rooms: "",
  });

  const filtered = useMemo(() => {
    return projects.filter((p) => {
      if (filters.city && p.city !== filters.city) return false;
      if (filters.status && p.status !== filters.status) return false;
      if (p.startingPrice > filters.maxPrice) return false;
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
    <main className="bg-[#0C1428] min-h-screen pt-20">
      <Seo
        title={t.seo.projects.title}
        description={t.seo.projects.description}
        path="/projects"
        lang={lang}
      />
      {/* Page Header */}
      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1920&q=70"
            alt="Modern apartment building facade — CasaGroup project portfolio"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C1428] via-transparent to-[#0C1428]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t.projects.eyebrow}
          </motion.p>
          <motion.h1
            className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] leading-tight"
            style={{ fontSize: lang === "hy" ? "clamp(2rem, 3vw, 2.8rem)" : "clamp(2.5rem, 4vw, 3.5rem)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.projects.title}
          </motion.h1>
          <motion.div
            className="mt-8 flex flex-col gap-3"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <p className="text-[10px] tracking-[0.35em] uppercase text-[#5a554f]">{t.projects.categoriesEyebrow}</p>
            <div className="flex flex-wrap gap-2">
              {t.projects.categories.map((cat) => (
                <span
                  key={cat}
                  className="text-xs text-[#9a9085] border border-[#2a2520] rounded-full px-3 py-1.5 hover:border-[#c9a96e]/30 transition-colors break-words max-w-full"
                >
                  {cat}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-32">
        {/* Filters */}
        <div className="mb-10">
          <FilterBar filters={filters} onChange={setFilters} cities={CITIES} />
        </div>

        {/* Results count */}
        <div className="flex items-center justify-between mb-8">
          <p className="text-sm text-[#9a9085]">
            {t.projects.showing} <span className="text-[#f0ece4] font-medium">{filtered.length}</span>{" "}
            {filtered.length !== 1 ? t.projects.projectsWord : t.projects.projectWord}
          </p>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <motion.div
            className="text-center py-24"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <p className="font-['Cormorant_Garamond'] text-4xl text-[#2a2520] font-light mb-4">
              {t.projects.noResults}
            </p>
            <p className="text-[#5a554f] text-sm">{t.projects.noResultsHint}</p>
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <ProjectCard project={project} />
              </motion.div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
