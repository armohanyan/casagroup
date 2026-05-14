import { motion } from "framer-motion";
import { useI18n } from "@/lib/i18n";

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
}

const inputCls =
  "w-full min-w-0 bg-[#0f1e30] border border-[#2a2520] text-[#f0ece4] text-sm rounded-lg px-4 py-2.5 outline-none focus:border-[#c9a96e] transition-colors appearance-none cursor-pointer placeholder-[#5a554f] font-['DM_Sans']";

export function FilterBar({ filters, onChange, cities }: Props) {
  const { t } = useI18n();

  const statuses: { label: string; value: string }[] = [
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
      className="min-w-0 max-w-full rounded-xl border border-[#2a2520] bg-[#0d1829] p-5"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex min-w-0 max-w-full flex-wrap items-end gap-4">
        {/* City */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
          <label className="text-xs tracking-widest uppercase text-[#5a554f]">{t.filter.location}</label>
          <select className={inputCls} value={filters.city} onChange={(e) => set("city", e.target.value)}>
            <option value="">{t.filter.allLocations}</option>
            {cities.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Status */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[160px] md:min-w-[180px]">
          <label className="text-xs tracking-widest uppercase text-[#5a554f]">{t.filter.status}</label>
          <select className={inputCls} value={filters.status} onChange={(e) => set("status", e.target.value)}>
            {statuses.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
          </select>
        </div>

        {/* Price */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[140px] md:min-w-[160px]">
          <label className="text-xs tracking-widest uppercase text-[#5a554f]">{t.filter.maxPrice}</label>
          <select className={inputCls} value={filters.maxPrice} onChange={(e) => set("maxPrice", Number(e.target.value))}>
            <option value={9999999}>{t.filter.anyPrice}</option>
            <option value={200000}>{t.filter.upTo200}</option>
            <option value={350000}>{t.filter.upTo350}</option>
            <option value={500000}>{t.filter.upTo500}</option>
            <option value={1000000}>{t.filter.upTo1M}</option>
          </select>
        </div>

        {/* Rooms */}
        <div className="flex min-w-0 w-full flex-col gap-1.5 sm:w-auto sm:min-w-[120px]">
          <label className="text-xs tracking-widest uppercase text-[#5a554f]">{t.filter.rooms}</label>
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
          className="cursor-pointer py-2.5 text-xs tracking-widest text-[#9a9085] uppercase transition-colors hover:text-[#c9a96e] sm:w-auto sm:self-end"
          onClick={() => onChange({ city: "", status: "", minPrice: 0, maxPrice: 9999999, rooms: "" })}
        >
          {t.filter.clearFilters}
        </button>
      </div>
    </motion.div>
  );
}
