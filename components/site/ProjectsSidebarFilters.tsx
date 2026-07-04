"use client";

import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import type { FilterState } from "@/components/FilterBar";

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  cities: string[];
}

export function ProjectsSidebarFilters({ filters, onChange, cities }: Props) {
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

  const fieldCls = "w-full h-10 px-3 rounded-lg border border-[#E5E7EB] bg-white text-sm text-[#0c1428] outline-none focus:border-[#0c1428]";

  return (
    <div className="bg-white rounded-lg border border-[#E5E7EB] p-4 space-y-4">
      <p className="text-sm font-semibold text-[#0c1428]">{t.projects.filtersTitle}</p>

      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">{t.filter.location}</label>
        <select className={fieldCls} value={filters.city} onChange={(e) => set("city", e.target.value)}>
          <option value="">{t.filter.allLocations}</option>
          {cities.map((c) => <option key={c} value={c}>{c}</option>)}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">{t.filter.maxPrice}</label>
        <select className={fieldCls} value={filters.maxPrice} onChange={(e) => set("maxPrice", Number(e.target.value))}>
          <option value={0}>{t.filter.anyPrice}</option>
          {[100_000_000, 200_000_000, 400_000_000, 600_000_000].map((p) => (
            <option key={p} value={p}>{formatPrice(p)}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">{t.filter.rooms}</label>
        <select className={fieldCls} value={filters.rooms} onChange={(e) => set("rooms", e.target.value)}>
          <option value="">{t.filter.anyRooms}</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4+</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">{t.home.searchType}</label>
        <select className={fieldCls} defaultValue="apartment">
          <option value="apartment">{t.home.searchTypes.apartment}</option>
          <option value="penthouse">{t.home.searchTypes.penthouse}</option>
        </select>
      </div>

      <div>
        <label className="block text-xs font-medium text-[#6B7280] mb-1">{t.filter.status}</label>
        <select className={fieldCls} value={filters.status} onChange={(e) => set("status", e.target.value)}>
          {statuses.map((s) => <option key={s.value || "all"} value={s.value}>{s.label}</option>)}
        </select>
      </div>

      <button
        type="button"
        onClick={() => onChange({ city: "", status: "", minPrice: 0, maxPrice: 0, rooms: "" })}
        className="w-full text-xs font-medium text-[#6B7280] hover:text-[#0c1428] py-2"
      >
        {t.filter.clearFilters}
      </button>
    </div>
  );
}
