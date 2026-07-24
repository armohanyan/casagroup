"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import Link from "next/link";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

const HomeMapCanvas = dynamic(() => import("./HomeMapCanvas").then((m) => m.HomeMapCanvas), {
  ssr: false,
  loading: () => <div className="h-full w-full min-h-[400px] bg-[#E2E8F0] animate-pulse rounded-lg" />,
});

interface Props {
  projects: Project[];
}

export function HomeMap({ projects }: Props) {
  const { t } = useI18n();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const selected = projects.find((p) => p.id === selectedId) ?? projects[0] ?? null;

  const handleSelect = (project: Project) => setSelectedId(project.id);

  return (
    <section className="py-16 md:py-24 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t.home.mapEyebrow}
          title={t.home.mapTitle}
          subtitle={t.home.mapSubtitle}
          centered
        />

        <Reveal delay={0.1}>
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6 rounded-lg overflow-hidden border border-[#E2E8F0]">
            <div className="h-[400px] lg:h-[520px]">
              <HomeMapCanvas projects={projects} selectedId={selected?.id ?? null} onSelect={handleSelect} />
            </div>

            <div ref={previewRef} className="bg-[#F8FAFC] p-6 lg:p-8 flex flex-col justify-center">
              {selected ? (
                <>
                  <div className="relative aspect-[16/10] rounded-lg overflow-hidden mb-6 image-zoom">
                    {selected.images[0] && (
                      <Image
                        src={selected.images[0]}
                        alt={selected.title}
                        fill
                        unoptimized
                        sizes="340px"
                        className="object-cover zoom-target"
                      />
                    )}
                  </div>
                  <h3 className="font-display text-xl text-[#0F172A]">{selected.title}</h3>
                  <p className="mt-1 text-sm text-[#6B7280]">{selected.location}</p>
                  <p className="mt-4 text-sm font-semibold text-[#c9a96e]">
                    {t.home.startingFrom} {formatPrice(selected.startingPrice)}
                  </p>
                  <Link
                    href={`/projects/${selected.slug}`}
                    className="mt-6 inline-flex h-11 items-center justify-center px-6 rounded-sm bg-[#0F172A] text-white text-sm font-semibold hover:bg-[#1E293B] transition-colors"
                  >
                    {t.home.viewProject}
                  </Link>
                </>
              ) : (
                <p className="text-sm text-[#6B7280]">{t.home.mapSubtitle}</p>
              )}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
