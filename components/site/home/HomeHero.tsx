"use client";

import { useCallback, useEffect, useState } from "react";
import { DEFAULT_HERO_SLIDES } from "@/lib/site-images";
import { fetchHeroSlides } from "@/lib/api-client";
import { toBrowserMediaUrl } from "@/lib/media-url";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { Container } from "@/components/site/Container";
import { PropertySearchBar } from "@/components/site/PropertySearchBar";

const SLIDE_MS = 6500;

export function HomeHero() {
  const { t } = useI18n();
  const { projects } = useProjects();
  const cities = [...new Set(projects.map((p) => p.city))];
  const [slides, setSlides] = useState<string[]>(() => DEFAULT_HERO_SLIDES.map(toBrowserMediaUrl));
  const [index, setIndex] = useState(0);

  useEffect(() => {
    let cancelled = false;
    fetchHeroSlides()
      .then((rows) => {
        if (cancelled) return;
        const urls = rows
          .map((s) => toBrowserMediaUrl(s.imageUrl))
          .filter(Boolean);
        if (urls.length) {
          setSlides(urls);
          setIndex(0);
        }
      })
      .catch(() => {
        /* keep defaults */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (slides.length < 2) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % slides.length);
    }, SLIDE_MS);
    return () => window.clearInterval(id);
  }, [slides.length]);

  const goTo = useCallback((i: number) => setIndex(i), []);

  const total = slides.length;
  const pad = (n: number) => String(n).padStart(2, "0");

  return (
    <section className="relative flex h-[100dvh] min-h-[640px] flex-col bg-[#0c1428]">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        {slides.map((src, i) => (
          // User-uploaded slides may use hosts outside next/image remotePatterns;
          // plain img + /uploads rewrite is reliable for admin media.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={src}
            src={src}
            alt=""
            decoding={i === 0 ? "sync" : "async"}
            fetchPriority={i === 0 ? "high" : "low"}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
              i === index ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div className="absolute inset-0 bg-black/45" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent" />
      </div>

      <Container className="relative z-10 flex h-full w-full flex-col pt-28 pb-24 md:pb-7">
        <div className="flex flex-1 flex-col justify-center">
          <div className="max-w-xl md:max-w-2xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[3.25rem] font-semibold text-white leading-[1.15] tracking-tight">
              {t.home.heroHeadline}
            </h1>
            <p className="mt-4 text-sm sm:text-base md:text-lg text-white/85 max-w-lg leading-relaxed">
              {t.home.heroSubline}
            </p>
          </div>

          <div className="mt-8 max-w-5xl md:mt-10">
            <PropertySearchBar cities={cities} variant="hero" />
          </div>
        </div>

        {total > 1 && (
          <div className="mt-auto flex items-center gap-3 text-white/90" aria-label="Hero slides">
            <span className="text-xs font-medium tabular-nums tracking-wider">{pad(index + 1)}</span>
            <div className="flex h-px w-28 sm:w-36 items-center gap-1">
              {slides.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => goTo(i)}
                  aria-label={`Slide ${i + 1}`}
                  className={`h-px flex-1 rounded-full transition-colors ${
                    i === index ? "bg-white" : "bg-white/35 hover:bg-white/60"
                  }`}
                />
              ))}
            </div>
            <span className="text-xs font-medium tabular-nums tracking-wider">{pad(total)}</span>
          </div>
        )}
      </Container>
    </section>
  );
}
