"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Building2 } from "lucide-react";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import { cn } from "@/lib/utils";
import type { Apartment, Building, BuildingFloor, Project } from "@/types";

interface Props {
  project: Project;
}

function sortedBuildings(buildings: Building[] | undefined) {
  return [...(buildings ?? [])]
    .filter((b) => b.name.trim() && (b.floors ?? []).some((f) => f.imageUrl.trim()))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function sortedFloors(floors: BuildingFloor[] | undefined) {
  return [...(floors ?? [])]
    .filter((f) => f.imageUrl.trim())
    .sort(
      (a, b) =>
        a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
}

function pointsToSvg(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function HotspotTooltip({
  apartment,
  x,
  y,
}: {
  apartment: Apartment;
  x: number;
  y: number;
}) {
  const { t } = useI18n();
  return (
    <div
      className="pointer-events-none absolute z-20 -translate-x-1/2 -translate-y-[110%] rounded-[5px] border border-white/15 bg-[#0c1428]/95 px-3 py-2 text-left shadow-lg backdrop-blur-sm"
      style={{ left: `${x}%`, top: `${y}%` }}
    >
      <p className="text-xs font-semibold text-white">
        {apartment.rooms} {t.aptDetail.bedrooms.toLowerCase()} · {apartment.area} m²
      </p>
      <p className="mt-0.5 text-xs text-[#c9a96e]">{formatPrice(apartment.price)}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/50">{apartment.status}</p>
    </div>
  );
}

export function BuildingFloorMapSection({ project }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const buildings = useMemo(() => sortedBuildings(project.buildings), [project.buildings]);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    () => buildings[0]?.id ?? null,
  );
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0];
  const floors = useMemo(() => sortedFloors(selectedBuilding?.floors), [selectedBuilding]);

  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(null);
  const [hoveredAptId, setHoveredAptId] = useState<string | null>(null);
  const [tooltip, setTooltip] = useState<{ aptId: string; x: number; y: number } | null>(null);

  useEffect(() => {
    if (!buildings.length) {
      setSelectedBuildingId(null);
      return;
    }
    if (!selectedBuildingId || !buildings.some((b) => b.id === selectedBuildingId)) {
      setSelectedBuildingId(buildings[0].id);
    }
  }, [buildings, selectedBuildingId]);

  useEffect(() => {
    if (!floors.length) {
      setSelectedFloorId(null);
      return;
    }
    if (!selectedFloorId || !floors.some((f) => f.id === selectedFloorId)) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId]);

  const selectedFloor = floors.find((f) => f.id === selectedFloorId) ?? floors[0];

  const aptById = useMemo(() => {
    const map = new Map<string, Apartment>();
    for (const apt of project.apartments) map.set(apt.id, apt);
    return map;
  }, [project.apartments]);

  if (buildings.length === 0) return null;

  const hoveredApt = hoveredAptId ? aptById.get(hoveredAptId) : undefined;

  return (
    <section id="building-floors" className="scroll-mt-24 bg-[#0c1428]">
      <Container className="py-12 md:py-16">
        {buildings.length > 1 && (
          <div className="mb-8 overflow-x-auto">
            <div
              className="flex min-w-max gap-2"
              role="tablist"
              aria-label={t.developerDetail.buildingsTitle}
            >
              {buildings.map((building) => {
                const active = building.id === selectedBuilding?.id;
                return (
                  <button
                    key={building.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedBuildingId(building.id)}
                    className={cn(
                      "inline-flex items-center gap-2 rounded-[5px] px-4 py-2.5 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[#c9a96e] text-[#0c1428]"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    <Building2 size={15} strokeWidth={1.75} />
                    {building.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,280px)_minmax(0,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
          <div className="flex flex-col justify-center">
            <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
              {t.developerDetail.floorMapTitle}
            </h2>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-white/60">
              {t.developerDetail.floorMapSubtitle}
            </p>
            <p className="mt-8 text-sm font-medium text-white/80">{t.developerDetail.chooseFloor}</p>

            <div
              className="mt-5 grid grid-cols-4 gap-2.5 sm:gap-3"
              role="listbox"
              aria-label={t.developerDetail.chooseFloor}
            >
              {floors.map((floor) => {
                const active = floor.id === selectedFloor?.id;
                return (
                  <button
                    key={floor.id}
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => setSelectedFloorId(floor.id)}
                    className={cn(
                      "flex aspect-square items-center justify-center rounded-full text-sm font-semibold transition-all",
                      active
                        ? "bg-transparent text-white ring-2 ring-[#c9a96e] ring-offset-2 ring-offset-[#0c1428]"
                        : "bg-[#152038] text-white/85 hover:bg-[#1a2744]",
                    )}
                  >
                    {floor.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative min-h-[280px]">
            {selectedFloor ? (
              <div className="relative w-full overflow-hidden rounded-sm">
                <div className="relative w-full">
                  <Image
                    src={selectedFloor.imageUrl}
                    alt={`${t.developerDetail.floorMapTitle} — ${selectedFloor.label}`}
                    width={1200}
                    height={900}
                    className="h-auto w-full object-contain"
                    unoptimized
                  />
                  <svg
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute inset-0 h-full w-full"
                  >
                    {selectedFloor.hotspots.map((h) => {
                      const apt = aptById.get(h.apartmentId);
                      if (!apt) return null;
                      const active = hoveredAptId === h.apartmentId;
                      const sold = apt.status === "Sold";
                      return (
                        <polygon
                          key={h.apartmentId}
                          points={pointsToSvg(h.points)}
                          role="link"
                          tabIndex={0}
                          aria-label={`${apt.rooms} ${t.aptDetail.bedrooms}, ${apt.area} m²`}
                          className={cn(
                            "cursor-pointer outline-none transition-all duration-150",
                            sold
                              ? active
                                ? "fill-white/25 stroke-white/40"
                                : "fill-white/10 stroke-transparent"
                              : active
                                ? "fill-[#e85d4c]/70 stroke-[#c9a96e] stroke-[0.35]"
                                : "fill-[#e85d4c]/40 stroke-transparent",
                          )}
                          onMouseEnter={() => {
                            setHoveredAptId(h.apartmentId);
                            const cx = h.points.reduce((s, p) => s + p[0], 0) / h.points.length;
                            const cy = h.points.reduce((s, p) => s + p[1], 0) / h.points.length;
                            setTooltip({ aptId: h.apartmentId, x: cx, y: cy });
                          }}
                          onMouseLeave={() => {
                            setHoveredAptId(null);
                            setTooltip(null);
                          }}
                          onClick={() => {
                            router.push(`/projects/${project.slug}/apartments/${apt.id}`);
                          }}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.preventDefault();
                              router.push(`/projects/${project.slug}/apartments/${apt.id}`);
                            }
                          }}
                        />
                      );
                    })}
                  </svg>
                  {tooltip && hoveredApt && (
                    <HotspotTooltip apartment={hoveredApt} x={tooltip.x} y={tooltip.y} />
                  )}
                </div>
                {!selectedFloor.hotspots.length && (
                  <p className="mt-3 text-center text-xs text-white/40">
                    {t.developerDetail.floorMapNoHotspots}
                  </p>
                )}
              </div>
            ) : (
              <div className="flex h-64 items-center justify-center text-sm text-white/40">
                {t.developerDetail.floorMapEmpty}
              </div>
            )}
          </div>
        </div>
      </Container>
    </section>
  );
}
