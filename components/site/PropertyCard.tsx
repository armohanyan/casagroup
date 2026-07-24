"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { getProjectDescription } from "@/lib/project-i18n";
import type { Project } from "@/types";

/** Compact conversion-focused property card — no long descriptions. */
export function PropertyCard({ project }: { project: Project }) {
  const { t, lang } = useI18n();
  const shortInfo = getProjectDescription(project, lang);

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col bg-white border border-[#E5E7EB] rounded-[5px] overflow-hidden hover:border-[#c9a96e]/50 transition-colors"
    >
      <div className="relative aspect-[3/2] bg-[#F3F4F6]">
        {project.images[0] && (
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-white/95 rounded-[5px] text-[#0c1428]">
          {getStatusLabel(t, project.status)}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-4">
        <h3 className="font-display text-base text-[#0c1428] line-clamp-1 group-hover:text-[#c9a96e] transition-colors">
          {project.title}
        </h3>
        <p className="mt-1.5 flex items-center gap-1 text-xs text-[#6B7280]">
          <MapPin size={12} className="shrink-0 text-[#c9a96e]" strokeWidth={2} />
          <span className="truncate">{project.location}</span>
        </p>
        {shortInfo ? (
          <p className="mt-2 text-xs text-[#6B7280] leading-relaxed line-clamp-2">{shortInfo}</p>
        ) : null}
        <div className="mt-auto border-t border-[#F0F1F3] pt-3">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#c9a96e] transition-all group-hover:gap-2.5 group-hover:text-[#a88a52]">
            {t.home.viewDetails}
            <span aria-hidden>→</span>
          </span>
        </div>
      </div>
    </Link>
  );
}
