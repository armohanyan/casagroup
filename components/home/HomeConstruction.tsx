"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

interface Props {
  projects: Project[];
}

type Tab = "completed" | "underConstruction" | "comingSoon";

function progressForStatus(status: Project["status"]): number {
  if (status === "Ready") return 100;
  if (status === "Under Construction") return 65;
  return 25;
}

export function HomeConstruction({ projects }: Props) {
  const { t } = useI18n();
  const [tab, setTab] = useState<Tab>("underConstruction");

  const tabs: { id: Tab; label: string }[] = [
    { id: "completed", label: t.home.constructionTabs.completed },
    { id: "underConstruction", label: t.home.constructionTabs.underConstruction },
    { id: "comingSoon", label: t.home.constructionTabs.comingSoon },
  ];

  const filtered = useMemo(() => {
    if (tab === "completed") return projects.filter((p) => p.status === "Ready");
    if (tab === "underConstruction") return projects.filter((p) => p.status === "Under Construction");
    return projects.filter((p) => p.status === "Sold Out" || p.tags.includes("coming soon"));
  }, [projects, tab]);

  const display = filtered.length > 0 ? filtered : projects;

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t.home.constructionEyebrow}
          title={t.home.constructionTitle}
          subtitle={t.home.constructionSubtitle}
          centered
        />

        <Reveal delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cn(
                  "px-5 py-2.5 text-sm font-medium rounded-sm transition-colors",
                  tab === item.id
                    ? "bg-[#0F172A] text-white"
                    : "bg-[#F8FAFC] text-[#6B7280] hover:text-[#0F172A] border border-[#E2E8F0]",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="space-y-6">
          {display.map((project, i) => {
            const progress = progressForStatus(project.status);
            return (
              <Reveal key={project.id} delay={i * 0.06}>
                <div className="flex flex-col md:flex-row gap-6 p-6 rounded-lg border border-[#E2E8F0] hover:border-[#C8A96A]/30 transition-colors">
                  <div className="relative w-full md:w-48 h-32 shrink-0 rounded-lg overflow-hidden image-zoom">
                    {project.images[0] && (
                      <Image
                        src={project.images[0]}
                        alt={project.title}
                        fill
                        unoptimized
                        sizes="192px"
                        className="object-cover zoom-target"
                      />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div>
                        <h3 className="font-display text-lg text-[#0F172A]">{project.title}</h3>
                        <p className="text-sm text-[#6B7280] mt-1">{project.location}</p>
                      </div>
                      <Link
                        href={`/projects/${project.slug}`}
                        className="text-sm font-semibold text-[#C8A96A] hover:text-[#a88a52] shrink-0"
                      >
                        {t.home.viewProject} →
                      </Link>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs text-[#6B7280] mb-2">
                        <span>{t.home.constructionProgress}</span>
                        <span className="font-semibold text-[#0F172A]">{progress}%</span>
                      </div>
                      <div className="h-1.5 bg-[#E2E8F0] rounded-full overflow-hidden">
                        <div
                          className="h-full bg-[#C8A96A] rounded-full transition-all duration-700"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}
