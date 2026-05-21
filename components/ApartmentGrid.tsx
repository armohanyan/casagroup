import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  BedDouble,
  ChevronRight,
  Eye,
  Layers,
  Square,
  Sun,
} from "lucide-react";
import { StatusBadge } from "./ui/StatusBadge";
import { useI18n } from "@/lib/i18n";
import type { Apartment } from "@/types";
import { formatPrice } from "@/lib/format-price";

interface Props {
  apartments: Apartment[];
  projectSlug: string;
}

function apartmentCoverImage(apt: Apartment): string | undefined {
  return apt.gallery[0] ?? apt.floorPlanImage;
}

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-2.5 min-w-0">
      <Icon size={14} className="text-[#c9a96e] shrink-0" aria-hidden />
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-[#5a554f] leading-none">{label}</p>
        <p className="text-sm text-[#f0ece4] mt-0.5 truncate">{value}</p>
      </div>
    </div>
  );
}

export function ApartmentGrid({ apartments, projectSlug }: Props) {
  const { t } = useI18n();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
      {apartments.map((apt, i) => {
        const cover = apartmentCoverImage(apt);
        const href = `/projects/${projectSlug}/apartments/${apt.id}`;

        return (
          <motion.article
            key={apt.id}
            className="group bg-[#0d1829] border border-[#2a2520] rounded-xl overflow-hidden hover:border-[#c9a96e]/40 transition-colors"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06, duration: 0.45 }}
          >
            <Link href={href} className="block">
              <div className="relative aspect-[4/3] overflow-hidden bg-[#162035]">
                {cover ? (
                  <Image
                    src={cover}
                    alt={`${apt.rooms} BR · ${t.table.floor} ${apt.floor}`}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 100vw, (max-width: 1280px) 50vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-[#5a554f] text-xs tracking-widest uppercase">
                    {t.table.view}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0d1829] via-[#0d1829]/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <StatusBadge status={apt.status} />
                </div>
                <p className="absolute bottom-3 right-3 font-['Cormorant_Garamond'] text-2xl text-[#c9a96e]">
                  {formatPrice(apt.price)}
                </p>
              </div>

              <div className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-['Cormorant_Garamond'] text-xl text-[#f0ece4] leading-tight">
                    {apt.rooms} {t.aptDetail.bedroomApt}
                  </p>
                  <span className="inline-flex items-center gap-1 text-xs tracking-widest uppercase text-[#c9a96e] shrink-0 pt-1 opacity-80 group-hover:opacity-100 transition-opacity">
                    {t.table.viewBtn}
                    <ChevronRight size={12} />
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-x-4 gap-y-3">
                  <SpecItem
                    icon={Layers}
                    label={t.table.floor}
                    value={apt.floor}
                  />
                  <SpecItem
                    icon={BedDouble}
                    label={t.table.rooms}
                    value={`${apt.rooms} BR`}
                  />
                  <SpecItem
                    icon={Square}
                    label={t.table.area}
                    value={`${apt.area} m²`}
                  />
                  <SpecItem
                    icon={Eye}
                    label={t.table.view}
                    value={apt.viewType}
                  />
                </div>

                {apt.balcony && (
                  <div className="flex items-center gap-2 pt-1 border-t border-[#2a2520]">
                    <Sun size={14} className="text-[#c9a96e]" aria-hidden />
                    <span className="text-xs text-[#9a9085]">{t.aptDetail.balcony}</span>
                  </div>
                )}
              </div>
            </Link>
          </motion.article>
        );
      })}
    </div>
  );
}
