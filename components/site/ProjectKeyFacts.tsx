"use client";

import type { LucideIcon } from "lucide-react";
import { CalendarDays, Home, Landmark, Layers, Search } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { useI18n, type Lang } from "@/lib/i18n";
import { isNeighborhood } from "@/lib/building-kind";
import { getProjectCompletionDate, getProjectConstructionStart } from "@/lib/project-i18n";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface Fact {
  id: string;
  icon: LucideIcon;
  label: string;
  value: string;
}

function periodValue(project: Project, lang: Lang): string {
  const start = getProjectConstructionStart(project, lang).trim();
  const end = getProjectCompletionDate(project, lang).trim();
  if (start && end) return `${start} – ${end}`;
  return end || start;
}

export function ProjectKeyFacts({
  project,
  className,
}: {
  project: Project;
  className?: string;
}) {
  const { t, lang } = useI18n();
  const total = project.totalApartments;
  const available = project.availableApartmentsCount;
  const period = periodValue(project, lang);
  const hasFullPeriod = Boolean(
    getProjectConstructionStart(project, lang).trim() && getProjectCompletionDate(project, lang).trim(),
  );

  const facts: Fact[] = [];

  if (total > 0) {
    facts.push({
      id: "apartments",
      icon: Search,
      label: t.projectDetail.factApartments,
      value: String(total),
    });
  } else if (available > 0) {
    facts.push({
      id: "available",
      icon: Search,
      label: t.projectDetail.factAvailable,
      value: String(available),
    });
  }

  if (period) {
    facts.push({
      id: "period",
      icon: CalendarDays,
      label: hasFullPeriod ? t.projectDetail.factConstructionPeriod : t.developerDetail.constructionEnd,
      value: period,
    });
  }

  if (project.floors > 0) {
    facts.push({
      id: "floors",
      icon: Layers,
      label: t.projectDetail.factFloors,
      value: String(project.floors),
    });
  }

  const neighborhoodLand = (project.buildings ?? [])
    .filter(isNeighborhood)
    .reduce((sum, b) => sum + (b.landArea && b.landArea > 0 ? b.landArea : 0), 0);
  if (neighborhoodLand > 0) {
    facts.push({
      id: "land",
      icon: Landmark,
      label: t.projectDetail.factLand,
      value: `${neighborhoodLand} m²`,
    });
  }

  if (total > 0) {
    facts.push({
      id: "available",
      icon: Home,
      label: t.projectDetail.factAvailable,
      value: String(available),
    });
  }

  if (project.startingPrice > 0) {
    facts.push({
      id: "price",
      icon: Landmark,
      label: t.projectDetail.factPriceFrom,
      value: formatPrice(project.startingPrice),
    });
  }

  if (facts.length === 0) return null;

  return (
    <div className={cn("rounded-[10px] bg-[#F9FAFB] p-3 sm:p-3.5", className)}>
      <dl className="grid grid-cols-[repeat(auto-fill,minmax(min(100%,14.5rem),1fr))] gap-3">
        {facts.map((fact) => {
          const Icon = fact.icon;
          return (
            <div
              key={fact.id}
              className="flex min-w-0 items-center gap-3.5 rounded-lg border border-[#E8EAED] bg-white px-4 py-3.5 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition-shadow hover:shadow-sm"
            >
              <Icon
                className="size-[22px] shrink-0 text-[#3F3F46]"
                strokeWidth={1.6}
                aria-hidden
              />
              <div className="min-w-0">
                <dt className="text-[12px] leading-4 text-[#9CA3AF]">{fact.label}</dt>
                <dd className="mt-0.5 text-[15px] font-bold leading-5 text-[#111827] tabular-nums [overflow-wrap:anywhere]">
                  {fact.value}
                </dd>
              </div>
            </div>
          );
        })}
      </dl>
    </div>
  );
}
