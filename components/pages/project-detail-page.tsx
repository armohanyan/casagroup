"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { DeveloperProjectHeader } from "@/components/sales/DeveloperProjectHeader";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { DroneVideoSection } from "@/components/DroneVideoSection";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { cn } from "@/lib/utils";

type TabKey = "details" | "progress";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { getBySlug, loading: projectsLoading } = useProjects();
  const project = slug ? getBySlug(slug) : undefined;
  const [tab, setTab] = useState<TabKey>("details");

  if (projectsLoading) {
    return (
      <main className="bg-[#F6F7FB] min-h-screen pt-header flex items-center justify-center">
        <p className="text-sm text-[#57534E]">Loading…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="bg-[#F6F7FB] min-h-screen pt-header flex items-center justify-center">
        <Seo title={t.projectNotFound} description={t.projectNotFound} path={`/projects/${slug ?? ""}`} lang={lang} noindex />
        <div className="text-center">
          <p className="font-semibold text-4xl text-[#D6D0C8]">{t.projectNotFound}</p>
          <Link href="/projects" className="mt-8 inline-block text-[#c9a96e] text-sm font-semibold">
            {t.backProjects} →
          </Link>
        </div>
      </main>
    );
  }

  const path = `/projects/${project.slug}`;
  const metaDesc =
    project.description.length > 155 ? `${project.description.slice(0, 152)}…` : project.description;

  return (
    <main className="bg-[#F6F7FB] min-h-screen pt-header">
      <Seo
        title={`${project.title} — new construction in ${project.city}`}
        description={metaDesc}
        path={path}
        image={project.images[0]}
        lang={lang}
        ogType="article"
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.projectDetail.breadHome, path: "/" },
          { name: t.projectDetail.breadProjects, path: "/projects" },
          { name: project.title, path },
        ])}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center gap-2 text-xs text-[#A8A29E] mb-6">
          <Link href="/" className="hover:text-[#c9a96e] transition-colors">
            {t.projectDetail.breadHome}
          </Link>
          <ChevronRight size={12} />
          <Link href="/projects" className="hover:text-[#c9a96e] transition-colors">
            {t.projectDetail.breadProjects}
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#57534E] line-clamp-1">{project.title}</span>
        </div>

        <DeveloperProjectHeader project={project} />

        <div className="mt-8 border-b border-[#E7E0D5] flex gap-1">
          {(
            [
              { id: "details" as const, label: t.developerDetail.details },
              { id: "progress" as const, label: t.developerDetail.constructionProgress },
            ] as const
          ).map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cn(
                "px-5 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors",
                tab === item.id
                  ? "border-brand text-[#1C1917]"
                  : "border-transparent text-[#57534E] hover:text-[#1C1917]"
              )}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="mt-6 mb-10">
          {tab === "details" ? (
            <div className="bg-white border border-[#E7E0D5] rounded-xl p-6 sm:p-8">
              <p className="text-[#57534E] leading-relaxed text-sm sm:text-base whitespace-pre-line">
                {project.longDescription}
              </p>
              {project.paymentOptions.length > 0 ? (
                <div className="mt-8 pt-8 border-t border-[#E7E0D5]">
                  <h3 className="text-sm font-bold text-[#1C1917] mb-4">{t.projectDetail.financeTitle}</h3>
                  <ul className="space-y-3">
                    {project.paymentOptions.map((opt) => (
                      <li key={opt.title} className="text-sm text-[#57534E]">
                        <span className="font-semibold text-[#1C1917]">{opt.title}</span>
                        {" — "}
                        {opt.description}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          ) : (
            <div className="bg-white border border-[#E7E0D5] rounded-xl p-6 sm:p-8">
              <div className="flex flex-wrap gap-6 mb-6">
                <div>
                  <p className="text-xs text-[#A8A29E] uppercase tracking-wide">{t.projectDetail.statusLabel}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1C1917]">
                    {getStatusLabel(t, project.status)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-[#A8A29E] uppercase tracking-wide">{t.developerDetail.constructionEnd}</p>
                  <p className="mt-1 text-sm font-semibold text-[#1C1917]">{project.completionDate}</p>
                </div>
                <div>
                  <p className="text-xs text-[#A8A29E] uppercase tracking-wide">{t.projectDetail.available}</p>
                  <p className="mt-1 text-sm font-semibold text-[#c9a96e] tabular-nums">
                    {project.availableApartmentsCount} / {project.totalApartments}
                  </p>
                </div>
              </div>
              <p className="text-sm text-[#57534E] leading-relaxed">{t.developerDetail.progressHint}</p>
            </div>
          )}
        </div>

        <DroneVideoSection videos={project.droneVideos ?? []} projectTitle={project.title} />

        <div className="mt-10 pb-16">
          <DeveloperFloorPlanSection project={project} />
        </div>
      </div>
    </main>
  );
}
