"use client";

import { useMemo } from "react";
import { Container } from "@/components/site/Container";
import { PercentMapFrame } from "@/components/sales/PercentMapFrame";
import { useI18n } from "@/lib/i18n";
import { hasApartmentNumber, apartmentDisplayNumber } from "@/lib/apartment-number";
import type { Apartment, Building, BuildingFloor, FloorHotspot, Project } from "@/types";

interface Props {
  project: Project;
  apartment: Apartment;
}

function pointsToSvg(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function findApartmentFloorLocation(
  buildings: Building[] | undefined,
  apartmentId: string,
): { building: Building; floor: BuildingFloor; hotspot: FloorHotspot } | null {
  for (const building of buildings ?? []) {
    for (const floor of building.floors ?? []) {
      if (!floor.imageUrl.trim()) continue;
      const hotspot = floor.hotspots.find((h) => h.apartmentId === apartmentId);
      if (hotspot && hotspot.points.length >= 3) {
        return { building, floor, hotspot };
      }
    }
  }
  return null;
}

export function ApartmentFloorLocationSection({ project, apartment }: Props) {
  const { t } = useI18n();

  const location = useMemo(
    () => findApartmentFloorLocation(project.buildings, apartment.id),
    [project.buildings, apartment.id],
  );

  if (!location) return null;

  const { building, floor, hotspot } = location;
  const sold = apartment.status === "Sold";

  return (
    <section className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
      <Container className="py-10 md:py-14">
        <div className="mb-6 max-w-2xl">
          <h2 className="text-xl font-semibold text-[#0c1428] sm:text-2xl">
            {t.aptDetail.floorLocationTitle}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
            {hasApartmentNumber(apartment)
              ? `${t.aptDetail.unitNumberBadge.replace("{number}", apartmentDisplayNumber(apartment))} · `
              : ""}
            {t.aptDetail.floorLocationSubtitle
              .replace("{building}", building.name)
              .replace("{floor}", floor.label)}
          </p>
        </div>

        <div className="overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white p-3 shadow-sm sm:p-5">
          <PercentMapFrame
            imageUrl={floor.imageUrl}
            alt={`${t.aptDetail.floorLocationTitle} - ${building.name}, ${floor.label}`}
          >
            <svg
              viewBox="0 0 100 100"
              preserveAspectRatio="none"
              className="pointer-events-none absolute inset-0 h-full w-full"
              aria-hidden
            >
              <polygon
                points={pointsToSvg(hotspot.points)}
                className={
                  sold
                    ? "fill-white/30 stroke-white/50 stroke-[0.4]"
                    : "fill-[#c9a96e]/30 stroke-[#c9a96e] stroke-[0.4]"
                }
              />
            </svg>
          </PercentMapFrame>
        </div>
      </Container>
    </section>
  );
}
