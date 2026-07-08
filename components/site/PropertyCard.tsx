"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { ProjectViewCount } from "@/components/site/ProjectViewCount";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import type { Project } from "@/types";

/** Compact conversion-focused property card — no long descriptions. */
export function PropertyCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <Link
      href={`/projects/${project.slug}`}
      className="group flex flex-col bg-white border border-[#E5E7EB] rounded-lg overflow-hidden hover:border-[#c9a96e]/50 transition-colors"
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
        <span className="absolute top-2 left-2 px-2 py-0.5 text-[10px] font-semibold bg-white/95 rounded text-[#0c1428]">
          {getStatusLabel(t, project.status)}
        </span>
        <ProjectViewCount projectId={project.id} className="absolute top-2 right-2" />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-semibold text-[#0c1428] line-clamp-1 group-hover:text-[#c9a96e] transition-colors">
          {project.title}
        </h3>
        <p className="mt-1 flex items-center gap-1 text-xs text-[#6B7280]">
          <MapPin size={12} className="shrink-0" />
          <span className="truncate">{project.location}</span>
        </p>
        <div className="mt-2.5 flex flex-col gap-2 rounded-md bg-[#F9FAFB] border border-[#F0F1F3] px-2.5 py-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0c1428] tabular-nums">{formatPrice(project.startingPrice)}</p>
            <p className="text-[10px] text-[#6B7280]">{t.home.searchTypes.apartment}</p>
          </div>
          <span className="inline-flex h-8 w-full shrink-0 items-center justify-center rounded-md bg-[#0c1428] px-4 text-xs font-semibold text-white whitespace-nowrap group-hover:bg-[#1F2937] transition-colors sm:w-auto sm:min-w-[4.5rem]">
            {t.home.viewDetails}
          </span>
        </div>
      </div>
    </Link>
  );
}
