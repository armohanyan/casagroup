"use client";

import Image from "next/image";
import Link from "next/link";
import { MapPin, Bed, Maximize, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { FavoriteButton } from "@/components/FavoriteButton";
import { formatPrice } from "@/lib/format-price";
import { listingCode } from "@/lib/listing-code";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { PropertyListing } from "@/lib/properties";

interface CompactListingCardProps {
  listing: PropertyListing;
  className?: string;
  fullWidth?: boolean;
}

export function CompactListingCard({ listing, className, fullWidth }: CompactListingCardProps) {
  const { t } = useI18n();
  const { apartment, project } = listing;
  const image = apartment.gallery[0] ?? project.images[0];
  const code = listingCode(apartment.id);

  return (
    <Link
      href={`/projects/${project.slug}/apartments/${apartment.id}`}
      className={cn(
        "group block card-premium overflow-hidden hover:translate-y-[-2px]",
        fullWidth ? "w-full" : "flex-shrink-0 w-full sm:w-[300px]",
        className,
      )}
    >
      <div className="relative h-44 sm:h-48 bg-[#F3EFE8] image-zoom">
        {image ? (
          <Image
            src={image}
            alt={`${project.title} — ${apartment.rooms} ${t.table.rooms}`}
            fill
            sizes="(max-width: 640px) 100vw, 300px"
            className="object-cover zoom-target"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <div className="absolute top-3 left-3">
          <StatusBadge status={apartment.status} />
        </div>
        <div className="absolute top-3 right-3">
          <FavoriteButton apartmentId={apartment.id} />
        </div>
        <span className="absolute bottom-3 left-3 bg-white/95 text-[#1C1917] text-[11px] font-semibold px-2 py-0.5 rounded tabular-nums shadow-sm">
          {code}
        </span>
      </div>
      <div className="p-4">
        <p className="text-lg font-bold text-[#1C1917] tabular-nums group-hover:text-[#c9a96e] transition-colors">
          {formatPrice(apartment.price)}
        </p>

        <div className="flex items-center gap-1.5 text-[#57534E] text-sm mt-1.5">
          <MapPin size={13} className="text-[#c9a96e] shrink-0" />
          <span className="line-clamp-1">{project.location}</span>
        </div>

        <p className="text-xs text-[#A8A29E] mt-2 flex items-center gap-1">
          <Building2 size={12} className="shrink-0" />
          <span className="truncate">{project.title}</span>
        </p>

        <div className="flex items-center gap-4 text-sm text-[#57534E] pt-3 mt-3 border-t border-[#E7E0D5]">
          <span className="flex items-center gap-1.5">
            <Bed size={14} className="text-[#c9a96e]" />
            {apartment.rooms} {t.table.rooms}
          </span>
          <span className="flex items-center gap-1.5">
            <Maximize size={14} className="text-[#c9a96e]" />
            {apartment.area} m²
          </span>
          <span className="ml-auto text-xs text-[#A8A29E] tabular-nums">
            {apartment.floor}/{project.floors}
          </span>
        </div>
      </div>
    </Link>
  );
}
