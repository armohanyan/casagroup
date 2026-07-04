"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, MapPin, X } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/lib/project-gallery";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import type { GalleryCategory, Project, ProjectGalleryItem } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  project: Project;
  items: ProjectGalleryItem[];
}

export function ProjectMediaShowcase({ project, items }: Props) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [index, setIndex] = useState(0);
  const [lightbox, setLightbox] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const safeIndex = filtered.length === 0 ? 0 : Math.min(index, filtered.length - 1);
  const active = filtered[safeIndex];
  const availableCategories = GALLERY_CATEGORIES.filter((cat) => items.some((i) => i.category === cat));
  const filteredLenRef = useRef(filtered.length);

  useEffect(() => {
    filteredLenRef.current = filtered.length;
  }, [filtered.length]);

  const categoryLabel = (cat: GalleryCategory | "all") =>
    cat === "all" ? t.projectDetail.galleryAll : t.projectDetail.galleryCategories[cat];

  const setFilterAndReset = (cat: GalleryCategory | "all") => {
    setFilter(cat);
    setIndex(0);
  };

  const prev = useCallback(() => {
    setIndex((i) => {
      const len = filteredLenRef.current;
      if (len === 0) return 0;
      const current = Math.min(i, len - 1);
      return (current - 1 + len) % len;
    });
  }, []);

  const next = useCallback(() => {
    setIndex((i) => {
      const len = filteredLenRef.current;
      if (len === 0) return 0;
      const current = Math.min(i, len - 1);
      return (current + 1) % len;
    });
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
      if (lightbox && e.key === "Escape") setLightbox(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  useEffect(() => {
    if (!lightbox) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [lightbox]);

  // Mobile swipe on hero
  useEffect(() => {
    const el = heroRef.current;
    if (!el) return;

    const onStart = (e: TouchEvent) => {
      touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    };

    const onMove = (e: TouchEvent) => {
      if (!touchStart.current || filteredLenRef.current <= 1) return;
      const dx = e.touches[0].clientX - touchStart.current.x;
      const dy = e.touches[0].clientY - touchStart.current.y;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 8 && e.cancelable) {
        e.preventDefault();
      }
    };

    const onEnd = (e: TouchEvent) => {
      if (!touchStart.current || filteredLenRef.current <= 1) return;
      const dx = e.changedTouches[0].clientX - touchStart.current.x;
      const dy = e.changedTouches[0].clientY - touchStart.current.y;
      touchStart.current = null;
      if (Math.abs(dx) < 40 || Math.abs(dx) < Math.abs(dy)) return;
      if (dx < 0) next();
      else prev();
    };

    el.addEventListener("touchstart", onStart, { passive: true });
    el.addEventListener("touchmove", onMove, { passive: false });
    el.addEventListener("touchend", onEnd, { passive: true });
    return () => {
      el.removeEventListener("touchstart", onStart);
      el.removeEventListener("touchmove", onMove);
      el.removeEventListener("touchend", onEnd);
    };
  }, [next, prev]);

  if (items.length === 0) {
    return <div className="h-[50vh] bg-[#F3F4F6] pt-header" />;
  }

  const pillCls = (activePill: boolean) =>
    cn(
      "shrink-0 px-3.5 py-1.5 text-sm font-medium rounded-full border transition-all whitespace-nowrap",
      activePill
        ? "bg-[#0c1428] text-white border-[#0c1428]"
        : "bg-white/90 text-[#374151] border-white/60 hover:bg-white",
    );

  return (
    <section className="bg-[#0F172A]" aria-label={project.title}>
      {/* Hero stage */}
      <div ref={heroRef} className="relative h-[58vh] min-h-[380px] max-h-[720px] group touch-pan-y">
        <AnimatePresence mode="wait" initial={false}>
          {active && (
            <motion.div
              key={active.url + safeIndex}
              className="absolute inset-0 pointer-events-none"
              initial={{ opacity: 0, scale: 1.03 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: [0.32, 0.72, 0, 1] }}
            >
              <Image
                src={active.url}
                alt={`${project.title} — ${categoryLabel(active.category)}`}
                fill
                priority
                unoptimized
                sizes="100vw"
                className="object-cover"
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-black/30 pointer-events-none" />

        {filtered.length > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                prev();
              }}
              className="absolute left-3 md:left-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#0c1428] shadow-lg hover:bg-[#F3F4F6] active:scale-95 transition-transform"
              aria-label="Previous"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                next();
              }}
              className="absolute right-3 md:right-5 top-1/2 -translate-y-1/2 z-30 w-12 h-12 flex items-center justify-center rounded-full bg-white text-[#0c1428] shadow-lg hover:bg-[#F3F4F6] active:scale-95 transition-transform"
              aria-label="Next"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        <button
          type="button"
          onClick={() => setLightbox(true)}
          className="absolute top-[calc(var(--header-h)+0.75rem)] right-4 z-30 w-10 h-10 flex items-center justify-center rounded-lg bg-black/45 text-white backdrop-blur-sm hover:bg-black/60"
          aria-label="Fullscreen"
        >
          <Expand size={18} />
        </button>

        {/* Title overlay — pointer-events-none so it never blocks arrows */}
        <div className="absolute inset-x-0 bottom-0 z-20 px-4 sm:px-6 lg:px-8 pb-5 md:pb-6 pt-20 pointer-events-none">
          <div className="max-w-7xl mx-auto">
            <p className="text-sm font-medium text-[#c9a96e]">{getStatusLabel(t, project.status)}</p>
            <h1 className="mt-1 font-display text-3xl md:text-5xl text-white tracking-tight">{project.title}</h1>
            <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-white/85">
              <p className="flex items-center gap-1.5 text-sm md:text-base">
                <MapPin size={15} className="shrink-0 text-[#c9a96e]" />
                {project.location}
              </p>
              <p className="text-sm md:text-base font-semibold tabular-nums">
                {t.home.startingFrom} {formatPrice(project.startingPrice)}
              </p>
            </div>
            {active && (
              <p className="mt-3 text-xs text-white/55">
                {categoryLabel(active.category)} · {safeIndex + 1} / {filtered.length}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Controls bar: filters + thumbs */}
      <div className="border-t border-white/10 bg-[#0F172A]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-4">
          <div className="flex gap-2 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <button type="button" onClick={() => setFilterAndReset("all")} className={pillCls(filter === "all")}>
              {categoryLabel("all")}
              <span className="ml-1.5 opacity-70 tabular-nums">{items.length}</span>
            </button>
            {availableCategories.map((cat) => {
              const count = items.filter((i) => i.category === cat).length;
              return (
                <button key={cat} type="button" onClick={() => setFilterAndReset(cat)} className={pillCls(filter === cat)}>
                  {categoryLabel(cat)}
                  <span className="ml-1.5 opacity-70 tabular-nums">{count}</span>
                </button>
              );
            })}
          </div>

          <div className="flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {filtered.map((item, i) => (
              <button
                key={`${item.url}-${i}`}
                type="button"
                onClick={() => setIndex(i)}
                className={cn(
                  "relative shrink-0 w-20 h-14 md:w-24 md:h-16 rounded-lg overflow-hidden border-2 transition-all",
                  i === safeIndex
                    ? "border-[#c9a96e] opacity-100 ring-2 ring-[#c9a96e]/30"
                    : "border-transparent opacity-55 hover:opacity-90",
                )}
                aria-label={`${categoryLabel(item.category)} ${i + 1}`}
                aria-current={i === safeIndex}
              >
                <Image src={item.url} alt="" fill unoptimized sizes="96px" className="object-cover" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && active && (
          <motion.div
            className="fixed inset-0 z-[1200] bg-black/98 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.projectDetail.galleryLightbox}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{project.title}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  {categoryLabel(active.category)} · {safeIndex + 1} / {filtered.length}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setLightbox(false)}
                className="shrink-0 p-2 rounded-full hover:bg-white/10 text-white"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center min-h-0 px-2 md:px-12">
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 md:left-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <motion.div
                key={safeIndex}
                className="relative w-full h-full max-w-6xl max-h-[75vh]"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Image src={active.url} alt="" fill unoptimized sizes="100vw" className="object-contain" priority />
              </motion.div>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 md:right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 justify-center min-w-min mx-auto">
                {filtered.map((item, i) => (
                  <button
                    key={`lb-${item.url}-${i}`}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={cn(
                      "relative w-14 h-14 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      i === safeIndex ? "border-[#c9a96e] opacity-100" : "border-transparent opacity-50 hover:opacity-80",
                    )}
                  >
                    <Image src={item.url} alt="" fill unoptimized sizes="56px" className="object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
