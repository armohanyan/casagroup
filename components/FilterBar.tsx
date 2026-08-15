import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import { getCityDisplayName } from "@/lib/project-i18n";
import { useProjects } from "@/lib/projects-context";

export interface FilterState {
  city: string;
  status: string;
  minPrice: number;
  maxPrice: number;
  rooms: string;
}

interface Props {
  filters: FilterState;
  onChange: (f: FilterState) => void;
  cities: string[];
  /** When true, status filter uses apartment statuses (Available, Reserved, Sold). */
  apartmentMode?: boolean;
}

const inputCls = "field-select min-w-0 rounded-lg py-2.5 h-auto font-sans";

export function FilterBar({ filters, onChange, cities, apartmentMode = false }: Props) {
  const { t, lang } = useI18n();
  const { projects } = useProjects();

  const statuses: { label: string; value: string }[] = apartmentMode
    ? [
        { label: t.filter.status, value: "" },
        { label: t.status.Available, value: "Available" },
        { label: t.status.Reserved, value: "Reserved" },
        { label: t.status.Sold, value: "Sold" },
      ]
    : [
        { label: t.filter.status, value: "" },
        { label: t.status["Under Construction"], value: "Under Construction" },
        { label: t.status["Ready"], value: "Ready" },
        { label: t.status["Sold Out"], value: "Sold Out" },
      ];

  function set(key: keyof FilterState, value: string | number) {
    onChange({ ...filters, [key]: value });
  }

  return (
    <motion.div
      className="min-w-0 max-w-full rounded-xl border border-[#E7E0D5] bg-white p-5 shadow-sm shadow-black/[0.04]"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex min-w-0 max-w-full flex-wrap items-end gap-4">
        {/* City */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
          <label className="field-label">{t.filter.location}</label>
          <select className={inputCls} value={filters.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">{t.filter.allLocations}</option>
            {cities.map((c) => <option key={c} value={c}>{getCityDisplayName(c, projects, lang)}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[160px] md:min-w-[180px]">
          <label className="field-label">{t.filter.status}</label>
          <select className={inputCls} value={filters.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Price */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
          <label className="field-label">{t.filter.maxPrice}</label>
          <select className={inputCls} value={filters.maxPrice} onChange={(e) => set("maxPrice", Number(e.target.value))}>
            <option value={0}>{t.filter.anyPrice}</option>
            {[20_000_000, 40_000_000, 50_000_000, 60_000_000, 100_000_000].map((limit) => (
              <option key={limit} value={limit}>
                {t.filter.upTo} {formatPrice(limit)}
              </option>
            ))}
          </select>
        </div>

        {/* Rooms */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[120px]">
          <label className="field-label">{t.filter.rooms}</label>
          <select className={inputCls} value={filters.rooms} onChange={(e) => set("rooms", e.target.value)}>
            <option value="">{t.filter.anyRooms}</option>
            <option value="1">1 BR</option>
            <option value="2">2 BR</option>
            <option value="3">3 BR</option>
            <option value="4">4+ BR</option>
          </select>
        </div>

        {/* Reset */}
        <button
          type="button"
          className="cursor-pointer py-2.5 text-xs tracking-widest text-[#57534E] uppercase transition-colors hover:text-[#c9a96e] sm:w-auto sm:self-end"
          onClick={() => onChange({ city: "", status: "", minPrice: 0, maxPrice: 0, rooms: "" })}
        >
          {t.filter.clearFilters}
        </button>
      </div>
    </motion.div>
  );
}
