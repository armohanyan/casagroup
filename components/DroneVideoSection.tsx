"use client";

import { useCallback, useEffect, useRef, useState, type ReactNode, type TouchEvent as ReactTouchEvent } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Expand, Play, Video, X } from "lucide-react";
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
  /** Project stats / amenities shown beside the video on desktop */
  sideContent?: ReactNode;
}

function isDirectVideoUrl(url: string): boolean {
  return /\.(mp4|webm|mov|ogg)(\?|#|$)/i.test(url) || /\/uploads\/videos\//i.test(url);
}

function toEmbedSrc(url: string, autoplay = true): string {
  const params = autoplay ? "autoplay=1&rel=0&modestbranding=1&playsinline=1" : "rel=0&modestbranding=1&playsinline=1";
  if (url.includes("youtube.com/watch")) {
    try {
      const id = new URL(url).searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?${params}`;
    } catch {
      /* fall through */
    }
  }
  if (url.includes("youtu.be/")) {
    const id = url.split("youtu.be/")[1]?.split(/[?&]/)[0];
    if (id) return `https://www.youtube.com/embed/${id}?${params}`;
  }
  if (url.includes("/embed/")) {
    const sep = url.includes("?") ? "&" : "?";
    return `${url}${sep}${params}`;
  }
  return url;
}

function VideoFrame({
  video,
  playing,
  onPlay,
  onStop,
  expanded,
  className,
  playLabel,
  stopLabel,
  expandLabel,
  onExpand,
}: {
  video: DroneVideo;
  playing: boolean;
  onPlay: () => void;
  onStop: () => void;
  expanded?: boolean;
  className?: string;
  playLabel: string;
  stopLabel: string;
  expandLabel?: string;
  onExpand?: () => void;
}) {
  const isFile = isDirectVideoUrl(video.url);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (!playing || !isFile) return;
    const el = videoRef.current;
    if (!el) return;
    void el.play().catch(() => undefined);
  }, [playing, isFile, video.url]);

  return (
    <div className={cn("relative overflow-hidden bg-[#0c1428]", className)}>
      {playing ? (
        isFile ? (
          <video
            ref={videoRef}
            key={video.url}
            src={video.url}
            className="absolute inset-0 h-full w-full bg-black object-contain"
            controls
            autoPlay
            playsInline
            preload="metadata"
          />
        ) : (
          <iframe
            key={video.url}
            src={toEmbedSrc(video.url, true)}
            className="absolute inset-0 h-full w-full"
            allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
            allowFullScreen
            title={video.title}
          />
        )
      ) : (
        <>
          {video.thumbnail ? (
            <Image
              src={video.thumbnail}
              alt={video.title}
              fill
              unoptimized
              sizes={expanded ? "100vw" : "(max-width: 1024px) 100vw, 560px"}
              className="object-cover"
              priority={expanded}
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-[#1e293b] via-[#0f172a] to-[#0c1428]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/20 to-black/25" />
          <button
            type="button"
            onClick={onPlay}
            className="absolute inset-0 z-[1] flex flex-col items-center justify-center gap-3 text-white outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e] focus-visible:ring-inset"
            aria-label={playLabel}
          >
            <motion.span
              className="flex h-16 w-16 items-center justify-center rounded-[5px] border border-white/40 bg-white/15 backdrop-blur-md sm:h-[4.5rem] sm:w-[4.5rem]"
              whileHover={{ scale: 1.06 }}
              whileTap={{ scale: 0.96 }}
              transition={{ type: "spring", stiffness: 420, damping: 28 }}
            >
              <Play size={28} className="ml-1" fill="white" strokeWidth={0} />
            </motion.span>
            <span className="max-w-[85%] truncate px-4 text-center text-sm font-medium tracking-wide text-white/95 sm:text-base">
              {video.title}
            </span>
          </button>
        </>
      )}

      <div className="pointer-events-none absolute inset-x-0 top-0 z-[2] flex items-start justify-between gap-2 p-3 sm:p-4">
        {playing ? (
          <button
            type="button"
            onClick={onStop}
            className="pointer-events-auto inline-flex h-10 items-center gap-1.5 rounded-[5px] bg-black/55 px-3 text-xs font-medium text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:h-9"
            aria-label={stopLabel}
          >
            <X size={14} />
            <span className="hidden sm:inline">{stopLabel}</span>
          </button>
        ) : (
          <span />
        )}
        {!expanded && onExpand && (
          <button
            type="button"
            onClick={onExpand}
            className="pointer-events-auto inline-flex h-10 w-10 items-center justify-center rounded-[5px] bg-black/55 text-white backdrop-blur-md transition-colors hover:bg-black/70 sm:h-9 sm:w-9"
            aria-label={expandLabel}
          >
            <Expand size={16} />
          </button>
        )}
      </div>
    </div>
  );
}

export function DroneVideoSection({ videos, projectTitle, embedded = false, sideContent }: Props) {
  const { t } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const hasVideos = videos.length > 0;
  const safeIndex = hasVideos ? Math.min(activeIndex, videos.length - 1) : 0;
  const active = hasVideos ? videos[safeIndex] : undefined;

  const selectVideo = useCallback((index: number) => {
    setActiveIndex(index);
    setPlaying(false);
  }, []);

  const prev = useCallback(() => {
    if (videos.length <= 1) return;
    setActiveIndex((i) => (i - 1 + videos.length) % videos.length);
    setPlaying(expanded);
  }, [expanded, videos.length]);

  const next = useCallback(() => {
    if (videos.length <= 1) return;
    setActiveIndex((i) => (i + 1) % videos.length);
    setPlaying(expanded);
  }, [expanded, videos.length]);

  useEffect(() => {
    if (!expanded) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [expanded]);

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setExpanded(false);
        setPlaying(false);
      }
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [expanded, next, prev]);

  useEffect(() => {
    const el = stripRef.current;
    if (!el || videos.length <= 1) return;
    const button = el.querySelector<HTMLElement>(`[data-drone-index="${safeIndex}"]`);
    button?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [safeIndex, videos.length]);

  const onPlayerTouchStart = (e: ReactTouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };

  const onPlayerTouchEnd = (e: ReactTouchEvent) => {
    if (!touchStart.current || videos.length <= 1 || playing) {
      touchStart.current = null;
      return;
    }
    const dx = e.changedTouches[0].clientX - touchStart.current.x;
    const dy = e.changedTouches[0].clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
    if (dx < 0) next();
    else prev();
  };

  if (!hasVideos && embedded) {
    return null;
  }

  const header = (
    <div className={cn(!embedded ? "max-w-2xl" : !sideContent && "mb-4 md:mb-5")}>
      <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">
        {t.projectDetail.droneEyebrow}
      </p>
      <h2 id="drone-video-title" className="mt-1.5 text-xl font-semibold text-[#0c1428] md:text-2xl">
        {t.projectDetail.droneTitle}
      </h2>
      <p className="mt-1.5 text-sm leading-relaxed text-[#6B7280]">{t.projectDetail.droneSubtitle}</p>
    </div>
  );

  const clipStrip =
    videos.length > 1 ? (
      <div
        ref={stripRef}
        className="mt-3 flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] sm:mt-4 [&::-webkit-scrollbar]:hidden"
        role="tablist"
        aria-label={t.projectDetail.droneTitle}
      >
        {videos.map((video, i) => {
          const selected = i === safeIndex;
          return (
            <button
              key={`${video.title}-${i}`}
              type="button"
              role="tab"
              aria-selected={selected}
              data-drone-index={i}
              onClick={() => selectVideo(i)}
              className={cn(
                "group relative h-[4.25rem] w-[7.5rem] shrink-0 overflow-hidden rounded-[5px] border text-left transition-colors sm:h-[4.75rem] sm:w-[8.5rem]",
                selected
                  ? "border-[#c9a96e] ring-1 ring-[#c9a96e]/50"
                  : "border-[#E5E7EB] hover:border-[#c9a96e]/70",
              )}
            >
              {video.thumbnail ? (
                <Image
                  src={video.thumbnail}
                  alt=""
                  fill
                  unoptimized
                  sizes="140px"
                  className="object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              ) : (
                <div className="absolute inset-0 bg-[#0f172a]" />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
              <span className="absolute inset-x-0 bottom-0 truncate px-2 pb-1.5 text-[10px] font-medium text-white sm:text-[11px]">
                {video.title}
              </span>
            </button>
          );
        })}
      </div>
    ) : null;

  const player = !hasVideos || !active ? (
    <div className="flex aspect-video w-full items-center justify-center rounded-[5px] border border-[#E5E7EB] bg-white">
      <div className="px-6 text-center">
        <Video size={28} className="mx-auto mb-2 text-[#9CA3AF]" />
        <p className="text-sm text-[#6B7280]">{t.projectDetail.droneNoVideo}</p>
      </div>
    </div>
  ) : (
    <div className="w-full">
      <div
        className="relative aspect-video w-full overflow-hidden rounded-[5px] shadow-[0_8px_32px_rgba(15,23,42,0.12)] touch-pan-y"
        onTouchStart={onPlayerTouchStart}
        onTouchEnd={onPlayerTouchEnd}
      >
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={`${active.url}-${safeIndex}-inline`}
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.28 }}
          >
            <VideoFrame
              video={active}
              playing={playing && !expanded}
              onPlay={() => setPlaying(true)}
              onStop={() => setPlaying(false)}
              playLabel={`${t.projectDetail.dronePlay} — ${active.title}`}
              stopLabel={t.projectDetail.droneStop}
              expandLabel={t.projectDetail.droneExpand}
              onExpand={() => {
                setExpanded(true);
                setPlaying(true);
              }}
              className="absolute inset-0 h-full w-full"
            />
          </motion.div>
        </AnimatePresence>

        {videos.length > 1 && !playing && (
          <div className="pointer-events-none absolute inset-x-0 bottom-3 z-[2] flex justify-center gap-1.5">
            {videos.map((_, i) => (
              <span
                key={i}
                className={cn(
                  "h-1 rounded-[5px] transition-all",
                  i === safeIndex ? "w-5 bg-[#c9a96e]" : "w-1.5 bg-white/45",
                )}
              />
            ))}
          </div>
        )}
      </div>

      {clipStrip}

      <p className="mt-2.5 text-[11px] text-[#6B7280] sm:mt-3">
        {projectTitle}
        {active?.title ? ` — ${active.title}` : ""}
        {videos.length > 1 ? (
          <span className="text-[#9CA3AF]">
            {" "}
            · {safeIndex + 1}/{videos.length}
          </span>
        ) : null}
      </p>
    </div>
  );

  const lightbox =
    expanded && active ? (
      <div
        className="fixed inset-0 z-[80] flex flex-col bg-black"
        role="dialog"
        aria-modal="true"
        aria-label={active.title}
      >
        <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-white">{active.title}</p>
            <p className="truncate text-xs text-white/55">
              {projectTitle}
              {videos.length > 1 ? ` · ${safeIndex + 1}/${videos.length}` : ""}
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setExpanded(false);
              setPlaying(false);
            }}
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-[5px] bg-white/10 text-white transition-colors hover:bg-white/20 sm:h-10 sm:w-10"
            aria-label={t.projectDetail.droneClose}
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1 px-0 sm:px-6 sm:pb-4">
          <div className="relative mx-auto h-full w-full max-w-6xl overflow-hidden sm:rounded-[5px]">
            <VideoFrame
              video={active}
              playing={playing}
              onPlay={() => setPlaying(true)}
              onStop={() => setPlaying(false)}
              expanded
              playLabel={`${t.projectDetail.dronePlay} — ${active.title}`}
              stopLabel={t.projectDetail.droneStop}
              className="absolute inset-0 h-full w-full"
            />
          </div>
        </div>

        {videos.length > 1 && (
          <div className="flex items-center justify-center gap-2 px-3 py-3 sm:py-4">
            <button
              type="button"
              onClick={prev}
              className="h-11 rounded-[5px] bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 sm:h-10"
            >
              {t.projectDetail.dronePrev}
            </button>
            <button
              type="button"
              onClick={next}
              className="h-11 rounded-[5px] bg-white/10 px-4 text-sm font-medium text-white transition-colors hover:bg-white/20 sm:h-10"
            >
              {t.projectDetail.droneNext}
            </button>
          </div>
        )}
      </div>
    ) : null;

  if (embedded) {
    if (sideContent) {
      return (
        <>
          <div className="flex flex-col gap-8 lg:grid lg:grid-cols-2 lg:items-start lg:gap-10 xl:gap-12">
            <div className="order-2 flex min-w-0 flex-col lg:order-1">
              {header}
              <div className="mt-6 md:mt-8">{sideContent}</div>
            </div>
            <div className="order-1 min-w-0 lg:order-2">{player}</div>
          </div>
          {lightbox}
        </>
      );
    }

    return (
      <>
        <div className="flex flex-col">
          {header}
          {player}
        </div>
        {lightbox}
      </>
    );
  }

  return (
    <section className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-8 md:py-11" aria-labelledby="drone-video-title">
      <Container>
        {header}
        <div className="mt-5 md:mt-6">{player}</div>
      </Container>
      {lightbox}
    </section>
  );
}
