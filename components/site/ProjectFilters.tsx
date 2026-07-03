"use client";

import { useI18n } from "@/lib/i18n";
import type { FilterState } from "@/components/FilterBar";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  cities: string[];
}

export function ProjectFilters({ filters, onChange, cities }: Props) {
  const { t } = useI18n();

  const statuses = [
    { label: t.filter.status, value: "" },
    { label: t.status["Under Construction"], value: "Under Construction" },
    { label: t.status.Ready, value: "Ready" },
    { label: t.status["Sold Out"], value: "Sold Out" },
  ];

  function set(key: keyof FilterState, value: string | number) {
    onChange({ ...filters, [key]: value });
  }

  const selectCls =
    "w-full h-11 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#111827] outline-none focus:border-[#111827]";

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1.5">{t.filter.location}</label>
        <select className={selectCls} value={filters.city} onChange={(e) => set("city", e.target.value)}>
          <option value="">{t.filter.allLocations}</option>
          {cities.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1.5">{t.filter.status}</label>
        <select className={selectCls} value={filters.status} onChange={(e) => set("status", e.target.value)}>
          {statuses.map((s) => (
            <option key={s.value || "all"} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1.5">{t.home.searchType}</label>
        <select className={selectCls} value={filters.rooms} onChange={(e) => set("rooms", e.target.value)}>
          <option value="">{t.home.searchAnyType}</option>
          <option value="apartment">{t.home.searchTypes.apartment}</option>
          <option value="penthouse">{t.home.searchTypes.penthouse}</option>
        </select>
      </div>
    </div>
  );
}
