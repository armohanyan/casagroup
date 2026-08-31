"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react";
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
  /** Lock to one floor (sales journey). Hides building/floor pickers. */
  lockedFloorId?: string;
  /** Override section heading when embedded in the journey. */
  title?: string;
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
      className="pointer-events-none absolute z-20 rounded-[5px] border border-white/15 bg-[#0c1428]/95 px-3 py-2 text-left shadow-lg backdrop-blur-sm"
      style={{ left: x + 14, top: y + 14 }}
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
  expanded,
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
  expanded?: boolean;
}) {
  const { t } = useI18n();
  const frameRef = useRef<HTMLDivElement>(null);
  const hoveredApt = hoveredAptId ? aptById.get(hoveredAptId) : undefined;

  function trackHover(aptId: string, e: ReactMouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    onHover(aptId, e.clientX - rect.left, e.clientY - rect.top);
  }

  return (
    <div className={cn("map relative h-full w-full", !expanded && "mb-1")}>
      <div
        ref={frameRef}
        className={cn("relative h-full w-full", onBackgroundClick && "cursor-zoom-in")}
        onClick={onBackgroundClick}
      >
        {/* Match building/exterior maps: stretch image to the frame so % hotspots stay aligned (no object-contain). */}
        <img
          src={floor.imageUrl}
          alt={`${title} - ${floor.label}`}
          className={cn(
            "pointer-events-none block w-full select-none",
            expanded ? "h-auto w-full" : "h-auto max-h-[52vh] object-contain sm:max-h-[60vh] md:max-h-screen md:min-h-[80vh] md:object-cover",
          )}
          draggable={false}
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          className="absolute left-0 top-0 z-10 h-full w-full"
        >
          {floor.hotspots.map((h) => {
            const apt = aptById.get(h.apartmentId);
            if (!apt) return null;
            const sold = apt.status === "Sold";
            const active = !sold && hoveredAptId === h.apartmentId;
            return (
              <polygon
                key={h.apartmentId}
                points={pointsToSvg(h.points)}
                role={sold ? undefined : "link"}
                tabIndex={sold ? undefined : 0}
                aria-label={`${hasApartmentNumber(apt) ? `№ ${apartmentDisplayNumber(apt)}, ` : ""}${apt.rooms} ${t.aptDetail.bedrooms}, ${apt.area} m²${sold ? ` - ${t.developerDetail.sold}` : ""}`}
                className={cn(
                  "outline-none",
                  sold ? "pointer-events-none cursor-default" : "cursor-pointer transition-all duration-150",
                  sold
                    ? "fill-white/10 stroke-transparent"
                    : active
                      ? "fill-[#c9a96e]/40 stroke-[#c9a96e] stroke-[0.35]"
                      : "fill-[#c9a96e]/22 stroke-transparent",
                )}
                onMouseEnter={sold ? undefined : (e) => trackHover(h.apartmentId, e)}
                onMouseMove={sold ? undefined : (e) => trackHover(h.apartmentId, e)}
                onMouseLeave={sold ? undefined : onLeave}
                onClick={
                  sold
                    ? undefined
                    : (e) => {
                        e.stopPropagation();
                        onAptClick(apt.id);
                      }
                }
                onKeyDown={
                  sold
                    ? undefined
                    : (e) => {
                        if (e.key === "Enter" || e.key === " ") {
                          e.preventDefault();
                          e.stopPropagation();
                          onAptClick(apt.id);
                        }
                      }
                }
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
        {tooltip && hoveredApt && hoveredApt.status !== "Sold" && (
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
          className="absolute right-2.5 top-2.5 z-40 flex h-8 w-8 items-center justify-center rounded-full bg-black/40 text-white backdrop-blur-sm hover:bg-black/55 sm:right-3 sm:top-3 sm:h-9 sm:w-9"
          aria-label={t.developerDetail.floorMapExpand}
        >
          <Expand size={15} aria-hidden />
        </button>
      ) : null}
    </div>
  );
}

function FloorMapExpandedOverlay({
  floor,
  aptById,
  title,
  hoveredAptId,
  tooltip,
  onHover,
  onLeave,
  onAptClick,
  onClose,
}: {
  floor: BuildingFloor;
  aptById: Map<string, Apartment>;
  title: string;
  hoveredAptId: string | null;
  tooltip: { aptId: string; x: number; y: number } | null;
  onHover: (aptId: string, x: number, y: number) => void;
  onLeave: () => void;
  onAptClick: (aptId: string) => void;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <motion.div
      className="fixed inset-0 z-[1200] flex flex-col bg-black/95"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      role="dialog"
      aria-modal="true"
      aria-label={t.developerDetail.floorMapExpand}
    >
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-white/10 px-4 py-3 sm:px-5">
        <p className="min-w-0 truncate text-sm font-medium text-white">
          {title} - {floor.label}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
          aria-label={t.developerDetail.floorMapClose}
        >
          <X size={20} aria-hidden />
        </button>
      </div>

      <div className="relative min-h-0 flex-1 overflow-auto">
        <FloorPlanCanvas
          expanded
          floor={floor}
          aptById={aptById}
          title={title}
          hoveredAptId={hoveredAptId}
          tooltip={tooltip}
          onHover={onHover}
          onLeave={onLeave}
          onAptClick={onAptClick}
        />
      </div>
    </motion.div>
  );
}

export function BuildingFloorMapSection({ project, lockedFloorId, title }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const buildings = useMemo(() => sortedBuildings(project.buildings), [project.buildings]);
  const locked = Boolean(lockedFloorId);

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    () => buildings[0]?.id ?? null,
  );
  const selectedBuilding = buildings.find((b) => b.id === selectedBuildingId) ?? buildings[0];
  const floors = useMemo(() => sortedFloors(selectedBuilding?.floors), [selectedBuilding]);

  const [selectedFloorId, setSelectedFloorId] = useState<string | null>(
    () => lockedFloorId ?? null,
  );
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
    if (lockedFloorId) {
      setSelectedFloorId(lockedFloorId);
      for (const b of buildings) {
        if ((b.floors ?? []).some((f) => f.id === lockedFloorId)) {
          setSelectedBuildingId(b.id);
          break;
        }
      }
      return;
    }
    if (!floors.length) {
      setSelectedFloorId(null);
      return;
    }
    if (!selectedFloorId || !floors.some((f) => f.id === selectedFloorId)) {
      setSelectedFloorId(floors[0].id);
    }
  }, [floors, selectedFloorId, lockedFloorId, buildings]);

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

  const selectedFloor =
    (lockedFloorId
      ? floors.find((f) => f.id === lockedFloorId) ??
        buildings.flatMap((b) => b.floors ?? []).find((f) => f.id === lockedFloorId)
      : floors.find((f) => f.id === selectedFloorId)) ?? floors[0];

  const aptById = useMemo(() => {
    const map = new Map<string, Apartment>();
    for (const apt of project.apartments) map.set(apt.id, apt);
    return map;
  }, [project.apartments]);

  if (buildings.length === 0) return null;

  const goToApt = (aptId: string) => {
    const apt = aptById.get(aptId);
    if (apt?.status === "Sold") return;
    router.push(`/projects/${project.slug}/apartments/${aptId}`);
  };

  const floorCanvas = selectedFloor ? (
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
        <p
          className={cn(
            "mt-3 text-center text-xs text-[#9CA3AF]",
            !locked && "lg:text-left",
            locked && "px-4 sm:px-0",
          )}
        >
          {t.developerDetail.floorMapNoHotspots}
        </p>
      )}
      {!locked ? (
        <p className="mt-2 text-center text-[11px] text-[#9CA3AF] sm:hidden">
          {t.developerDetail.floorMapExpandHint}
        </p>
      ) : null}
    </div>
  ) : (
    <div className="flex h-48 items-center justify-center text-sm text-[#9CA3AF] sm:h-64">
      {t.developerDetail.floorMapEmpty}
    </div>
  );

  // Locked journey: full-bleed floor map (Defanse-style)
  if (locked) {
    return (
      <section id="building-floors" className="mapped-section relative w-full">
        {floorCanvas}

        <AnimatePresence>
          {expanded && selectedFloor ? (
            <FloorMapExpandedOverlay
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
              onClose={() => setExpanded(false)}
            />
          ) : null}
        </AnimatePresence>
      </section>
    );
  }

  return (
    <section id="building-floors" className="scroll-mt-24 border-t border-[#E5E7EB]">
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
                        : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#0c1428]",
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

        <h2 className="mb-4 text-xl font-semibold leading-snug tracking-tight text-[#0c1428] sm:mb-6 sm:text-2xl md:mb-8 md:text-3xl">
          {title ?? t.developerDetail.floorMapTitle}
        </h2>

        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8 xl:gap-10">
          <div className="w-full shrink-0 lg:w-[140px] xl:w-[160px]">
            <p className="mb-2 text-xs font-medium text-[#6B7280] sm:mb-2.5 sm:text-sm">{t.developerDetail.chooseFloor}</p>
            <div
              className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden lg:flex-col lg:gap-2.5 lg:overflow-visible lg:pb-0"
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
                      "box-border flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 text-xs font-semibold transition-colors sm:h-9 sm:w-9 sm:text-sm lg:h-10 lg:w-10",
                      active
                        ? "border-[#c9a96e] bg-transparent text-[#0c1428]"
                        : "border-transparent bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#0c1428]",
                    )}
                  >
                    {floor.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="relative min-w-0 flex-1">{floorCanvas}</div>
        </div>
      </Container>

      <AnimatePresence>
        {expanded && selectedFloor ? (
          <FloorMapExpandedOverlay
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
            onClose={() => setExpanded(false)}
          />
        ) : null}
      </AnimatePresence>
    </section>
  );
}
