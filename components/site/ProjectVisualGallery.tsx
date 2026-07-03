"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
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

  const filtered = useMemo(
    () => (filter === "all" ? items : items.filter((item) => item.category === filter)),
    [items, filter],
  );

  const categoryLabel = (cat: GalleryCategory | "all") =>
    cat === "all" ? t.projectDetail.galleryAll : t.projectDetail.galleryCategories[cat];

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
    return () => window.removeEventListener("keydown", onKey);
  }, [lightbox, next, prev]);

  const availableCategories = GALLERY_CATEGORIES.filter((cat) => items.some((i) => i.category === cat));

  return (
    <section aria-label={t.projectDetail.galleryTitle}>
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-[#111827]">{t.projectDetail.galleryTitle}</h2>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setFilter("all")}
            className={cn(
              "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
              filter === "all" ? "bg-[#111827] text-white border-[#111827]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]",
            )}
          >
            {categoryLabel("all")}
          </button>
          {availableCategories.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setFilter(cat)}
              className={cn(
                "px-3 py-1.5 text-xs font-medium rounded-full border transition-colors",
                filter === cat ? "bg-[#111827] text-white border-[#111827]" : "border-[#E5E7EB] text-[#6B7280] hover:border-[#111827]",
              )}
            >
              {categoryLabel(cat)}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {filtered.map((item, i) => (
          <button
            key={`${item.url}-${i}`}
            type="button"
            onClick={() => open(i)}
            className={cn(
              "group relative overflow-hidden rounded-lg bg-[#F3F4F6] text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-[#111827]",
              i === 0 && "col-span-2 row-span-2 aspect-[16/10]",
              i !== 0 && "aspect-[4/3]",
            )}
          >
            <Image
              src={item.url}
              alt={`${title} — ${categoryLabel(item.category)}`}
              fill
              unoptimized
              sizes={i === 0 ? "(max-width:768px) 100vw, 50vw" : "(max-width:768px) 50vw, 25vw"}
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <span className="absolute bottom-2 left-2 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-white bg-black/40 rounded opacity-0 group-hover:opacity-100 transition-opacity">
              {categoryLabel(item.category)}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && filtered[lightbox] && (
          <motion.div
            className="fixed inset-0 z-[100] bg-black/95 flex flex-col"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.projectDetail.galleryLightbox}
          >
            <div className="flex items-center justify-between p-4 text-white">
              <span className="text-sm text-white/70">
                {categoryLabel(filtered[lightbox].category)} · {lightbox + 1} / {filtered.length}
              </span>
              <button type="button" onClick={close} className="p-2 hover:text-[#C8A96A]" aria-label="Close">
                <X size={24} />
              </button>
            </div>
            <div className="relative flex-1 flex items-center justify-center px-4 pb-4">
              <button type="button" onClick={prev} className="absolute left-2 md:left-6 p-2 text-white hover:text-[#C8A96A]" aria-label="Previous">
                <ChevronLeft size={36} />
              </button>
              <motion.div
                key={lightbox}
                className="relative w-full max-w-6xl h-full max-h-[80vh]"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
              >
                <Image
                  src={filtered[lightbox].url}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
              <button type="button" onClick={next} className="absolute right-2 md:right-6 p-2 text-white hover:text-[#C8A96A]" aria-label="Next">
                <ChevronRight size={36} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
