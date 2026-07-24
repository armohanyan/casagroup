"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Quote, Star } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { SectionHeader } from "./SectionHeader";
import { Reveal } from "./Reveal";

export function HomeTestimonials() {
  const { t } = useI18n();
  const items = t.home.testimonials;
  const [index, setIndex] = useState(0);

  const prev = () => setIndex((i) => (i === 0 ? items.length - 1 : i - 1));
  const next = () => setIndex((i) => (i === items.length - 1 ? 0 : i + 1));

  const current = items[index];

  return (
    <section className="py-16 md:py-24 bg-[#0F172A]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <SectionHeader
          eyebrow={t.home.testimonialsEyebrow}
          title={t.home.testimonialsTitle}
          centered
          className="[&_h2]:text-white [&_p]:text-white/50"
        />

        <Reveal delay={0.1}>
          <div className="relative max-w-3xl mx-auto text-center">
            <Quote size={40} className="mx-auto text-[#c9a96e]/40 mb-8" strokeWidth={1} />

            <AnimatePresence mode="wait">
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex justify-center gap-1 mb-8">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} size={14} className="fill-[#c9a96e] text-[#c9a96e]" />
                  ))}
                </div>
                <blockquote className="font-display text-xl md:text-2xl text-white/90 leading-relaxed italic">
                  &ldquo;{current.quote}&rdquo;
                </blockquote>
                <div className="mt-10">
                  <p className="text-white font-semibold">{current.name}</p>
                  <p className="text-sm text-white/50 mt-1">{current.role}</p>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="flex items-center justify-center gap-4 mt-12">
              <button
                type="button"
                onClick={prev}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                aria-label="Previous testimonial"
              >
                <ChevronLeft size={20} />
              </button>
              <div className="flex gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setIndex(i)}
                    className={`w-2 h-2 rounded-full transition-colors ${i === index ? "bg-[#c9a96e]" : "bg-white/25"}`}
                    aria-label={`Testimonial ${i + 1}`}
                  />
                ))}
              </div>
              <button
                type="button"
                onClick={next}
                className="w-11 h-11 flex items-center justify-center rounded-full border border-white/20 text-white hover:bg-white/10 transition-colors"
                aria-label="Next testimonial"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
