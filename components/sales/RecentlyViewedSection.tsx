"use client";

import Link from "next/link";
import Image from "next/image";
import { Clock } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { useRecentlyViewed } from "@/lib/use-recently-viewed";
import { formatPrice } from "@/lib/format-price";
import { HorizontalScroll } from "@/components/sales/HorizontalScroll";

export function RecentlyViewedSection() {
  const { t } = useI18n();
  const items = useRecentlyViewed();

  if (items === null || items.length === 0) return null;

  return (
    <section className="py-10 bg-[#F6F7FB]">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-0">
        <div className="flex items-center gap-2 mb-5">
          <Clock size={18} className="text-[#c9a96e]" />
          <h2 className="type-section-heading text-[#1C1917]">{t.sales.recentlyViewed}</h2>
        </div>
        <HorizontalScroll>
          {items.map((item) => (
            <Link
              key={item.apartmentId}
              href={`/projects/${item.projectSlug}/apartments/${item.apartmentId}`}
              className="group snap-start shrink-0 w-[220px] card-premium overflow-hidden hover:translate-y-[-2px]"
            >
              <div className="relative h-28 bg-[#F3EFE8] image-zoom">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="220px"
                    className="object-cover zoom-target"
                  />
                ) : null}
              </div>
              <div className="p-3">
                <p className="text-sm font-bold text-[#1C1917] tabular-nums group-hover:text-[#c9a96e] transition-colors">
                  {formatPrice(item.price)}
                </p>
                <p className="text-xs text-[#57534E] mt-0.5 line-clamp-1">{item.title}</p>
              </div>
            </Link>
          ))}
        </HorizontalScroll>
      </div>
    </section>
  );
}
