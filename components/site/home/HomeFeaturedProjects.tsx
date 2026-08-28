"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Container } from "@/components/site/Container";
import { ProjectCard } from "@/components/site/ProjectCard";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

export function HomeFeaturedProjects({ projects }: { projects: Project[] }) {
  const { t } = useI18n();
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(true);
  const showCarouselArrows = projects.length > 3;

  const updateButtons = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanPrev(scrollLeft > 4);
    setCanNext(scrollLeft < scrollWidth - clientWidth - 4);
  }, []);

  useEffect(() => {
    if (!showCarouselArrows) return;
    const el = scrollRef.current;
    if (!el) return;
    updateButtons();
    el.addEventListener("scroll", updateButtons, { passive: true });
    window.addEventListener("resize", updateButtons);
    return () => {
      el.removeEventListener("scroll", updateButtons);
      window.removeEventListener("resize", updateButtons);
    };
  }, [updateButtons, projects.length, showCarouselArrows]);

  function scroll(direction: "prev" | "next") {
    const el = scrollRef.current;
    if (!el) return;
    const card = el.querySelector<HTMLElement>("[data-card]");
    const gap = 24;
    const step = (card?.offsetWidth ?? 400) + gap;
    el.scrollBy({ left: direction === "next" ? step : -step, behavior: "smooth" });
  }

  const sideArrowCls = (enabled: boolean) =>
    cn(
      "absolute top-[42%] -translate-y-1/2 z-10 hidden md:flex w-12 h-12 items-center justify-center rounded-full bg-white border shadow-[0_4px_16px_rgba(0,0,0,0.08)] transition-all",
      enabled
        ? "border-[#E5E7EB] text-[#0c1428] hover:border-[#c9a96e] hover:shadow-lg"
        : "border-[#F3F4F6] text-[#D1D5DB] cursor-not-allowed opacity-50",
    );

  if (projects.length === 0) return null;

  const cards = projects.map((project) => (
    <div
      key={project.id}
      data-card
      className={cn(
        "h-full",
        showCarouselArrows &&
          "snap-start shrink-0 w-[calc((100%-1rem)/1.3)] sm:w-[380px] lg:w-[calc((100%-3rem)/3)]",
      )}
    >
      <ProjectCard project={project} showAvailableUnits={false} />
    </div>
  ));

  return (
    <section className="py-16 md:py-24 bg-[#FAFAFA] overflow-hidden">
      <Container>
        <div className="flex flex-col gap-6 mb-10 md:mb-12 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            {t.home.featuredEyebrow ? (
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-[#c9a96e]">
                {t.home.featuredEyebrow}
              </p>
            ) : null}
            <h2 className={cn("font-display text-3xl md:text-[2.75rem] text-[#0c1428] tracking-tight leading-tight", t.home.featuredEyebrow ? "mt-2" : "")}>
              {t.home.featuredTitle}
            </h2>
          </div>

          <Link
            href="/projects"
            className="shrink-0 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52] transition-colors self-start lg:self-auto"
          >
            {t.home.featuredAll}
          </Link>
        </div>

        {showCarouselArrows ? (
          <div className="relative -mx-1">
            <button
              type="button"
              onClick={() => scroll("prev")}
              disabled={!canPrev}
              aria-label={t.home.featuredPrev}
              className={cn(sideArrowCls(canPrev), "-left-1 lg:-left-5")}
            >
              <ChevronLeft size={22} />
            </button>

            <div
              ref={scrollRef}
              className="flex items-stretch gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory py-2 px-1 md:gap-6 md:px-14 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
            >
              {cards}
            </div>

            <button
              type="button"
              onClick={() => scroll("next")}
              disabled={!canNext}
              aria-label={t.home.featuredNext}
              className={cn(sideArrowCls(canNext), "-right-1 lg:-right-5")}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 py-2 px-1 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
            {cards}
          </div>
        )}
      </Container>
    </section>
  );
}
