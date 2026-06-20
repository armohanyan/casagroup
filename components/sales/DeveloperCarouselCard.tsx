"use client";

import Image from "next/image";
import Link from "next/link";
import { listingCode } from "@/lib/listing-code";
import type { Project } from "@/types";

export function DeveloperCarouselCard({ project, className = "" }: { project: Project; className?: string }) {
  const code = listingCode(project.id);
  const isNew = project.status === "Under Construction";

  return (
    <Link
      href={`/projects/${project.slug}`}
      className={`group block bg-white rounded-xl overflow-hidden border border-[#E7E0D5] shadow-sm hover:shadow-md hover:border-[#c9a96e]/40 transition-all flex-shrink-0 w-[280px] sm:w-[300px] ${className}`}
    >
      <div className="relative h-44 bg-[#F3EFE8]">
        {project.images[0] ? (
          <Image
            src={project.images[0]}
            alt=""
            fill
            unoptimized
            sizes="300px"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : null}
        <div className="absolute top-3 left-3 flex gap-2">
          {isNew ? (
            <span className="bg-brand text-white text-[11px] font-bold px-2 py-0.5 rounded-sm uppercase">
              New
            </span>
          ) : null}
          <span className="bg-white/95 text-[#1C1917] text-xs font-semibold px-2.5 py-0.5 rounded-sm tabular-nums">
            {code}
          </span>
        </div>
      </div>
      <div className="p-4 bg-[#F6F7FB] rounded-b-xl min-h-[88px]">
        <h3 className="text-sm font-semibold text-[#1C1917] leading-snug line-clamp-2 group-hover:text-[#c9a96e] transition-colors">
          {project.title}
        </h3>
        <p className="text-xs text-[#57534E] mt-1 truncate">{project.location}</p>
      </div>
    </Link>
  );
}
