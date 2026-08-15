"use client";

import { useMemo, useState } from "react";
import { ChevronDown, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import { getCityDisplayName } from "@/lib/project-i18n";
import { useProjects } from "@/lib/projects-context";
import type { FilterState } from "@/components/FilterBar";
import { cn } from "@/lib/utils";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  cities: string[];
}

const selectCls =
  "field-select !h-11 min-w-0 w-full rounded-lg text-sm font-sans lg:!h-9";

function FilterField({
  label,
  children,
  className,
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex w-full min-w-0 flex-col gap-1.5 lg:flex-1 lg:basis-0", className)}>
      <label className="field-label">{label}</label>
      {children}
    </div>
  );
}

function countActiveFilters(filters: FilterState) {
  let count = 0;
  if (filters.city) count++;
  if (filters.status) count++;
  if (filters.maxPrice > 0) count++;
  if (filters.rooms) count++;
  return count;
}

export function ProjectsSidebarFilters({ filters, onChange, cities }: Props) {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const [open, setOpen] = useState(false);
  const activeCount = useMemo(() => countActiveFilters(filters), [filters]);

  const statuses = [
    { label: t.filter.anyStatus, value: "" },
    { label: t.status["Under Construction"], value: "Under Construction" },
    { label: t.status.Ready, value: "Ready" },
    { label: t.status["Sold Out"], value: "Sold Out" },
  ];

  function set(key: keyof FilterState, value: string | number) {
    onChange({ ...filters, [key]: value });
  }

  function clearFilters() {
    onChange({ city: "", status: "", minPrice: 0, maxPrice: 0, rooms: "" });
  }

  const fields = (
    <>
      <FilterField label={t.filter.location}>
        <select className={selectCls} value={filters.city} onChange={(e) => set("city", e.target.value)}>
          <option value="">{t.filter.allLocations}</option>
          {cities.map((c) => (
            <option key={c} value={c}>
              {getCityDisplayName(c, projects, lang)}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t.filter.maxPrice}>
        <select className={selectCls} value={filters.maxPrice} onChange={(e) => set("maxPrice", Number(e.target.value))}>
          <option value={0}>{t.filter.anyPrice}</option>
          {[100_000_000, 200_000_000, 400_000_000, 600_000_000].map((p) => (
            <option key={p} value={p}>
              {formatPrice(p)}
            </option>
          ))}
        </select>
      </FilterField>

      <FilterField label={t.filter.rooms}>
        <select className={selectCls} value={filters.rooms} onChange={(e) => set("rooms", e.target.value)}>
          <option value="">{t.filter.anyRooms}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </FilterField>

      <FilterField label={t.home.searchType}>
        <select className={selectCls} defaultValue="apartment">
          <option value="apartment">{t.home.searchTypes.apartment}</option>
          <option value="penthouse">{t.home.searchTypes.penthouse}</option>
        </select>
      </FilterField>

      <FilterField label={t.filter.status}>
        <select className={selectCls} value={filters.status} onChange={(e) => set("status", e.target.value)}>
          {statuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
      </FilterField>
    </>
  );

  return (
    <div className="rounded-xl border border-[#E7E0D5] bg-white shadow-sm shadow-black/[0.04]">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 px-3 py-2 text-left lg:hidden",
          open && "border-b border-[#E7E0D5] bg-[#FAFAF9]",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#F5F0E8]">
          <SlidersHorizontal size={16} className="text-[#c9a96e]" />
        </span>
        <span className="text-sm font-semibold text-[#0c1428]">{t.projects.filtersTitle}</span>
        {activeCount > 0 && (
          <span className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-[#c9a96e] px-1.5 text-[10px] font-bold text-white">
            {activeCount}
          </span>
        )}
        <ChevronDown
          size={18}
          className={cn("ml-auto shrink-0 text-[#6B7280] transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      <div className={cn("lg:hidden", !open && "hidden")}>
        <div className="flex flex-col gap-3.5 p-4">{fields}</div>
        <div className="flex flex-col gap-2 border-t border-[#E7E0D5] bg-[#FAFAF9] p-4">
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-11 w-full rounded-lg bg-[#0c1428] text-sm font-semibold text-white transition-colors hover:bg-[#1F2937]"
          >
            {t.filter.applyFilters}
          </button>
          <button
            type="button"
            onClick={clearFilters}
            className="h-10 w-full text-xs font-medium text-[#57534E] transition-colors hover:text-[#c9a96e]"
          >
            {t.filter.clearFilters}
          </button>
        </div>
      </div>

      <div className="hidden min-w-0 items-end gap-2 p-4 lg:flex">
        {fields}
        <button
          type="button"
          onClick={clearFilters}
          className="mb-0.5 h-9 shrink-0 px-3 text-xs font-medium text-[#57534E] whitespace-nowrap transition-colors hover:text-[#c9a96e]"
        >
          {t.filter.clearFilters}
        </button>
      </div>
    </div>
  );
}
