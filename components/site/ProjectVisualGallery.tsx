"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Expand, X } from "lucide-react";
import { GALLERY_CATEGORIES } from "@/lib/project-gallery";
import { useI18n } from "@/lib/i18n";
import type { GalleryCategory, ProjectGalleryItem } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  items: ProjectGalleryItem[];
  title: string;
}

export function ProjectVisualGallery({ items, title }: Props) {
  const { t } = useI18n();
  const [filter, setFilter] = useState<GalleryCategory | "all">("all");
  const [lightbox, setLightbox] = useState<number | null>(null);
  const filterRef = useRef<HTMLDivElement>(null);

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const categoryLabel = (cat: GalleryCategory | "all") =>
    cat === "all" ? t.projectDetail.galleryAll : t.projectDetail.galleryCategories[cat];

  const availableCategories = GALLERY_CATEGORIES.filter((cat) => items.some((i) => i.category === cat));

  const open = (index: number) => setLightbox(index);
  const close = () => setLightbox(null);
  const prev = useCallback(() => {
    setLightbox((i) => (i !== null ? (i - 1 + filtered.length) % filtered.length : null));
  }, [filtered.length]);
  const next = useCallback(() => {
    setLightbox((i) => (i !== null ? (i + 1) % filtered.length : null));
  }, [filtered.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [lightbox, next, prev]);

  const pillCls = (active: boolean) =>
    cn(
      "shrink-0 px-4 py-2 text-sm font-medium rounded-full border transition-all whitespace-nowrap",
      active
        ? "bg-[#111827] text-white border-[#111827] shadow-sm"
        : "bg-white text-[#6B7280] border-[#E5E7EB] hover:border-[#111827] hover:text-[#111827]",
    );

  if (items.length === 0) return null;

  return (
    <section aria-label={t.projectDetail.galleryTitle}>
      <div className="mb-6">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-5">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-[#111827] tracking-tight">
              {t.projectDetail.galleryTitle}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              {filtered.length} {t.projectDetail.galleryPhotos}
            </p>
          </div>
        </div>

        <div
          ref={filterRef}
          className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1 scroll-smooth snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
        >
          <button type="button" onClick={() => setFilter("all")} className={cn(pillCls(filter === "all"), "snap-start")}>
            {categoryLabel("all")}
            <span className="ml-1.5 opacity-70 tabular-nums">{items.length}</span>
          </button>
          {availableCategories.map((cat) => {
            const count = items.filter((i) => i.category === cat).length;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setFilter(cat)}
                className={cn(pillCls(filter === cat), "snap-start")}
              >
                {categoryLabel(cat)}
                <span className="ml-1.5 opacity-70 tabular-nums">{count}</span>
              </button>
            );
          })}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="py-16 text-center rounded-2xl border border-dashed border-[#E5E7EB] bg-[#F9FAFB]">
          <p className="text-sm text-[#6B7280]">{t.projectDetail.galleryEmpty}</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
          {filtered.map((item, i) => (
            <button
              key={`${item.url}-${i}`}
              type="button"
              onClick={() => open(i)}
              className={cn(
                "group relative overflow-hidden rounded-xl bg-[#F3F4F6] text-left",
                "focus:outline-none focus-visible:ring-2 focus-visible:ring-[#C8A96A] focus-visible:ring-offset-2",
                i === 0 && filtered.length > 1 && "col-span-2 lg:col-span-2 aspect-[16/9]",
                !(i === 0 && filtered.length > 1) && "aspect-[4/3]",
              )}
            >
              <Image
                src={item.url}
                alt={`${title} — ${categoryLabel(item.category)}`}
                fill
                unoptimized
                sizes={
                  i === 0 && filtered.length > 1
                    ? "(max-width:1024px) 100vw, 66vw"
                    : "(max-width:768px) 50vw, 33vw"
                }
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-80 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300" />
              <span className="absolute top-3 left-3 px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/95 bg-black/45 backdrop-blur-sm rounded-md">
                {categoryLabel(item.category)}
              </span>
              <span className="absolute bottom-3 right-3 w-9 h-9 flex items-center justify-center rounded-full bg-white/90 text-[#111827] opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-all md:scale-90 md:group-hover:scale-100 shadow-sm">
                <Expand size={16} />
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            className="fixed inset-0 z-[100] bg-[#0F172A]/98 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.projectDetail.galleryLightbox}
          >
            <div className="flex items-center justify-between gap-4 px-4 py-3 border-b border-white/10">
              <div className="min-w-0">
                <p className="text-sm font-medium text-white truncate">{title}</p>
                <p className="text-xs text-white/60 mt-0.5">
                  {categoryLabel(filtered[lightbox].category)} · {lightbox + 1} / {filtered.length}
                </p>
              </div>
              <button type="button" onClick={close} className="shrink-0 p-2 rounded-full hover:bg-white/10 text-white" aria-label="Close">
                <X size={22} />
              </button>
            </div>

            <div className="relative flex-1 flex items-center justify-center min-h-0 px-2 md:px-12">
              <button
                type="button"
                onClick={prev}
                className="absolute left-2 md:left-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                aria-label="Previous"
              >
                <ChevronLeft size={24} />
              </button>
              <motion.div
                key={lightbox}
                className="relative w-full h-full max-w-6xl max-h-[70vh] md:max-h-[75vh]"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.25 }}
              >
                <Image src={filtered[lightbox].url} alt="" fill unoptimized sizes="100vw" className="object-contain" priority />
              </motion.div>
              <button
                type="button"
                onClick={next}
                className="absolute right-2 md:right-4 z-10 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 backdrop-blur-sm"
                aria-label="Next"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            <div className="shrink-0 px-4 py-3 border-t border-white/10 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              <div className="flex gap-2 justify-center min-w-min mx-auto">
                {filtered.map((item, i) => (
                  <button
                    key={`${item.url}-thumb-${i}`}
                    type="button"
                    onClick={() => setLightbox(i)}
                    className={cn(
                      "relative w-14 h-14 md:w-16 md:h-16 shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                      i === lightbox ? "border-[#C8A96A] opacity-100 scale-105" : "border-transparent opacity-50 hover:opacity-80",
                    )}
                    aria-label={`${i + 1}`}
                  >
                    <Image src={item.url} alt="" fill unoptimized sizes="64px" className="object-cover" />
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
