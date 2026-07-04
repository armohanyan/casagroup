"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
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
      <div className="relative aspect-[16/10] bg-[#F3F4F6]">
        {project.images[0] && (
          <Image src={project.images[0]} alt={project.title} fill unoptimized sizes="(max-width:768px) 100vw, 33vw" className="object-cover" />
        )}
        <span className="absolute top-3 left-3 px-2 py-1 text-[11px] font-semibold bg-white rounded text-[#0c1428]">
          {getStatusLabel(t, project.status)}
        </span>
      </div>
      <div className="p-4">
        <h3 className="font-semibold text-[#0c1428] group-hover:text-[#c9a96e] transition-colors">{project.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]">
          <MapPin size={13} className="shrink-0" />
          <span className="truncate">{project.location}</span>
        </p>
        <div className="mt-3 flex items-center justify-between gap-2">
          <p className="text-sm font-semibold text-[#0c1428] tabular-nums">{formatPrice(project.startingPrice)}</p>
          <span className="text-xs text-[#6B7280]">{t.home.searchTypes.apartment}</span>
        </div>
        <span className="mt-4 inline-flex h-10 w-full items-center justify-center rounded-lg bg-[#0c1428] text-white text-sm font-semibold group-hover:bg-[#1F2937]">
          {t.home.viewDetails}
        </span>
      </div>
    </Link>
  );
}
