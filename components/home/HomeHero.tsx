"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useConsultationModal } from "@/lib/consultation-modal";
import { siteImages } from "@/lib/site-images";
import { Reveal } from "./Reveal";

export function HomeHero() {
  const { t } = useI18n();
  const { openConsultation } = useConsultationModal();
  const sectionRef = useRef<HTMLElement>(null);
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  });
  const bgY = useTransform(scrollYProgress, [0, 1], ["0%", "18%"]);
  const contentY = useTransform(scrollYProgress, [0, 1], ["0%", "8%"]);
  const opacity = useTransform(scrollYProgress, [0, 0.75], [1, 0]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 12;
      const y = (e.clientY / window.innerHeight - 0.5) * 8;
      setMouse({ x, y });
    };
    window.addEventListener("mousemove", handler, { passive: true });
    return () => window.removeEventListener("mousemove", handler);
  }, []);

  return (
    <section ref={sectionRef} className="relative h-[100dvh] min-h-[640px] overflow-hidden">
      <motion.div className="absolute inset-0" style={{ y: bgY }}>
        <div
          className="absolute inset-[-4%] transition-transform duration-700 ease-out will-change-transform"
          style={{ transform: `translate(${mouse.x}px, ${mouse.y}px) scale(1.08)` }}
        >
          <Image
            src={siteImages.hero.home}
            alt=""
            fill
            priority
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#0F172A]/70 via-[#0F172A]/55 to-[#0F172A]/80" />
      </motion.div>

      <motion.div
        className="relative z-10 flex h-full max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16"
        style={{ y: contentY, opacity }}
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between w-full gap-12 lg:gap-8">
          <div className="max-w-2xl">
            <Reveal delay={0.1}>
              <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#C8A96A] mb-6">
                {t.home.heroEyebrow}
              </p>
            </Reveal>
            <Reveal delay={0.2}>
              <h1 className="font-display text-[clamp(2.5rem,6vw,4.5rem)] font-medium text-white leading-[1.08] tracking-tight">
                {t.home.heroTitle}
              </h1>
            </Reveal>
            <Reveal delay={0.35}>
              <p className="mt-6 text-base md:text-lg text-white/75 leading-relaxed max-w-lg">
                {t.home.heroSubtitle}
              </p>
            </Reveal>
            <Reveal delay={0.45} className="mt-10 flex flex-wrap gap-4">
              <Link
                href="/projects"
                className="inline-flex h-12 items-center justify-center px-8 rounded-sm bg-[#C8A96A] text-[#0F172A] text-sm font-semibold tracking-wide hover:bg-[#d4b87a] transition-colors"
              >
                {t.home.heroCtaProjects}
              </Link>
              <button
                type="button"
                onClick={openConsultation}
                className="inline-flex h-12 items-center justify-center px-8 rounded-sm border border-white/40 text-white text-sm font-semibold tracking-wide hover:bg-white/10 transition-colors"
              >
                {t.home.heroCtaConsultation}
              </button>
            </Reveal>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-4 w-full max-w-md">
            {t.home.heroStats.map((stat, i) => (
              <Reveal key={stat.label} delay={0.3 + i * 0.08}>
                <div className="backdrop-blur-md bg-white/8 border border-white/15 rounded-lg p-6 hover:bg-white/12 transition-colors">
                  <p className="font-display text-3xl font-medium text-white tabular-nums">{stat.value}</p>
                  <p className="mt-2 text-xs text-white/60 uppercase tracking-wider leading-snug">{stat.label}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </motion.div>

      <motion.a
        href="#search"
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/50 hover:text-white/80 transition-colors"
        style={{ opacity }}
        aria-label={t.home.heroScroll}
      >
        <span className="text-[10px] uppercase tracking-[0.3em]">{t.home.heroScroll}</span>
        <motion.div animate={{ y: [0, 6, 0] }} transition={{ repeat: Infinity, duration: 1.8, ease: "easeInOut" }}>
          <ChevronDown size={20} />
        </motion.div>
      </motion.a>
    </section>
  );
}
