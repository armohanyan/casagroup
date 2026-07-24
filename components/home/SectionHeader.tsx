"use client";

import { Reveal } from "./Reveal";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeader({ eyebrow, title, subtitle, centered = false, className }: SectionHeaderProps) {
  return (
    <Reveal className={cn("mb-12 md:mb-16", centered && "text-center", className)}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-accent mb-3">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl md:text-4xl lg:text-[2.75rem] font-medium text-[#0F172A] leading-tight tracking-tight">
        {title}
      </h2>
      {subtitle && (
        <p className={cn("mt-4 text-base md:text-lg text-[#6B7280] leading-relaxed max-w-2xl", centered && "mx-auto")}>
          {subtitle}
        </p>
      )}
    </Reveal>
  );
}
