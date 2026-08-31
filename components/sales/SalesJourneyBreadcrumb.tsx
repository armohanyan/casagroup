"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

export type SalesJourneyCrumb = {
  label: string;
  onClick?: () => void;
};

interface Props {
  items: SalesJourneyCrumb[];
  onBack?: () => void;
  backLabel: string;
  ariaLabel: string;
  className?: string;
}

export function SalesJourneyBreadcrumb({
  items,
  onBack,
  backLabel,
  ariaLabel,
  className,
}: Props) {
  if (items.length === 0 && !onBack) return null;

  return (
    <div className={cn("border-b border-[#E5E7EB] bg-white", className)}>
      <div className="mx-auto flex max-w-7xl items-center gap-2 px-4 py-2.5 sm:gap-3 sm:px-6 sm:py-3">
        {onBack ? (
          <button
            type="button"
            onClick={onBack}
            className="inline-flex h-8 shrink-0 items-center gap-1 rounded-[5px] border border-[#E5E7EB] bg-[#FAFAFA] px-2 text-xs font-semibold text-[#0c1428] transition-colors hover:border-[#c9a96e] hover:bg-white sm:h-9 sm:gap-1.5 sm:px-3 sm:text-sm"
            aria-label={backLabel}
          >
            <ChevronLeft size={16} strokeWidth={2} className="shrink-0" aria-hidden />
            <span>{backLabel}</span>
          </button>
        ) : null}

        {items.length > 0 ? (
          <nav
            aria-label={ariaLabel}
            className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto text-xs [-ms-overflow-style:none] [scrollbar-width:none] sm:gap-1.5 sm:text-sm [&::-webkit-scrollbar]:hidden"
          >
            {items.map((item, index) => {
              const isLast = index === items.length - 1;
              const clickable = Boolean(item.onClick) && !isLast;

              return (
                <span key={`${item.label}-${index}`} className="flex shrink-0 items-center gap-1 sm:gap-1.5">
                  {index > 0 ? (
                    <ChevronRight
                      size={14}
                      strokeWidth={2}
                      className="shrink-0 text-[#D1D5DB]"
                      aria-hidden
                    />
                  ) : null}
                  {clickable ? (
                    <button
                      type="button"
                      onClick={item.onClick}
                      className="max-w-[9rem] truncate font-medium text-[#6B7280] transition-colors hover:text-[#c9a96e] sm:max-w-[12rem]"
                    >
                      {item.label}
                    </button>
                  ) : (
                    <span
                      className={cn(
                        "max-w-[9rem] truncate sm:max-w-[12rem]",
                        isLast ? "font-semibold text-[#0c1428]" : "font-medium text-[#6B7280]",
                      )}
                      aria-current={isLast ? "page" : undefined}
                    >
                      {item.label}
                    </span>
                  )}
                </span>
              );
            })}
          </nav>
        ) : null}
      </div>
    </div>
  );
}
