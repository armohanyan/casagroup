"use client";

import Image from "next/image";
import Link from "next/link";
import { BedDouble, Layers, Maximize2 } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { listingCode } from "@/lib/listing-code";
import { estimateMonthlyPayment } from "@/lib/mortgage-estimate";
import { formatUnitLine } from "@/lib/unit-summary";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import type { Apartment } from "@/types";

interface Props {
  apartment: Apartment;
  projectSlug: string;
  entrance?: number;
}

export function DeveloperUnitCard({ apartment, projectSlug, entrance = 1 }: Props) {
  const { t, lang } = useI18n();
  const sold = apartment.status === "Sold";
  const reserved = apartment.status === "Reserved";
  const monthly = estimateMonthlyPayment(apartment.price);
  const code = listingCode(apartment.id);
  const href = `/projects/${projectSlug}/apartments/${apartment.id}`;
  const cover = apartment.floorPlanImage || apartment.gallery[0];

  const body = (
    <>
      <div className="relative aspect-[4/3] bg-[#F3EFE8] border-b border-[#E7E0D5]">
        {cover ? (
          <Image
            src={cover}
            alt={`${apartment.rooms} BR · ${t.table.floor} ${apartment.floor}`}
            fill
            unoptimized
            sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 25vw"
            className={
              cover === apartment.floorPlanImage
                ? "object-contain p-3"
                : "object-cover"
            }
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#A8A29E] text-[10px] tracking-widest uppercase">
            {t.aptDetail.layoutTitle}
          </div>
        )}
      </div>
      <div className="p-4">
        <p className="text-lg sm:text-xl font-bold text-[#1C1917] tabular-nums leading-tight">
          {sold ? "—" : formatPrice(apartment.price)}
        </p>
        <p className="mt-1 text-xs text-[#57534E]">
          {t.developerDetail.monthlyPayment}{" "}
          <span className="font-semibold text-[#1C1917] tabular-nums">
            {sold ? "—" : formatPrice(Math.round(monthly))}
          </span>
        </p>
        <p className="mt-3 text-xs text-[#57534E] leading-relaxed">
          {formatUnitLine(lang, entrance, apartment.floor, apartment.area, apartment.rooms)}
        </p>
        <div className="flex items-center gap-4 mt-3 text-xs text-[#A8A29E]">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={14} className="text-[#c9a96e]" />
            {apartment.rooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Layers size={14} className="text-[#c9a96e]" />
            {apartment.floor}
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize2 size={14} className="text-[#c9a96e]" />
            {apartment.area} m²
          </span>
        </div>
      </div>
      <div className="px-4 pb-4">
        <span className="text-[11px] font-semibold text-[#57534E] tabular-nums tracking-wide">{code}</span>
      </div>
      {(sold || reserved) && (
        <div className="absolute inset-0 bg-white/75 backdrop-blur-[1px] flex items-center justify-center">
          <span
            className={`px-4 py-2 rounded-md text-sm font-bold uppercase tracking-wide ${
              sold ? "bg-brand/90 text-white" : "bg-brand text-white"
            }`}
          >
            {sold ? t.developerDetail.sold : getStatusLabel(t, apartment.status)}
          </span>
        </div>
      )}
    </>
  );

  const className =
    "relative block bg-white border border-[#E7E0D5] rounded-lg overflow-hidden hover:border-[#c9a96e]/50 hover:shadow-md transition-all";

  if (sold) {
    return <article className={className}>{body}</article>;
  }

  return (
    <Link href={href} className={className}>
      {body}
    </Link>
  );
}
