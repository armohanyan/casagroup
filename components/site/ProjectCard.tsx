"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import type { Project } from "@/types";

export function ProjectCard({ project }: { project: Project }) {
  const { t } = useI18n();

  return (
    <article className="flex flex-col bg-white border border-[#E5E7EB] rounded-lg overflow-hidden">
      <div className="relative aspect-[4/3] bg-[#F3F4F6]">
        {project.images[0] && (
          <Image
            src={project.images[0]}
            alt={project.title}
            fill
            unoptimized
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover"
          />
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 text-xs font-medium bg-white rounded-md text-[#111827]">
          {getStatusLabel(t, project.status)}
        </span>
      </div>
      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-lg font-semibold text-[#111827]">{project.title}</h3>
        <p className="mt-1 flex items-center gap-1 text-sm text-[#6B7280]">
          <MapPin size={14} className="shrink-0" />
          {project.location}
        </p>
        <p className="mt-3 text-sm text-[#6B7280] leading-relaxed line-clamp-2 flex-1">{project.description}</p>
        <p className="mt-4 text-sm font-medium text-[#111827]">
          {t.home.startingFrom} {formatPrice(project.startingPrice)}
        </p>
        <Link
          href={`/projects/${project.slug}`}
          className="mt-5 inline-flex h-11 items-center justify-center rounded-lg bg-[#111827] text-white text-sm font-semibold hover:bg-[#1F2937] transition-colors"
        >
          {t.home.viewProject}
        </Link>
      </div>
    </article>
  );
}
