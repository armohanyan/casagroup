"use client";

import { useState } from "react";
import Link from "next/link";
import { Minus, Plus } from "lucide-react";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

type FaqSectionProps = {
  /** When set, only the first N items are shown with a link to /faq. */
  previewCount?: number;
  /** Hide eyebrow / title / subtitle (useful on the dedicated FAQ page hero). */
  hideHeading?: boolean;
  className?: string;
  id?: string;
};

export function FaqSection({
  previewCount,
  hideHeading = false,
  className,
  id = "faq",
}: FaqSectionProps) {
  const { t } = useI18n();
  const [open, setOpen] = useState<number | null>(0);

  const allItems = t.faq.items;
  const items =
    typeof previewCount === "number" && previewCount > 0
      ? allItems.slice(0, previewCount)
      : allItems;
  const showViewAll = typeof previewCount === "number" && allItems.length > items.length;

  return (
    <section id={id} className={cn("scroll-mt-24 border-t border-[#E5E7EB] bg-[#F9FAFB]", className)}>
      <Container className="py-14 md:py-20">
        {!hideHeading && (
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">
              {t.faq.eyebrow}
            </p>
            <h2 className="mt-2 font-display text-3xl tracking-tight text-[#0c1428] md:text-4xl">
              {t.faq.title}
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-[#6B7280] md:text-base">
              {t.faq.subtitle}
            </p>
          </div>
        )}

        <div
          className={cn(
            "mx-auto max-w-3xl space-y-3",
            hideHeading ? "mt-0" : "mt-10 md:mt-12",
          )}
        >
          {items.map((item, i) => {
            const isOpen = open === i;
            return (
              <div
                key={item.q}
                className={cn(
                  "overflow-hidden rounded-[5px] border bg-white transition-colors",
                  isOpen ? "border-[#c9a96e]/40" : "border-[#E5E7EB]",
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-sm font-medium leading-snug text-[#0c1428]">{item.q}</span>
                  <span className="shrink-0 text-[#c9a96e]">
                    {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                  </span>
                </button>
                {isOpen && (
                  <div className="border-t border-[#E5E7EB] px-5 pb-4">
                    <p className="pt-3 text-sm leading-relaxed text-[#6B7280]">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {showViewAll && (
          <div className="mt-8 text-center">
            <Link
              href="/faq"
              className="inline-flex h-11 items-center rounded-[5px] border border-[#E5E7EB] px-6 text-sm font-semibold text-[#0c1428] transition-colors hover:border-[#0c1428]"
            >
              {t.faq.viewAll}
            </Link>
          </div>
        )}
      </Container>
    </section>
  );
}
