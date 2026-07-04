"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { getProjectGallery } from "@/lib/project-gallery";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const MAX_IMAGES = 6;

const slideVariants = {
  enter: (dir: number) => ({
    x: dir > 0 ? "55%" : "-55%",
    opacity: 0,
    scale: 1.05,
  }),
  center: {
    x: 0,
    opacity: 1,
    scale: 1,
  },
  exit: (dir: number) => ({
    x: dir > 0 ? "-55%" : "55%",
    opacity: 0,
    scale: 0.98,
  }),
};

function CardImageSlider({ images, title }: { images: string[]; title: string }) {
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const rootRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const indexRef = useRef(index);
  const imagesRef = useRef(images);

  indexRef.current = index;
  imagesRef.current = images;

  useEffect(() => {
    const el = rootRef.current;
    if (!el || images.length <= 1) return;

    const onStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onMove = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8) {
        e.stopPropagation();
        if (e.cancelable) e.preventDefault();
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!touchStart.current) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      const list = imagesRef.current;
      if (list.length <= 1) return;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      e.stopPropagation();
      const i = indexRef.current;
      if (dx < 0) {
        setDirection(1);
        setIndex((i + 1) % list.length);
      } else {
        setDirection(-1);
        setIndex((i - 1 + list.length) % list.length);
      }
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [images.length]);

  if (images.length === 0) {
    return <div className="absolute inset-0 bg-[#F3F4F6]" />;
  }

  const goTo = (next: number, dir: 1 | -1) => {
    setDirection(dir);
    setIndex(next);
  };

  const goPrev = () => goTo((index - 1 + images.length) % images.length, -1);
  const goNext = () => goTo((index + 1) % images.length, 1);

  const arrowCls =
    "absolute top-1/2 -translate-y-1/2 z-30 flex h-10 w-10 items-center justify-center text-white drop-shadow-md opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all duration-200 hover:scale-110 active:scale-95";

  return (
    <div ref={rootRef} className="absolute inset-0 touch-pan-y">
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={`${title}-${index}`}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.42, ease: [0.32, 0.72, 0, 1] }}
          className="absolute inset-0 pointer-events-none"
        >
          <Image
            src={images[index]}
            alt={`${title} — ${index + 1}`}
            fill
            unoptimized
            draggable={false}
            sizes="(max-width: 768px) 85vw, 420px"
            className="object-cover select-none"
          />
        </motion.div>
      </AnimatePresence>

      {images.length > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goPrev();
            }}
            aria-label="Previous image"
            className={cn(arrowCls, "left-2")}
          >
            <ChevronLeft size={28} strokeWidth={1.5} />
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              goNext();
            }}
            aria-label="Next image"
            className={cn(arrowCls, "right-2")}
          >
            <ChevronRight size={28} strokeWidth={1.5} />
          </button>
          <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 pointer-events-auto">
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  goTo(i, i > index ? 1 : -1);
                }}
                aria-label={`Image ${i + 1}`}
                className={cn(
                  "h-1.5 rounded-full transition-all duration-300",
                  i === index ? "w-5 bg-white" : "w-1.5 bg-white/45",
                )}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function statusBadges(project: Project, t: ReturnType<typeof useI18n>["t"]) {
  const badges = [getStatusLabel(t, project.status)];
  const tag = project.tags[0];
  if (tag) badges.push(tag);
  return badges.slice(0, 2);
}

/** Liam-style featured property card with inner image slider. */
export function FeaturedPropertyCard({ project }: { project: Project }) {
  const { t } = useI18n();

  const images = useMemo(() => {
    const gallery = getProjectGallery(project);
    const urls = [...new Set([...project.images, ...gallery.map((g) => g.url)])];
    return urls.slice(0, MAX_IMAGES);
  }, [project]);

  const badges = statusBadges(project, t);

  return (
    <article
      data-card
      className="group/card flex flex-col h-full bg-white rounded-2xl overflow-hidden border border-[#E8EAED] shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)] hover:border-[#c9a96e]/30 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-[#E5E7EB] overflow-hidden group">
        <CardImageSlider images={images} title={project.title} />

        <div className="absolute top-3 right-3 z-20 flex flex-wrap justify-end gap-1.5 max-w-[70%] pointer-events-none">
          {badges.map((badge) => (
            <span
              key={badge}
              className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-[#1F2937]/80 text-white rounded-sm backdrop-blur-sm"
            >
              {badge}
            </span>
          ))}
        </div>

        <div className="absolute inset-x-0 bottom-0 z-20 h-24 bg-gradient-to-t from-black/80 via-black/40 to-transparent pointer-events-none" />
        <p className="absolute bottom-4 left-4 z-20 text-white text-sm font-medium tracking-wide pointer-events-none">
          <span className="mr-2 opacity-70">•</span>
          {t.home.startingFrom} {formatPrice(project.startingPrice)}
        </p>
      </div>

      <div className="flex flex-col flex-1 p-5 md:p-6">
        <Link href={`/projects/${project.slug}`} className="group/title">
          <h3 className="font-display text-xl text-[#0c1428] leading-snug line-clamp-2 group-hover/title:text-[#c9a96e] transition-colors">
            {project.title}
          </h3>
        </Link>

        <p className="mt-2.5 flex items-center gap-1.5 text-sm text-[#6B7280]">
          <MapPin size={14} className="shrink-0 text-[#c9a96e]" strokeWidth={2} />
          <span className="truncate">{project.city}, {project.location}</span>
        </p>

        <div className="mt-auto pt-5">
          <div className="flex items-center justify-between gap-3 rounded-lg bg-[#F9FAFB] border border-[#F0F1F3] px-3 py-2.5">
            <p className="flex items-center gap-2 min-w-0 text-[#0c1428]">
              <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-[#c9a96e]" aria-hidden />
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] truncate">
                {t.home.searchTypes.apartment}
              </span>
            </p>
            <Link
              href={`/projects/${project.slug}`}
              className="inline-flex h-9 shrink-0 items-center justify-center px-4 rounded-md bg-[#c9a96e] text-white text-xs font-semibold leading-none hover:bg-[#b8995e] active:scale-[0.98] transition-all shadow-sm"
            >
              {t.home.viewDetails}
            </Link>
          </div>
        </div>

        {project.developer && (
          <div className="mt-4 pt-4 border-t border-[#F0F1F3] flex items-center gap-2">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#F9FAFB] text-[10px] font-bold text-[#c9a96e] border border-[#E8EAED]">
              {project.developer.charAt(0)}
            </span>
            <span className="text-xs font-medium text-[#6B7280] truncate">{project.developer}</span>
          </div>
        )}
      </div>
    </article>
  );
}
