"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { MapPin, ArrowRight, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import type { Project } from "@/types";
import { cn } from "@/lib/utils";

const ProjectsMapCanvas = dynamic(
  () => import("./ProjectsMapCanvas").then((m) => m.ProjectsMapCanvas),
  { ssr: false, loading: () => <div className="h-full min-h-[360px] bg-[#F3F4F6] animate-pulse" /> },
);

interface Props {
  projects: Project[];
}

function matchesMapQuery(project: Project, query: string) {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return (
    project.title.toLowerCase().includes(q) ||
    project.location.toLowerCase().includes(q) ||
    project.city.toLowerCase().includes(q) ||
    project.tags.some((tag) => tag.toLowerCase().includes(q))
  );
}

export function ProjectsMapExplorer({ projects }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [centerId, setCenterId] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const mobileScrollRef = useRef<HTMLDivElement>(null);

  const visible = useMemo(
    () => projects.filter((p) => matchesMapQuery(p, query)),
    [projects, query],
  );

  const highlightId = hoverId ?? centerId;

  useEffect(() => {
    if (!centerId || !mobileScrollRef.current) return;
    const el = mobileScrollRef.current.querySelector<HTMLElement>(`[data-project-id="${centerId}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [centerId]);

  useEffect(() => {
    if (centerId && !visible.some((p) => p.id === centerId)) {
      setCenterId(null);
    }
    if (hoverId && !visible.some((p) => p.id === hoverId)) {
      setHoverId(null);
    }
  }, [visible, centerId, hoverId]);

  return (
    <div className="relative isolate z-0 rounded-2xl overflow-hidden border border-[#E5E7EB] bg-white shadow-[0_8px_30px_rgba(12,20,40,0.06)]">
      <div className="h-[min(70vh,520px)] lg:h-[560px] relative">
        <ProjectsMapCanvas
          projects={visible}
          highlightId={highlightId}
          centerId={centerId}
          onMarkerClick={(p) => router.push(`/projects/${p.slug}`)}
          onMarkerHover={setHoverId}
        />

        <div className="hidden lg:flex absolute z-[400] left-4 top-4 bottom-4 w-[340px] flex-col rounded-xl bg-white/95 backdrop-blur-md border border-[#E5E7EB] shadow-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-[#E5E7EB] shrink-0 space-y-2.5">
            <p className="text-sm font-semibold text-[#0c1428]">
              {visible.length} {visible.length === 1 ? t.projects.projectWord : t.projects.projectsWord}
            </p>
            <label className="relative block">
              <span className="sr-only">{t.projects.searchPlaceholder}</span>
              <Search
                size={14}
                className="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
              />
              <input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t.projects.searchPlaceholder}
                className="h-9 w-full rounded-lg border border-[#E5E7EB] bg-white pl-8 pr-3 text-xs text-[#0c1428] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
              />
            </label>
          </div>
          <ul className="overflow-y-auto flex-1 divide-y divide-[#F0F1F3]">
            {visible.length === 0 ? (
              <li className="px-4 py-8 text-center text-sm text-[#6B7280]">{t.projects.noResults}</li>
            ) : (
              visible.map((project) => (
                <ProjectListRow
                  key={project.id}
                  project={project}
                  active={highlightId === project.id}
                  onHover={setHoverId}
                  onSelect={() => setCenterId(project.id)}
                  viewLabel={t.home.viewProject}
                />
              ))
            )}
          </ul>
        </div>

        <div className="lg:hidden absolute z-[400] inset-x-0 top-3 px-3 pointer-events-none">
          <label className="relative block pointer-events-auto">
            <span className="sr-only">{t.projects.searchPlaceholder}</span>
            <Search
              size={14}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t.projects.searchPlaceholder}
              className="h-10 w-full rounded-xl border border-[#E5E7EB] bg-white/95 pl-9 pr-3 text-sm text-[#0c1428] shadow-lg outline-none backdrop-blur-md placeholder:text-[#9CA3AF] focus:border-[#c9a96e] focus:ring-2 focus:ring-[#c9a96e]/20"
            />
          </label>
        </div>

        <div className="lg:hidden absolute z-[400] inset-x-0 bottom-0 pb-3 pt-8 bg-gradient-to-t from-black/35 via-black/10 to-transparent pointer-events-none">
          <div className="px-3 mb-2 pointer-events-none">
            <p className="text-xs font-medium text-white drop-shadow">
              {visible.length} {visible.length === 1 ? t.projects.projectWord : t.projects.projectsWord}
              <span className="opacity-80 font-normal"> · {t.projects.mapListHintMobile}</span>
            </p>
          </div>
          <div
            ref={mobileScrollRef}
            className="flex gap-3 overflow-x-auto px-3 snap-x snap-mandatory scroll-smooth pointer-events-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          >
            {visible.map((project) => {
              const active = highlightId === project.id;
              return (
                <div
                  key={project.id}
                  data-project-id={project.id}
                  className="snap-center shrink-0 w-[min(85vw,300px)]"
                >
                  <div
                    role="button"
                    tabIndex={0}
                    onClick={() => setCenterId(project.id)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setCenterId(project.id);
                      }
                    }}
                    className={cn(
                      "flex gap-3 p-3 rounded-xl bg-white border shadow-lg text-left transition-colors",
                      active ? "border-[#c9a96e] ring-2 ring-[#c9a96e]/30" : "border-[#E5E7EB]",
                    )}
                  >
                    <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-[#F3F4F6]">
                      {project.images[0] && (
                        <Image src={project.images[0]} alt="" fill unoptimized sizes="64px" className="object-cover" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-[#0c1428] truncate">{project.title}</p>
                      <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5 truncate">
                        <MapPin size={11} className="shrink-0 text-[#c9a96e]" />
                        {project.location}
                      </p>
                      <p className="text-xs font-medium text-[#0c1428] mt-1 tabular-nums">
                        {formatPrice(project.startingPrice)}
                      </p>
                    </div>
                    <Link
                      href={`/projects/${project.slug}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 self-center inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#0c1428] text-white"
                      aria-label={t.home.viewProject}
                    >
                      <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProjectListRow({
  project,
  active,
  onHover,
  onSelect,
  viewLabel,
}: {
  project: Project;
  active: boolean;
  onHover: (id: string | null) => void;
  onSelect: () => void;
  viewLabel: string;
}) {
  return (
    <li>
      <div
        role="button"
        tabIndex={0}
        onMouseEnter={() => onHover(project.id)}
        onMouseLeave={() => onHover(null)}
        onClick={onSelect}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            onSelect();
          }
        }}
        className={cn(
          "w-full flex gap-3 p-3 text-left transition-colors cursor-pointer",
          active ? "bg-[#c9a96e]/12" : "hover:bg-[#F9FAFB]",
        )}
      >
        <div className="relative w-16 h-14 shrink-0 rounded-lg overflow-hidden bg-[#F3F4F6]">
          {project.images[0] && (
            <Image src={project.images[0]} alt="" fill unoptimized sizes="64px" className="object-cover" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-[#0c1428] truncate">{project.title}</p>
          <p className="text-xs text-[#6B7280] flex items-center gap-1 mt-0.5 truncate">
            <MapPin size={11} className="shrink-0 text-[#c9a96e]" />
            {project.location}
          </p>
          <p className="text-xs font-medium text-[#0c1428] mt-1 tabular-nums">
            {formatPrice(project.startingPrice)}
          </p>
        </div>
        <Link
          href={`/projects/${project.slug}`}
          onClick={(e) => e.stopPropagation()}
          className="shrink-0 self-center inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#0c1428] text-white hover:bg-[#1F2937]"
          aria-label={viewLabel}
        >
          <ArrowRight size={14} />
        </Link>
      </div>
    </li>
  );
}
