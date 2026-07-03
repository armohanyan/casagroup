"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight } from "lucide-react";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

const ProjectsMapCanvas = dynamic(
  () => import("./ProjectsMapCanvas").then((m) => m.ProjectsMapCanvas),
  { ssr: false, loading: () => <div className="h-full min-h-[320px] bg-[#F3F4F6] animate-pulse" /> },
);

interface Props {
  projects: Project[];
}

export function ProjectsMapExplorer({ projects }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);

  const highlightId = hoverId ?? centerId;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-0 border border-[#E5E7EB] rounded-xl overflow-hidden bg-white min-h-[520px]">
      <div className="h-[320px] lg:h-auto lg:min-h-[520px] relative">
        <ProjectsMapCanvas
          projects={projects}
          highlightId={highlightId}
          centerId={centerId}
          onMarkerClick={(p) => router.push(`/projects/${p.slug}`)}
          onMarkerHover={setHoverId}
        />
      </div>

      <div className="border-t lg:border-t-0 lg:border-l border-[#E5E7EB] flex flex-col max-h-[420px] lg:max-h-none">
        <div className="px-4 py-3 border-b border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-sm font-semibold text-[#111827]">{t.projects.mapListTitle}</p>
          <p className="text-xs text-[#6B7280] mt-0.5">{t.projects.mapListHint}</p>
        </div>
        <ul className="overflow-y-auto flex-1 divide-y divide-[#E5E7EB]">
          {projects.map((project) => {
            const active = highlightId === project.id;
            return (
              <li key={project.id}>
                <button
                  type="button"
                  onMouseEnter={() => setHoverId(project.id)}
                  onMouseLeave={() => setHoverId(null)}
                  onClick={() => setCenterId(project.id)}
                  className={cn(
                    "w-full flex gap-3 p-4 text-left transition-colors",
                    active ? "bg-[#111827]/5" : "hover:bg-[#F9FAFB]",
                  )}
                >
                  <div className="relative w-20 h-16 shrink-0 rounded-md overflow-hidden bg-[#F3F4F6]">
                    {project.images[0] && (
                      <Image src={project.images[0]} alt="" fill unoptimized sizes="80px" className="object-cover" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-[#111827] truncate">{project.title}</p>
                    <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5 truncate">
                      <MapPin size={12} className="shrink-0" />
                      {project.location}
                    </p>
                    <p className="text-xs font-medium text-[#111827] mt-1">
                      {formatPrice(project.startingPrice)} · {getStatusLabel(t, project.status)}
                    </p>
                  </div>
                  <Link
                    href={`/projects/${project.slug}`}
                    onClick={(e) => e.stopPropagation()}
                    className="shrink-0 self-center p-2 text-[#6B7280] hover:text-[#111827]"
                    aria-label={t.home.viewProject}
                  >
                    <ArrowRight size={18} />
                  </Link>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
