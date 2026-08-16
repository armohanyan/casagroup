"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Building2, Expand, X } from "lucide-react";
import { Container } from "@/components/site/Container";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { formatPrice } from "@/lib/format-price";
import { apartmentDisplayNumber, hasApartmentNumber } from "@/lib/apartment-number";
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
      {hasApartmentNumber(apartment) ? (
        <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#c9a96e]">
          № {apartmentDisplayNumber(apartment)}
        </p>
      ) : null}
      <p className="text-xs font-semibold text-white">
        {apartment.rooms} {t.aptDetail.bedrooms.toLowerCase()} · {apartment.area} m²
      </p>
      <p className="mt-0.5 text-xs text-[#c9a96e]">{formatPrice(apartment.price)}</p>
      <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/50">
        {getStatusLabel(t, apartment.status)}
      </p>
    </div>
  );
}

function FloorPlanCanvas({
  floor,
  aptById,
  title,
  hoveredAptId,
  tooltip,
  onHover,
  onLeave,
  onAptClick,
  onBackgroundClick,
  showExpandHint,
}: {
  floor: BuildingFloor;
  aptById: Map<string, Apartment>;
  title: string;
  hoveredAptId: string | null;
  tooltip: { aptId: string; x: number; y: number } | null;
  onHover: (aptId: string, x: number, y: number) => void;
  onLeave: () => void;
  onAptClick: (aptId: string) => void;
  onBackgroundClick?: () => void;
  showExpandHint?: boolean;
}) {
  const { t } = useI18n();
  const hoveredApt = hoveredAptId ? aptById.get(hoveredAptId) : undefined;

  return (
    <div className="relative w-full overflow-hidden rounded-sm">
      <div
        className={cn("relative w-full", onBackgroundClick && "cursor-zoom-in")}
        onClick={onBackgroundClick}
      >
        <Image
          src={floor.imageUrl}
          alt={`${title} — ${floor.label}`}
          width={1600}
          height={1200}
          className="pointer-events-none h-auto w-full object-contain"
          unoptimized
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {floor.hotspots.map((h) => {
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
                aria-label={`${hasApartmentNumber(apt) ? `№ ${apartmentDisplayNumber(apt)}, ` : ""}${apt.rooms} ${t.aptDetail.bedrooms}, ${apt.area} m²`}
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
                  const cx = h.points.reduce((s, p) => s + p[0], 0) / h.points.length;
                  const cy = h.points.reduce((s, p) => s + p[1], 0) / h.points.length;
                  onHover(h.apartmentId, cx, cy);
                }}
                onMouseLeave={onLeave}
                onClick={(e) => {
                  e.stopPropagation();
                  onAptClick(apt.id);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    e.stopPropagation();
                    onAptClick(apt.id);
                  }
                }}
              />
            );
          })}
        </svg>
        {floor.hotspots.map((h) => {
          const apt = aptById.get(h.apartmentId);
          if (!apt || apt.status !== "Sold") return null;
          const cx = h.points.reduce((s, p) => s + p[0], 0) / h.points.length;
          const cy = h.points.reduce((s, p) => s + p[1], 0) / h.points.length;
          return (
            <span
              key={`sold-${h.apartmentId}`}
              className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 rounded-sm bg-[#0c1428]/70 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-white sm:text-[10px]"
              style={{ left: `${cx}%`, top: `${cy}%` }}
            >
              {t.developerDetail.sold}
            </span>
          );
        })}
        {tooltip && hoveredApt && (
          <HotspotTooltip apartment={hoveredApt} x={tooltip.x} y={tooltip.y} />
        )}
      </div>
      {showExpandHint && onBackgroundClick ? (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onBackgroundClick();
          }}
          className="absolute right-2.5 top-2.5 z-10 flex h-8 w-8 items-center justify-center bg-transparent text-white hover:opacity-80 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          aria-label={t.developerDetail.floorMapExpand}
        >
          <Expand size={15} aria-hidden />
        </button>
      ) : null}
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
  const [expanded, setExpanded] = useState(false);
  const [expandedHoveredAptId, setExpandedHoveredAptId] = useState<string | null>(null);
  const [expandedTooltip, setExpandedTooltip] = useState<{
    aptId: string;
    x: number;
    y: number;
  } | null>(null);

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

  useEffect(() => {
    if (!expanded) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setExpanded(false);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [expanded]);

  const selectedFloor = floors.find((f) => f.id === selectedFloorId) ?? floors[0];

  const aptById = useMemo(() => {
    const map = new Map<string, Apartment>();
    for (const apt of project.apartments) map.set(apt.id, apt);
    return map;
  }, [project.apartments]);

  if (buildings.length === 0) return null;

  const goToApt = (aptId: string) => {
    router.push(`/projects/${project.slug}/apartments/${aptId}`);
  };

  return (
    <section id="building-floors" className="scroll-mt-24 bg-[#0c1428]">
      <Container className="py-10 md:py-14">
        {buildings.length > 1 && (
          <div className="mb-6 overflow-x-auto [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
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
                      "inline-flex items-center gap-2 rounded-[5px] px-3.5 py-2 text-sm font-semibold transition-colors",
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

        <h2 className="mb-6 text-2xl font-semibold leading-snug tracking-tight text-white sm:mb-8 sm:text-3xl">
          {t.developerDetail.floorMapTitle}
        </h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          <div className="w-full shrink-0 lg:w-[140px] xl:w-[160px]">
            <p className="mb-2.5 text-sm font-medium text-white/80">{t.developerDetail.chooseFloor}</p>
            <div
              className="flex flex-wrap gap-2.5 lg:flex-col"
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
                      "box-border flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-2 text-sm font-semibold transition-colors",
                      active
                        ? "border-[#c9a96e] bg-transparent text-white"
                        : "border-transparent bg-[#152038] text-white/85 hover:bg-[#1a2744]",
                    )}
                  >
                    {floor.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative min-w-0 flex-1">
            {selectedFloor ? (
              <div className="relative w-full">
                <FloorPlanCanvas
                  floor={selectedFloor}
                  aptById={aptById}
                  title={t.developerDetail.floorMapTitle}
                  hoveredAptId={hoveredAptId}
                  tooltip={tooltip}
                  onHover={(aptId, x, y) => {
                    setHoveredAptId(aptId);
                    setTooltip({ aptId, x, y });
                  }}
                  onLeave={() => {
                    setHoveredAptId(null);
                    setTooltip(null);
                  }}
                  onAptClick={goToApt}
                  onBackgroundClick={() => setExpanded(true)}
                  showExpandHint
                />
                {!selectedFloor.hotspots.length && (
                  <p className="mt-3 text-center text-xs text-white/40 lg:text-left">
                    {t.developerDetail.floorMapNoHotspots}
                  </p>
                )}
                <p className="mt-2 text-center text-[11px] text-white/35 sm:hidden">
                  {t.developerDetail.floorMapExpandHint}
                </p>
              </div>
            ) : (
              <div className="flex h-48 items-center justify-center text-sm text-white/40 sm:h-64">
                {t.developerDetail.floorMapEmpty}
              </div>
            )}
          </div>
        </div>
      </Container>

      <AnimatePresence>
        {expanded && selectedFloor ? (
          <motion.div
            className="fixed inset-0 z-[1200] flex flex-col bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.developerDetail.floorMapExpand}
          >
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">
                  {t.developerDetail.floorMapTitle}
                  {selectedBuilding?.name ? ` · ${selectedBuilding.name}` : ""}
                </p>
                <p className="mt-0.5 text-xs text-white/50">
                  {t.developerDetail.chooseFloor}: {selectedFloor.label}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setExpanded(false)}
                className="shrink-0 rounded-full p-2 text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="flex min-h-0 flex-1 items-center justify-center overflow-auto p-3 sm:p-6">
              <div className="w-full max-w-6xl">
                <FloorPlanCanvas
                  floor={selectedFloor}
                  aptById={aptById}
                  title={t.developerDetail.floorMapTitle}
                  hoveredAptId={expandedHoveredAptId}
                  tooltip={expandedTooltip}
                  onHover={(aptId, x, y) => {
                    setExpandedHoveredAptId(aptId);
                    setExpandedTooltip({ aptId, x, y });
                  }}
                  onLeave={() => {
                    setExpandedHoveredAptId(null);
                    setExpandedTooltip(null);
                  }}
                  onAptClick={(aptId) => {
                    setExpanded(false);
                    goToApt(aptId);
                  }}
                />
              </div>
            </div>

            <p className="shrink-0 px-4 pb-4 text-center text-xs text-white/40">
              {t.developerDetail.floorMapExpandHint}
            </p>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}
