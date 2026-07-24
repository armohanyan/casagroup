"use client";

import { useState } from "react";
import Image from "next/image";
import { Play, Video, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface DroneVideo {
  title: string;
  url: string;
  thumbnail?: string;
}

interface Props {
  videos: DroneVideo[];
  projectTitle: string;
  embedded?: boolean;
}

const mediaHeight = "h-[280px] md:h-[320px]";

export function DroneVideoSection({ videos, projectTitle, embedded = false }: Props) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);

  const active = videos[activeIndex];

  const header = (
    <div className={embedded ? undefined : "max-w-2xl"}>
      {!embedded && (
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">{t.projectDetail.droneEyebrow}</p>
      )}
      <h2 id="drone-video-title" className={cn("text-xl md:text-2xl font-semibold text-[#0c1428]", embedded ? "" : "mt-1.5")}>
        {t.projectDetail.droneTitle}
      </h2>
      {!embedded && <p className="mt-1.5 text-sm text-[#6B7280]">{t.projectDetail.droneSubtitle}</p>}
    </div>
  );

  const player = !videos || videos.length === 0 ? (
    <div
      className={cn(
        "flex items-center justify-center rounded-xl border border-[#E5E7EB] bg-white",
        embedded ? `flex-1 ${mediaHeight}` : "mx-auto mt-5 aspect-video max-h-[320px] max-w-3xl w-full",
      )}
    >
      <div className="px-6 text-center">
        <Video size={30} className="mx-auto mb-2 text-[#9CA3AF]" />
        <p className="text-sm text-[#6B7280]">{t.projectDetail.droneNoVideo}</p>
      </div>
    </div>
  ) : (
    <div className={cn(embedded ? "flex flex-1 flex-col" : "mx-auto mt-5 max-w-3xl")}>
      {videos.length > 1 && !embedded && (
        <div className="mb-3 flex flex-wrap gap-2">
          {videos.map((video, i) => (
            <button
              key={video.title + i}
              type="button"
              onClick={() => {
                setActiveIndex(i);
                setPlaying(false);
              }}
              className={cn(
                "rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                i === activeIndex
                  ? "border-[#0c1428] bg-[#0c1428] text-white"
                  : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#c9a96e]",
              )}
            >
              {video.title}
            </button>
          ))}
        </div>
      )}

      <div
        className={cn(
          "relative w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#0c1428] shadow-[0_6px_24px_rgba(15,23,42,0.06)]",
          embedded ? mediaHeight : "aspect-video max-h-[360px]",
        )}
      >
        {playing && active ? (
          <iframe
            src={`${active.url}?autoplay=1&rel=0&modestbranding=1`}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
            title={active.title}
          />
        ) : (
          <>
            {active?.thumbnail ? (
              <Image
                src={active.thumbnail}
                alt={active.title}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#1F2937] to-[#0c1428]" />
            )}
            <div className="absolute inset-0 bg-black/30" />
            <button
              type="button"
              onClick={() => setPlaying(true)}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-white transition-colors hover:bg-black/10"
              aria-label={active?.title}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-white/50 bg-white/15 backdrop-blur-sm transition-transform hover:scale-105">
                <Play size={22} className="ml-1" fill="white" />
              </span>
              <span className="text-xs font-medium">{active?.title}</span>
            </button>
          </>
        )}

        {playing && (
          <button
            type="button"
            onClick={() => setPlaying(false)}
            className="absolute top-3 right-3 z-10 flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white backdrop-blur-sm hover:bg-black/70"
            aria-label="Close video"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {!embedded && (
        <p className="mt-2 text-center text-[11px] text-[#6B7280]">
          {projectTitle} — {active?.title}
        </p>
      )}
    </div>
  );

  if (embedded) {
    return (
      <div className="flex h-full flex-col gap-4">
        {header}
        {player}
      </div>
    );
  }

  return (
    <section className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-7 md:py-9" aria-labelledby="drone-video-title">
      <Container>
        {header}
        {player}
      </Container>
    </section>
  );
}
