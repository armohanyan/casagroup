"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search } from "lucide-react";
import { motion } from "framer-motion";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";

interface Props {
  cities: string[];
}

const inputCls = "field-select rounded-lg py-3 h-auto font-sans";

export function PropertySearch({ cities }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const [city, setCity] = useState("");
  const [maxPrice, setMaxPrice] = useState(0);
  const [propertyType, setPropertyType] = useState("");
  const [rooms, setRooms] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (city) params.set("city", city);
    if (maxPrice > 0) params.set("maxPrice", String(maxPrice));
    if (rooms) params.set("rooms", rooms);
    if (propertyType) params.set("type", propertyType);
    const qs = params.toString();
    router.push(qs ? `/properties?${qs}` : "/properties");
  }

  return (
    <motion.form
      onSubmit={handleSearch}
      className="rounded-xl border border-[#E7E0D5] bg-white p-4 sm:p-5 shadow-lg shadow-black/[0.06]"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        <div className="flex flex-col gap-1 col-span-2 lg:col-span-1">
          <label className="field-label">{t.home.searchLocation}</label>
          <select className={inputCls} value={city} onChange={(e) => setCity(e.target.value)}>
            <option value="">{t.home.searchAllLocations}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="field-label">{t.home.searchPrice}</label>
          <select className={inputCls} value={maxPrice} onChange={(e) => setMaxPrice(Number(e.target.value))}>
            <option value={0}>{t.home.searchAnyPrice}</option>
            {[20_000_000, 40_000_000, 60_000_000, 100_000_000].map((limit) => (
              <option key={limit} value={limit}>{formatPrice(limit)}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="field-label">{t.home.searchType}</label>
          <select className={inputCls} value={propertyType} onChange={(e) => setPropertyType(e.target.value)}>
            <option value="">{t.home.searchAnyType}</option>
            <option value="apartment">{t.home.searchTypes.apartment}</option>
            <option value="penthouse">{t.home.searchTypes.penthouse}</option>
            <option value="commercial">{t.home.searchTypes.commercial}</option>
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="field-label">{t.home.searchBedrooms}</label>
          <select className={inputCls} value={rooms} onChange={(e) => setRooms(e.target.value)}>
            <option value="">{t.home.searchAnyBedrooms}</option>
            <option value="1">1</option>
            <option value="2">2</option>
            <option value="3">3</option>
            <option value="4">4+</option>
          </select>
        </div>

        <div className="flex items-end col-span-2 lg:col-span-1">
          <button
            type="submit"
            className="btn-outline flex w-full shrink-0 items-center justify-center gap-2 rounded-lg px-4 py-3 text-sm whitespace-nowrap"
          >
            <Search size={16} className="shrink-0" />
            {t.home.searchButton}
          </button>
        </div>
      </div>
    </motion.form>
  );
}
