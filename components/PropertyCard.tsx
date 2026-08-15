"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Bed, Maximize, Building2 } from "lucide-react";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { formatPrice } from "@/lib/format-price";
import { useI18n } from "@/lib/i18n";
import { getProjectLocation, getProjectTitle } from "@/lib/project-i18n";
import type { PropertyListing } from "@/lib/properties";

export function PropertyCard({ listing }: { listing: PropertyListing }) {
  const { t, lang } = useI18n();
  const { apartment, project } = listing;
  const title = getProjectTitle(project, lang);
  const location = getProjectLocation(project, lang);
  const image = apartment.gallery[0] ?? project.images[0];

  return (
    <motion.div
      className="group bg-white border border-[#E7E0D5] rounded-xl overflow-hidden hover:border-[#c9a96e]/40 hover:shadow-lg hover:shadow-black/5 transition-all duration-300 shadow-sm shadow-black/[0.04]"
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
    >
      <Link href={`/projects/${project.slug}/apartments/${apartment.id}`}>
        <div className="relative h-52 overflow-hidden">
          {image ? (
            <Image
              src={image}
              alt={`${title} — ${apartment.rooms} bedroom apartment`}
              fill
              unoptimized
              sizes="(max-width: 768px) 100vw, 33vw"
              className="object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent" />
          <div className="absolute top-3 left-3">
            <StatusBadge status={apartment.status} />
          </div>
        </div>

        <div className="p-5">
          <p className="font-sans font-semibold text-xl text-[#1C1917] group-hover:text-[#c9a96e] transition-colors mb-1">
            {formatPrice(apartment.price)}
          </p>

          <div className="flex items-center gap-1.5 text-[#57534E] text-sm mb-3">
            <MapPin size={13} className="text-[#c9a96e] shrink-0" />
            <span className="truncate">{location}</span>
          </div>

          <p className="text-xs text-[#A8A29E] mb-4 flex items-center gap-1">
            <Building2 size={12} />
            {title}
          </p>

          <div className="flex items-center gap-4 text-sm text-[#57534E] pt-3 border-t border-[#E7E0D5]">
            <span className="flex items-center gap-1.5">
              <Bed size={14} className="text-[#c9a96e]" />
              {apartment.rooms} {t.table.rooms}
            </span>
            <span className="flex items-center gap-1.5">
              <Maximize size={14} className="text-[#c9a96e]" />
              {apartment.area} m²
            </span>
            <span className="ml-auto text-xs text-[#c9a96e]">{t.card.view}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
