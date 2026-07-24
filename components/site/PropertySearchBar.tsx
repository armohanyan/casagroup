"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronDown, Search, SlidersHorizontal } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  cities: string[];
  className?: string;
  variant?: "hero" | "default";
}

export function PropertySearchBar({ cities, className, variant = "default" }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const isHero = variant === "hero";
  const [open, setOpen] = useState(false);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const params = new URLSearchParams();
    const city = String(fd.get("city") ?? "");
    const type = String(fd.get("type") ?? "");
    const maxPrice = String(fd.get("maxPrice") ?? "");
    const rooms = String(fd.get("rooms") ?? "");
    if (city) params.set("city", city);
    if (type) params.set("type", type);
    if (maxPrice) params.set("maxPrice", maxPrice);
    if (rooms) params.set("rooms", rooms);
    const qs = params.toString();
    router.push(qs ? `/projects?${qs}` : "/projects");
  }

  const labelCls = cn(
    "block text-xs font-semibold tracking-wide",
    isHero ? "text-[#374151]" : "text-[#6B7280]",
  );

  const selectCls = cn(
    "h-11 w-full min-w-0 px-3 rounded-[5px] border text-sm text-[#0c1428] outline-none transition-colors",
    "focus:border-[#0c1428] focus:ring-2 focus:ring-[#0c1428]/10",
    isHero ? "border-[#E5E7EB] bg-[#F9FAFB] hover:bg-white focus:bg-white" : "border-[#E5E7EB] bg-white",
  );

  const fieldWrap = "flex flex-col gap-1.5 min-w-0";

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "overflow-hidden rounded-[5px] border",
        isHero
          ? "border-[#E8EAED] bg-white shadow-[0_12px_40px_rgba(0,0,0,0.15)]"
          : "border-[#E5E7EB] bg-white shadow-lg",
        className,
      )}
    >
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className={cn(
          "flex w-full items-center gap-2.5 px-4 py-3 text-left sm:hidden",
          open && "border-b border-[#E5E7EB] bg-[#FAFAF9]",
        )}
      >
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[5px] bg-[#F5F0E8]">
          <SlidersHorizontal size={16} className="text-[#c9a96e]" />
        </span>
        <span className="text-sm font-semibold text-[#0c1428]">{t.home.searchButton}</span>
        <ChevronDown
          size={18}
          className={cn(
            "ml-auto shrink-0 text-[#6B7280] transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      <div
        className={cn(
          "grid gap-4 p-5 md:p-6",
          !open && "hidden sm:grid",
          isHero
            ? "grid-cols-1 sm:grid-cols-2 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_auto] xl:items-end"
            : "grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 lg:items-end",
        )}
      >
        <div className={fieldWrap}>
          <label className={labelCls}>{t.home.searchLocation}</label>
          <select name="city" className={selectCls} defaultValue="">
            <option value="">{t.home.searchAllLocations}</option>
            {cities.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldWrap}>
          <label className={labelCls}>{t.home.searchType}</label>
          <select name="type" className={selectCls} defaultValue="">
            <option value="">{t.home.searchAnyType}</option>
            <option value="apartment">{t.home.searchTypes.apartment}</option>
            <option value="penthouse">{t.home.searchTypes.penthouse}</option>
          </select>
        </div>

        <div className={fieldWrap}>
          <label className={labelCls}>{t.home.searchPrice}</label>
          <select name="maxPrice" className={selectCls} defaultValue="">
            <option value="">{t.home.searchAnyPrice}</option>
            {[100_000_000, 200_000_000, 400_000_000, 600_000_000].map((p) => (
              <option key={p} value={p}>
                {formatPrice(p)}
              </option>
            ))}
          </select>
        </div>

        <div className={fieldWrap}>
          <label className={labelCls}>{t.home.searchBedrooms}</label>
          <select name="rooms" className={selectCls} defaultValue="">
            <option value="">{t.home.searchAnyBedrooms}</option>
            {["1", "2", "3", "4"].map((n) => (
              <option key={n} value={n}>
                {n}
                {n === "4" ? "+" : ""}
              </option>
            ))}
          </select>
        </div>

        <div className={cn(fieldWrap, isHero ? "sm:col-span-2 xl:col-span-1" : "")}>
          <span className={cn(labelCls, "hidden xl:block invisible")} aria-hidden>
            {t.home.searchButton}
          </span>
          <button
            type="submit"
            className={cn(
              "inline-flex h-11 w-full items-center justify-center gap-2 rounded-[5px] text-sm font-semibold transition-all",
              "hover:opacity-95 active:scale-[0.98]",
              isHero
                ? "bg-[#c9a96e] text-[#0c1428] hover:bg-[#d4b87a] xl:w-auto xl:min-w-[148px] xl:shrink-0 xl:px-5"
                : "bg-[#c9a96e] text-[#0c1428] hover:bg-[#d4b87a]",
            )}
          >
            <Search size={16} strokeWidth={2.5} />
            <span className="whitespace-nowrap">{t.home.searchButton}</span>
          </button>
        </div>
      </div>
    </form>
  );
}
