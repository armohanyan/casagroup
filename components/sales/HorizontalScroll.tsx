"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export function HorizontalScroll({ children, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  function scroll(dir: "left" | "right") {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir === "left" ? -320 : 320, behavior: "smooth" });
  }

  return (
    <div className={`relative group/scroll ${className}`}>
      <button
        type="button"
        onClick={() => scroll("left")}
        className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full btn-outline opacity-0 group-hover/scroll:opacity-100 transition-opacity -ml-3 shadow-md"
        aria-label="Scroll left"
      >
        <ChevronLeft size={20} />
      </button>
      <div
        ref={ref}
        className="flex gap-4 overflow-x-auto pb-2 scroll-smooth snap-x snap-mandatory scrollbar-thin"
        style={{ scrollbarWidth: "thin" }}
      >
        {children}
      </div>
      <button
        type="button"
        onClick={() => scroll("right")}
        className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden sm:flex h-10 w-10 items-center justify-center rounded-full btn-outline opacity-0 group-hover/scroll:opacity-100 transition-opacity -mr-3 shadow-md"
        aria-label="Scroll right"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
}
