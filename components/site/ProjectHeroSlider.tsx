"use client";

import { useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Maximize2, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  images: string[];
  title: string;
}

export function ProjectHeroSlider({ images, title }: Props) {
  const [index, setIndex] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const slides = images.length > 0 ? images : [];

  if (slides.length === 0) return <div className="h-[50vh] bg-[#F3F4F6]" />;

  const prev = () => setIndex((i) => (i - 1 + slides.length) % slides.length);
  const next = () => setIndex((i) => (i + 1) % slides.length);

  return (
    <>
      <div className="relative h-[50vh] min-h-[320px] max-h-[640px] bg-[#111827] group">
        <Image src={slides[index]} alt={title} fill unoptimized priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />

        {slides.length > 1 && (
          <>
            <button type="button" onClick={prev} className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Previous">
              <ChevronLeft size={20} />
            </button>
            <button type="button" onClick={next} className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" aria-label="Next">
              <ChevronRight size={20} />
            </button>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setIndex(i)}
                  className={cn("w-2 h-2 rounded-full transition-colors", i === index ? "bg-white" : "bg-white/40")}
                  aria-label={`Slide ${i + 1}`}
                />
              ))}
            </div>
          </>
        )}

        <button
          type="button"
          onClick={() => setFullscreen(true)}
          className="absolute top-4 right-4 w-10 h-10 rounded-lg bg-black/50 text-white flex items-center justify-center hover:bg-black/70"
          aria-label="Fullscreen"
        >
          <Maximize2 size={18} />
        </button>
      </div>

      {fullscreen && (
        <div className="fixed inset-0 z-[100] bg-black flex flex-col">
          <div className="flex justify-end p-4">
            <button type="button" onClick={() => setFullscreen(false)} className="text-white p-2" aria-label="Close">
              <X size={28} />
            </button>
          </div>
          <div className="relative flex-1 flex items-center justify-center px-4">
            <button type="button" onClick={prev} className="absolute left-4 text-white p-2"><ChevronLeft size={36} /></button>
            <div className="relative w-full max-w-6xl h-full max-h-[85vh]">
              <Image src={slides[index]} alt="" fill unoptimized className="object-contain" sizes="100vw" />
            </div>
            <button type="button" onClick={next} className="absolute right-4 text-white p-2"><ChevronRight size={36} /></button>
          </div>
          <p className="text-center text-white/60 text-sm pb-4">{index + 1} / {slides.length}</p>
        </div>
      )}
    </>
  );
}
