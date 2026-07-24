"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, MapPin } from "lucide-react";
import { getProjectGallery } from "@/lib/project-gallery";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { getProjectDescription } from "@/lib/project-i18n";
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
      const len = images.length;
      if (len <= 1) return;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      e.stopPropagation();
      if (dx < 0) {
        setDirection(1);
        setIndex((i) => (i + 1) % len);
      } else {
        setDirection(-1);
        setIndex((i) => (i - 1 + len) % len);
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-30 flex gap-1.5 pointer-events-auto">
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
  return [getStatusLabel(t, project.status)];
}

/** Liam-style featured property card with inner image slider. */
export function FeaturedPropertyCard({ project }: { project: Project }) {
  const { t, lang } = useI18n();

  const images = useMemo(() => {
    const gallery = getProjectGallery(project);
    const urls = [...new Set([...project.images, ...gallery.map((g) => g.url)])];
    return urls.slice(0, MAX_IMAGES);
  }, [project]);

  const badges = statusBadges(project, t);
  const shortInfo = getProjectDescription(project, lang);

  return (
    <article
      data-card
      className="group/card flex flex-col h-full bg-white rounded-[5px] overflow-hidden border border-[#E8EAED] shadow-[0_4px_20px_rgba(15,23,42,0.06)] hover:shadow-[0_12px_40px_rgba(15,23,42,0.12)] hover:border-[#c9a96e]/30 transition-all duration-300"
    >
      <div className="relative aspect-[4/3] bg-[#E5E7EB] overflow-hidden group">
        <CardImageSlider images={images} title={project.title} />

        <div className="absolute top-3 right-3 z-20 flex flex-wrap justify-end gap-1.5 max-w-[70%] pointer-events-none">
          {badges.map((badge) => (
            <span
              key={badge}
              className="px-2.5 py-1 text-[9px] font-bold uppercase tracking-widest bg-[#1F2937]/80 text-white rounded-[5px] backdrop-blur-sm"
            >
              {badge}
            </span>
          ))}
        </div>
      </div>

      <div className="flex flex-col flex-1 p-5">
        <Link href={`/projects/${project.slug}`} className="group/title">
          <h3 className="font-display text-xl text-[#0c1428] leading-snug line-clamp-2 group-hover/title:text-[#c9a96e] transition-colors">
            {project.title}
          </h3>
        </Link>
        <p className="mt-2 flex items-center gap-1.5 text-sm text-[#6B7280]">
          <MapPin size={14} className="shrink-0 text-[#c9a96e]" strokeWidth={2} />
          <span className="truncate">{project.location}</span>
        </p>
        {shortInfo ? (
          <p className="mt-auto pt-4 text-sm text-[#6B7280] leading-relaxed line-clamp-2">
            {shortInfo}
          </p>
        ) : null}
      </div>
    </article>
  );
}
