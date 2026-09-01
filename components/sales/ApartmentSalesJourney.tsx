"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Container } from "@/components/site/Container";
import { BuildingFloorMapSection } from "@/components/sales/BuildingFloorMapSection";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { MapPinMarker } from "@/components/sales/MapPinMarker";
import { PlanTextLabelsOverlay } from "@/components/sales/PlanTextLabelsOverlay";
import {
  SalesJourneyBreadcrumb,
  type SalesJourneyCrumb,
} from "@/components/sales/SalesJourneyBreadcrumb";
import { useI18n, type Lang } from "@/lib/i18n";
import { projectSalesMode, usesMapStages } from "@/lib/sales-mode";
import { cn } from "@/lib/utils";
import type {
  Building,
  BuildingFloor,
  MapStageHotspot,
  Project,
  ProjectMapStage,
} from "@/types";

interface Props {
  project: Project;
}

type TipPos = { x: number; y: number };

/** Defanse-style map shell (visibility controlled by page wrappers). */
const MAPPED_SECTION = "mapped-section relative w-full";
const MAP_FRAME = "map relative mb-1 h-full w-full";
/** Exact Defanse image classes — capped height on phones so maps stay readable. */
const MAP_IMG =
  "h-auto w-full max-h-[52vh] object-contain sm:max-h-[60vh] md:max-h-screen md:min-h-[80vh] md:object-cover";
const MAP_SVG = "absolute left-0 top-0 z-10 h-full w-full";

function stageLabel(stage: ProjectMapStage, lang: Lang): string {
  if (lang === "hy") return stage.labelHy?.trim() || stage.label || stage.labelRu || "";
  if (lang === "ru") return stage.labelRu?.trim() || stage.label || stage.labelHy || "";
  return stage.label?.trim() || stage.labelHy || stage.labelRu || "";
}

function pointsToSvg(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function markerPos(h: MapStageHotspot): { x: number; y: number } {
  if (h.markerX != null && h.markerY != null) return { x: h.markerX, y: h.markerY };
  if (h.points.length === 0) return { x: 50, y: 50 };
  const sx = h.points.reduce((s, p) => s + p[0], 0);
  const sy = h.points.reduce((s, p) => s + p[1], 0);
  return { x: sx / h.points.length, y: sy / h.points.length };
}

function sortedFloors(floors: BuildingFloor[] | undefined) {
  return [...(floors ?? [])].sort(
    (a, b) =>
      a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
}

function sortedBuildings(buildings: Building[] | undefined) {
  return [...(buildings ?? [])]
    .filter((b) => b.name.trim())
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function rootStage(stages: ProjectMapStage[]): ProjectMapStage | null {
  const roots = stages.filter((s) => !s.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  return roots[0] ?? null;
}

/** Rebuild map drill-down stack from a stage id via parentId chain. */
function stageAncestry(
  stageId: string,
  stagesById: Map<string, ProjectMapStage>,
): ProjectMapStage[] {
  const stack: ProjectMapStage[] = [];
  let cur: ProjectMapStage | undefined = stagesById.get(stageId);
  const seen = new Set<string>();
  while (cur && !seen.has(cur.id)) {
    seen.add(cur.id);
    stack.unshift(cur);
    cur = cur.parentId ? stagesById.get(cur.parentId) : undefined;
  }
  return stack;
}

type JourneyParams = {
  stage?: string | null;
  building?: string | null;
  floor?: string | null;
};

function tipFromEvent(e: ReactMouseEvent, el: HTMLElement): TipPos {
  const rect = el.getBoundingClientRect();
  return { x: e.clientX - rect.left, y: e.clientY - rect.top };
}

function hotspotDisplayLabel(
  h: MapStageHotspot,
  buildingsById: Map<string, Building>,
  stagesById: Map<string, ProjectMapStage>,
  lang: Lang,
): string {
  if (h.targetType === "building") {
    return buildingsById.get(h.targetId)?.name.trim() || h.label || "·";
  }
  const target = stagesById.get(h.targetId);
  return (target ? stageLabel(target, lang) : "") || h.label || "·";
}

function HoverTip({
  tip,
  title,
  actionLabel,
  onAction,
}: {
  tip: TipPos;
  title: string;
  actionLabel: string;
  onAction: () => void;
}) {
  return (
    <div
      className="pointer-events-auto absolute z-30 min-w-[9.5rem] max-w-[14rem] rounded-[5px] bg-white px-3.5 py-2.5 shadow-xl"
      style={{ left: tip.x + 14, top: tip.y + 14 }}
    >
      <p className="mb-2 text-sm font-semibold text-[#0c1428]">{title}</p>
      <button
        type="button"
        className="w-full rounded-[5px] bg-[#0c1428] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#c9a96e] hover:text-[#0c1428]"
        onClick={onAction}
      >
        {actionLabel}
      </button>
    </div>
  );
}

function MapStageView({
  stage,
  stagesById,
  buildingsById,
  lang,
  onSelectStage,
  onSelectBuilding,
  moreLabel,
  buildingsLabel,
}: {
  stage: ProjectMapStage;
  stagesById: Map<string, ProjectMapStage>;
  buildingsById: Map<string, Building>;
  lang: Lang;
  onSelectStage: (stage: ProjectMapStage) => void;
  onSelectBuilding: (building: Building) => void;
  moreLabel: string;
  buildingsLabel: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tip, setTip] = useState<TipPos | null>(null);
  const hovered = stage.hotspots.find((h) => h.id === hoveredId) ?? null;
  const stripHotspots = stage.hotspots.filter((h) => h.points.length >= 3 || h.targetType === "building");

  const tipTitle = hovered
    ? hovered.targetType === "building"
      ? buildingsById.get(hovered.targetId)?.name || hovered.label
      : (() => {
          const target = stagesById.get(hovered.targetId);
          return target ? stageLabel(target, lang) : hovered.label;
        })()
    : "";

  function activate(h: MapStageHotspot) {
    if (h.targetType === "building") {
      const b = buildingsById.get(h.targetId);
      if (b) onSelectBuilding(b);
      return;
    }
    const next = stagesById.get(h.targetId);
    if (next) onSelectStage(next);
  }

  function track(e: ReactMouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    setTip(tipFromEvent(e, el));
  }

  if (!stage.imageUrl.trim()) return null;

  return (
    <section id="sales-journey" className={MAPPED_SECTION}>
      <div
        ref={frameRef}
        className={MAP_FRAME}
        onMouseLeave={() => {
          setHoveredId(null);
          setTip(null);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="mappedImage"
          src={stage.imageUrl}
          alt={stage.label}
          className={MAP_IMG}
          draggable={false}
          decoding="async"
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          fill="none"
          className={MAP_SVG}
          aria-hidden={false}
        >
          {stage.hotspots.map((h) => {
            if (h.points.length < 3) return null;
            const active = hoveredId === h.id;
            return (
              <g key={h.id}>
                <polygon
                  points={pointsToSvg(h.points)}
                  className={cn(
                    "relative cursor-pointer fill-[#c9a96e]/5 transition duration-150 ease-in-out",
                    active && "fill-[#c9a96e]/40",
                  )}
                  onMouseEnter={() => setHoveredId(h.id)}
                  onMouseMove={track}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setTip(null);
                  }}
                  onClick={() => activate(h)}
                />
              </g>
            );
          })}
        </svg>
        {stage.hotspots.map((h) => {
          if (h.points.length < 3) return null;
          const m = markerPos(h);
          return (
            <MapPinMarker
              key={`pin-${h.id}`}
              x={m.x}
              y={m.y}
              label={hotspotDisplayLabel(h, buildingsById, stagesById, lang)}
              className="hidden md:flex"
            />
          );
        })}
        {hovered && tip ? (
          <div className="popovers pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-full md:block">
            <HoverTip
              tip={tip}
              title={tipTitle || hotspotDisplayLabel(hovered, buildingsById, stagesById, lang)}
              actionLabel={moreLabel}
              onAction={() => activate(hovered)}
            />
          </div>
        ) : null}
      </div>
      {stripHotspots.length > 0 ? (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 md:hidden">
          <p className="mb-2 text-xs font-medium text-[#6B7280]">{buildingsLabel}</p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {stripHotspots.map((h) => {
              const label = hotspotDisplayLabel(h, buildingsById, stagesById, lang);
              return (
                <button
                  key={`mobile-strip-${h.id}`}
                  type="button"
                  title={label}
                  aria-label={label}
                  onClick={() => activate(h)}
                  className="shrink-0 rounded-[5px] border border-[#E5E7EB] bg-[#F3F4F6] px-3 py-1.5 text-xs font-semibold text-[#0c1428] transition-colors hover:border-[#c9a96e] hover:bg-[#0c1428] hover:text-white"
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
      {stripHotspots.length > 0 ? (
        <div className="mb-4 hidden items-center justify-end z-20 lg:mr-10 lg:flex">
          <div className="flex max-w-full flex-wrap items-center text-sm text-[#0c1428]">
            <span className="flex h-12 items-center justify-center border border-[#c9a96e] bg-[#c9a96e] p-4 text-white">
              {buildingsLabel}
            </span>
            {stripHotspots.map((h) => {
              const label = hotspotDisplayLabel(h, buildingsById, stagesById, lang);
              return (
                <button
                  key={`strip-${h.id}`}
                  type="button"
                  title={label}
                  aria-label={label}
                  onMouseEnter={() => setHoveredId(h.id)}
                  onMouseLeave={() => setHoveredId(null)}
                  onClick={() => activate(h)}
                  className={cn(
                    "flex h-12 min-w-12 cursor-pointer items-center justify-center border border-white bg-[#F3F4F6] px-3 transition duration-100 ease-in hover:border-[#c9a96e]",
                    hoveredId === h.id && "border-[#c9a96e]",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BuildingExteriorView({
  building,
  floors,
  onSelectFloor,
  moreLabel,
  floorLabelTemplate,
  emptyLabel,
  floorsLabel,
}: {
  building: Building;
  floors: BuildingFloor[];
  onSelectFloor: (floor: BuildingFloor) => void;
  moreLabel: string;
  floorLabelTemplate: string;
  emptyLabel: string;
  floorsLabel: string;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tip, setTip] = useState<TipPos | null>(null);
  const exterior = building.exteriorImageUrl?.trim() ?? "";
  const withBands = floors.filter((f) => (f.exteriorHotspot?.length ?? 0) >= 3);
  const hovered = withBands.find((f) => f.id === hoveredId) ?? null;

  function track(e: ReactMouseEvent) {
    const el = frameRef.current;
    if (!el) return;
    setTip(tipFromEvent(e, el));
  }

  if (!exterior) {
    return (
      <section id="sales-journey" className={MAPPED_SECTION}>
        <div className="space-y-5 px-4 sm:px-0 py-8">
          <p className="text-center text-sm text-[#6B7280]">{emptyLabel}</p>
          <div className="flex flex-wrap justify-center gap-2">
            {floors.map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => onSelectFloor(f)}
                className="rounded-[5px] bg-[#F3F4F6] px-3.5 py-2 text-sm font-semibold text-[#0c1428] transition-colors hover:bg-[#0c1428] hover:text-white"
              >
                {floorLabelTemplate.replace("{n}", f.label)}
              </button>
            ))}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="sales-journey" className={MAPPED_SECTION}>
      <div
        ref={frameRef}
        className={MAP_FRAME}
        onMouseLeave={() => {
          setHoveredId(null);
          setTip(null);
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          id="mappedImage"
          src={exterior}
          alt={building.name}
          className={MAP_IMG}
          draggable={false}
          decoding="async"
        />
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" fill="none" className={MAP_SVG}>
          {withBands.map((f) => {
            const pts = f.exteriorHotspot as [number, number][];
            const active = hoveredId === f.id;
            return (
              <g key={f.id}>
                <polygon
                  points={pointsToSvg(pts)}
                  className={cn(
                    "relative cursor-pointer fill-[#c9a96e]/5 transition duration-150 ease-in-out",
                    active && "fill-[#c9a96e]/40",
                  )}
                  onMouseEnter={() => setHoveredId(f.id)}
                  onMouseMove={track}
                  onMouseLeave={() => {
                    setHoveredId(null);
                    setTip(null);
                  }}
                  onClick={() => onSelectFloor(f)}
                />
              </g>
            );
          })}
        </svg>
        <PlanTextLabelsOverlay labels={building.textLabels ?? []} />
        {withBands.map((f) => {
          const pts = f.exteriorHotspot as [number, number][];
          const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          return (
            <MapPinMarker
              key={`pin-${f.id}`}
              x={x}
              y={y}
              label={f.label}
              className="hidden md:flex"
            />
          );
        })}
        {hovered && tip ? (
          <div className="popovers pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-full md:block">
            <HoverTip
              tip={tip}
              title={floorLabelTemplate.replace("{n}", hovered.label)}
              actionLabel={moreLabel}
              onAction={() => onSelectFloor(hovered)}
            />
          </div>
        ) : null}
      </div>
      {floors.length > 0 ? (
        <div className="border-t border-[#E5E7EB] bg-white px-4 py-3 lg:hidden">
          <p className="mb-2 text-xs font-medium text-[#6B7280]">{floorsLabel}</p>
          <div className="flex gap-2 overflow-x-auto pb-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {floors.map((f) => (
              <button
                key={`mobile-floor-${f.id}`}
                type="button"
                title={floorLabelTemplate.replace("{n}", f.label)}
                aria-label={floorLabelTemplate.replace("{n}", f.label)}
                onClick={() => onSelectFloor(f)}
                className={cn(
                  "flex h-8 min-w-8 shrink-0 items-center justify-center rounded-full border-2 px-2 text-xs font-semibold transition-colors",
                  hoveredId === f.id
                    ? "border-[#c9a96e] bg-[#0c1428] text-white"
                    : "border-transparent bg-[#F3F4F6] text-[#0c1428] hover:border-[#c9a96e]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      {floors.length > 0 ? (
        <div className="mb-4 hidden items-center justify-end z-20 lg:mr-10 lg:flex">
          <div className="flex max-w-full flex-wrap items-center text-sm text-[#0c1428]">
            <span className="flex h-12 items-center justify-center border border-[#c9a96e] bg-[#c9a96e] p-4 text-white">
              {floorsLabel}
            </span>
            {floors.map((f) => (
              <button
                key={`strip-${f.id}`}
                type="button"
                title={floorLabelTemplate.replace("{n}", f.label)}
                aria-label={floorLabelTemplate.replace("{n}", f.label)}
                onMouseEnter={() => setHoveredId(f.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectFloor(f)}
                className={cn(
                  "flex h-12 min-w-12 cursor-pointer items-center justify-center border border-white bg-[#F3F4F6] px-3 transition duration-100 ease-in hover:border-[#c9a96e]",
                  hoveredId === f.id && "border-[#c9a96e]",
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BuildingPicker({
  buildings,
  title,
  onSelect,
}: {
  buildings: Building[];
  title: string;
  onSelect: (b: Building) => void;
}) {
  return (
    <div className="px-4 sm:px-0 py-8">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-[#0c1428] sm:text-xl">{title}</h2>
      <div className="flex flex-wrap gap-2">
        {buildings.map((b) => (
          <button
            key={b.id}
            type="button"
            onClick={() => onSelect(b)}
            className="rounded-[5px] bg-[#F3F4F6] px-3.5 py-2 text-sm font-semibold text-[#0c1428] transition-colors hover:bg-[#0c1428] hover:text-white"
          >
            {b.name}
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Public apartment sales journey - three flows:
 * 1. plans - apartment plan list (+ floor map if plates exist)
 * 2. floors - single building exterior → floor → apartments
 * 3. buildings - site map → pick building → then floors flow
 *
 * Building / stage / floor selection is stored in the URL (`?stage=&building=&floor=`)
 * so refresh and browser back/forward restore the same step.
 */
function ApartmentSalesJourneyInner({ project }: Props) {
  const { t, lang } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mode = projectSalesMode(project);
  const d = t.developerDetail;
  const stages = project.mapStages ?? [];
  const stagesById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const buildingsById = useMemo(
    () => new Map((project.buildings ?? []).map((b) => [b.id, b])),
    [project.buildings],
  );
  const buildings = useMemo(() => sortedBuildings(project.buildings), [project.buildings]);

  const urlStageId = searchParams.get("stage");
  const urlBuildingId = searchParams.get("building");
  const urlFloorId = searchParams.get("floor");

  const setJourneyParams = useCallback(
    (next: JourneyParams) => {
      const params = new URLSearchParams(searchParams.toString());
      const apply = (key: keyof JourneyParams, value: string | null | undefined) => {
        if (value === undefined) return;
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      };
      apply("stage", next.stage);
      apply("building", next.building);
      apply("floor", next.floor);
      const qs = params.toString();
      router.push(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const stageStack = useMemo(() => {
    if (!usesMapStages(mode)) return [];
    if (urlStageId && stagesById.has(urlStageId)) {
      return stageAncestry(urlStageId, stagesById);
    }
    const entry = rootStage(stages);
    return entry ? [entry] : [];
  }, [mode, urlStageId, stagesById, stages]);

  const building = useMemo(() => {
    if (urlBuildingId) {
      const fromUrl = buildingsById.get(urlBuildingId);
      if (fromUrl) return fromUrl;
    }
    if (urlFloorId) {
      for (const b of buildings) {
        if ((b.floors ?? []).some((f) => f.id === urlFloorId)) return b;
      }
    }
    if (mode === "floors" && buildings.length === 1) return buildings[0];
    return null;
  }, [urlBuildingId, urlFloorId, buildingsById, buildings, mode]);

  const floor = useMemo(() => {
    if (!building || !urlFloorId) return null;
    return (building.floors ?? []).find((f) => f.id === urlFloorId) ?? null;
  }, [building, urlFloorId]);

  const currentStage = stageStack[stageStack.length - 1] ?? null;
  const root = useMemo(() => rootStage(stages), [stages]);

  const keepStage = useCallback((): string | null => {
    return currentStage && root && currentStage.id !== root.id ? currentStage.id : null;
  }, [currentStage, root]);

  const goToStage = useCallback(
    (stage: ProjectMapStage) => {
      setJourneyParams({
        stage: root && stage.id === root.id ? null : stage.id,
        building: null,
        floor: null,
      });
    },
    [setJourneyParams, root],
  );

  const goToBuilding = useCallback(() => {
    if (!building) return;
    setJourneyParams({
      stage: keepStage(),
      building: building.id,
      floor: null,
    });
  }, [building, keepStage, setJourneyParams]);

  const goBack = useCallback(() => {
    if (floor) {
      goToBuilding();
      return;
    }
    if (building) {
      setJourneyParams({ stage: keepStage(), building: null, floor: null });
      return;
    }
    if (stageStack.length > 1) {
      goToStage(stageStack[stageStack.length - 2]);
    }
  }, [floor, building, goToBuilding, keepStage, setJourneyParams, stageStack, goToStage]);

  const journeyNav = useMemo(() => {
    const items: SalesJourneyCrumb[] = [];

    if (usesMapStages(mode) && stageStack.length > 0) {
      stageStack.forEach((stage, i) => {
        const hasMoreAfterStage = Boolean(building) || i < stageStack.length - 1;
        items.push({
          label: stageLabel(stage, lang),
          onClick: hasMoreAfterStage ? () => goToStage(stage) : undefined,
        });
      });
    }

    if (building) {
      items.push({
        label: building.name,
        onClick: floor ? goToBuilding : undefined,
      });
    }

    if (floor) {
      items.push({
        label: d.salesJourneyFloor.replace("{n}", floor.label),
      });
    }

    const canGoBack = Boolean(
      floor ||
        (building && (mode === "buildings" || buildings.length > 1)) ||
        (stageStack.length > 1 && !building),
    );

    return { items, canGoBack };
  }, [mode, stageStack, building, floor, lang, d.salesJourneyFloor, goToStage, goToBuilding, buildings.length]);

  function wrapJourneyNav(content: ReactNode) {
    const showBar =
      journeyNav.canGoBack ||
      Boolean(building) ||
      (usesMapStages(mode) && stageStack.length > 1);
    if (!showBar) return content;
    return (
      <>
        <SalesJourneyBreadcrumb
          items={journeyNav.items}
          onBack={journeyNav.canGoBack ? goBack : undefined}
          backLabel={d.salesJourneyBack}
          ariaLabel={d.viewModeLabel}
        />
        {content}
      </>
    );
  }

  // --- Case 1: plans sales mode - visual floor map only (plan grid is on project page) ---
  if (mode === "plans") {
    return <BuildingFloorMapSection project={project} />;
  }

  function selectBuilding(b: Building) {
    const keepStage =
      currentStage && root && currentStage.id !== root.id ? currentStage.id : null;
    setJourneyParams({
      stage: keepStage,
      building: b.id,
      floor: null,
    });
  }

  function selectStage(s: ProjectMapStage) {
    setJourneyParams({
      stage: root && s.id === root.id ? null : s.id,
      building: null,
      floor: null,
    });
  }

  function selectFloor(f: BuildingFloor) {
    if (!building) return;
    const keepStage =
      currentStage && root && currentStage.id !== root.id ? currentStage.id : null;
    setJourneyParams({
      stage: keepStage,
      building: building.id,
      floor: f.id,
    });
  }

  // --- Floor plate (apartments) ---
  if (building && floor) {
    return wrapJourneyNav(
      <BuildingFloorMapSection
        project={{ ...project, buildings: [building] }}
        lockedFloorId={floor.id}
      />,
    );
  }

  // --- Building exterior (choose floor) ---
  if (building && !floor) {
    return wrapJourneyNav(
      <BuildingExteriorView
        building={building}
        floors={sortedFloors(building.floors)}
        onSelectFloor={selectFloor}
        moreLabel={d.salesJourneyMore}
        floorLabelTemplate={d.salesJourneyFloor}
        emptyLabel={d.salesJourneyEmptyExterior}
        floorsLabel={t.projectDetail.floors}
      />,
    );
  }

  // --- Case 2: floors - multi-building picker (rare) ---
  if (mode === "floors") {
    if (buildings.length === 0) {
      return <BuildingFloorMapSection project={project} />;
    }
    return (
      <section id="sales-journey">
        <BuildingPicker
          buildings={buildings}
          title={d.salesJourneySelectBuilding}
          onSelect={selectBuilding}
        />
      </section>
    );
  }

  // --- Case 3: buildings - site map ---
  if (currentStage?.imageUrl.trim()) {
    return wrapJourneyNav(
      <MapStageView
        stage={currentStage}
        stagesById={stagesById}
        buildingsById={buildingsById}
        lang={lang}
        onSelectStage={selectStage}
        onSelectBuilding={selectBuilding}
        moreLabel={d.salesJourneyMore}
        buildingsLabel={d.salesJourneyBuilding}
      />,
    );
  }

  // Map missing - building buttons
  if (buildings.length > 0) {
    return (
      <section id="sales-journey">
        <p className="px-4 sm:px-0 pt-6 text-sm text-[#6B7280]">{d.salesJourneyEmptyMap}</p>
        <BuildingPicker
          buildings={buildings}
          title={d.salesJourneySelectBuilding}
          onSelect={selectBuilding}
        />
      </section>
    );
  }

  return (
    <>
      <section id="apartments" className="border-t border-[#E5E7EB]">
        <Container className="py-10 md:py-14">
          <p className="mb-6 text-sm text-[#6B7280]">{d.salesJourneyEmptyMap}</p>
          <DeveloperFloorPlanSection project={project} />
        </Container>
      </section>
      <BuildingFloorMapSection project={project} />
    </>
  );
}

export function ApartmentSalesJourney({ project }: Props) {
  return (
    <Suspense fallback={<div className="min-h-[12rem] w-full" aria-hidden />}>
      <ApartmentSalesJourneyInner project={project} />
    </Suspense>
  );
}
