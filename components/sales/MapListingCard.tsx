"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatPrice } from "@/lib/format-price";
import { apartmentDisplayNumber } from "@/lib/apartment-number";
import { useI18n } from "@/lib/i18n";
import type { PropertyListing } from "@/lib/properties";

interface Props {
  listing: PropertyListing;
  selected?: boolean;
  onSelect?: () => void;
}

export function MapListingCard({ listing, selected, onSelect }: Props) {
  const { t } = useI18n();
  const { apartment, project } = listing;
  const image = apartment.gallery[0] ?? project.images[0];
  const code = apartmentDisplayNumber(apartment);
  const href = `/projects/${project.slug}/apartments/${apartment.id}`;

  return (
    <article
      className={`rounded-lg border bg-white overflow-hidden transition-all ${
        selected
          ? "border-[#c9a96e] shadow-md ring-1 ring-[#c9a96e]/30"
          : "border-[#E7E0D5] hover:border-[#c9a96e]/40"
      }`}
    >
      <button
        type="button"
        onClick={onSelect}
        className="w-full flex gap-3 p-3 text-left"
      >
        <div className="relative h-20 w-24 shrink-0 rounded-md overflow-hidden bg-[#F3EFE8]">
          {image ? (
            <Image src={image} alt="" fill unoptimized sizes="96px" className="object-cover" />
          ) : null}
          <span className="absolute top-1 left-1 bg-white/95 text-[#1C1917] text-[10px] font-semibold px-1.5 py-0.5 rounded tabular-nums">
            № {code}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-[#1C1917] tabular-nums">{formatPrice(apartment.price)}</p>
          <div className="flex items-start gap-1 mt-1 text-xs text-[#57534E]">
            <MapPin size={12} className="text-[#c9a96e] shrink-0 mt-0.5" />
            <span className="line-clamp-2 leading-snug">{project.location}</span>
          </div>
          <div className="flex items-center gap-2 mt-1.5 text-[11px] text-[#A8A29E]">
            <span>
              {apartment.rooms} {t.table.rooms.toLowerCase()}
            </span>
            <span>
              {apartment.floor} / {project.floors}
            </span>
            <span>{apartment.area} m²</span>
          </div>
        </div>
      </button>
      <div className="px-3 pb-3 -mt-1">
        <Link
          href={href}
          className="text-xs font-semibold text-[#c9a96e] hover:text-[#a88a52]"
        >
          {t.sales.viewListing} →
        </Link>
      </div>
    </article>
  );
}
