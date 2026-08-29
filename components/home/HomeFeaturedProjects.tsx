"use client";

import Image from "next/image";
import Link from "next/link";
import { Download, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import { getProjectDescription, getProjectLocation, getProjectTitle } from "@/lib/project-i18n";
import type { Project } from "@/types";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

interface Props {
  projects: Project[];
}

function statusLabel(status: Project["status"], t: ReturnType<typeof useI18n>["t"]) {
  if (status === "Ready") return t.home.searchStatusReady;
  if (status === "Under Construction") return t.home.searchStatusConstruction;
  return t.home.searchStatusSoldOut;
}

export function HomeFeaturedProjects({ projects }: Props) {
  const { t, lang } = useI18n();

  return (
    <section className="py-16 md:py-24 bg-[#F8FAFC]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-0">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-12 md:mb-16">
          <SectionHeader
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredTitle}
            subtitle={t.home.featuredSubtitle}
            className="mb-0"
          />
          <Link
            href="/projects"
            className="shrink-0 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52] transition-colors"
          >
            {t.home.featuredAll}
          </Link>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {projects.map((project, i) => {
            const title = getProjectTitle(project, lang);
            const location = getProjectLocation(project, lang);
            return (
            <Reveal key={project.id} delay={i * 0.08}>
              <article className="group bg-white rounded-lg overflow-hidden border border-[#E2E8F0] hover:shadow-[0_16px_48px_rgba(15,23,42,0.1)] transition-shadow duration-500">
                <div className="relative aspect-[16/10] image-zoom">
                  {project.images[0] && (
                    <Image
                      src={project.images[0]}
                      alt={title}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      className="object-cover zoom-target"
                    />
                  )}
                  <div className="absolute top-4 left-4">
                    <span className="inline-flex px-3 py-1 text-[11px] font-semibold uppercase tracking-wider bg-[#0F172A]/85 text-white rounded-sm backdrop-blur-sm">
                      {statusLabel(project.status, t)}
                    </span>
                  </div>
                </div>

                <div className="p-6 md:p-8">
                  <h3 className="font-display text-2xl md:text-[1.75rem] text-[#0F172A] leading-tight group-hover:text-[#c9a96e] transition-colors">
                    {title}
                  </h3>
                  <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6B7280]">
                    <MapPin size={14} className="text-[#c9a96e] shrink-0" />
                    {location}
                  </p>
                  <p className="mt-4 text-sm text-[#6B7280] leading-relaxed line-clamp-2">{getProjectDescription(project, lang)}</p>

                  <div className="mt-6 flex flex-wrap gap-6 text-sm">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">{t.home.availableUnits}</p>
                      <p className="font-semibold text-[#0F172A]">{project.availableApartmentsCount}</p>
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-[#6B7280] mb-1">{t.home.startingFrom}</p>
                      <p className="font-semibold text-[#0F172A]">{formatPrice(project.startingPrice)}</p>
                    </div>
                  </div>

                  <div className="mt-8 flex flex-wrap gap-3">
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex h-11 items-center justify-center px-6 rounded-sm bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors"
                    >
                      {t.home.viewProject}
                    </Link>
                    <Link
                      href={`/projects/${project.slug}`}
                      className="inline-flex h-11 items-center justify-center gap-2 px-6 rounded-sm border border-[#E2E8F0] text-[#0F172A] text-sm font-semibold hover:border-[#c9a96e] transition-colors"
                    >
                      <Download size={16} />
                      {t.home.downloadBrochure}
                    </Link>
                  </div>
                </div>
              </article>
            </Reveal>
          );
          })}
        </div>
      </div>
    </section>
  );
}
