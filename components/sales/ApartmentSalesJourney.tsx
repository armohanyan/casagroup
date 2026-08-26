"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type ReactNode,
} from "react";
import { Container } from "@/components/site/Container";
import { BuildingFloorMapSection } from "@/components/sales/BuildingFloorMapSection";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { useI18n, type Lang } from "@/lib/i18n";
import { getProjectTitle } from "@/lib/project-i18n";
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

type Crumb = { id: string; label: string };
type TipPos = { x: number; y: number };

const MAP_FRAME = "relative w-full max-w-none";
/** Full-bleed map/exterior art: width-driven, natural height, never cropped. */
const MAP_IMG =
  "pointer-events-none block h-auto w-full max-w-none select-none object-contain";

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

function JourneyBreadcrumbs({
  crumbs,
  onBack,
  backLabel,
  onImage = false,
}: {
  crumbs: Crumb[];
  onBack: () => void;
  backLabel: string;
  onImage?: boolean;
}) {
  if (crumbs.length <= 1) return null;
  return (
    <div className="mb-1.5 flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={onBack}
        className={cn(
          "font-semibold transition-colors",
          onImage ? "text-white/80 hover:text-white" : "text-[#6B7280] hover:text-[#0c1428]",
        )}
      >
        ← {backLabel}
      </button>
      <span className={onImage ? "text-white/35" : "text-[#D1D5DB]"}>|</span>
      {crumbs.map((c, i) => (
        <span key={c.id} className="inline-flex items-center gap-2">
          {i > 0 ? <span className={onImage ? "text-white/35" : "text-[#D1D5DB]"}>/</span> : null}
          <span
            className={
              i === crumbs.length - 1
                ? onImage
                  ? "font-semibold text-[#c9a96e]"
                  : "font-semibold text-[#0c1428]"
                : onImage
                  ? "text-white/70"
                  : "text-[#6B7280]"
            }
          >
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}

function JourneyOverlay({
  crumbs,
  title,
  onBack,
  backLabel,
}: {
  crumbs: Crumb[];
  title: string;
  onBack?: () => void;
  backLabel?: string;
}) {
  return (
    <div className="pointer-events-none absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-black/60 via-black/30 to-transparent pb-14 pt-4 sm:pb-16 sm:pt-5">
      <div className="pointer-events-auto px-4 sm:px-6 lg:px-8">
        {crumbs.length > 1 && onBack && backLabel ? (
          <JourneyBreadcrumbs crumbs={crumbs} onBack={onBack} backLabel={backLabel} onImage />
        ) : null}
        <h2 className="text-xl font-semibold tracking-tight text-white drop-shadow-sm sm:text-2xl">
          {title}
        </h2>
      </div>
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
  overlay,
}: {
  stage: ProjectMapStage;
  stagesById: Map<string, ProjectMapStage>;
  buildingsById: Map<string, Building>;
  lang: Lang;
  onSelectStage: (stage: ProjectMapStage) => void;
  onSelectBuilding: (building: Building) => void;
  moreLabel: string;
  overlay?: ReactNode;
}) {
  const frameRef = useRef<HTMLDivElement>(null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [tip, setTip] = useState<TipPos | null>(null);
  const hovered = stage.hotspots.find((h) => h.id === hoveredId) ?? null;

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
    <div
      ref={frameRef}
      className={cn(MAP_FRAME)}
      onMouseLeave={() => {
        setHoveredId(null);
        setTip(null);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={stage.imageUrl}
        alt={stage.label}
        className={MAP_IMG}
        draggable={false}
        decoding="async"
      />
      {overlay}
      <svg
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        className="absolute inset-0 z-[5] h-full w-full"
      >
        {stage.hotspots.map((h) =>
          h.points.length >= 3 ? (
            <polygon
              key={h.id}
              points={pointsToSvg(h.points)}
              className={cn(
                "cursor-pointer transition-opacity duration-200",
                hoveredId === h.id
                  ? "fill-[#c9a96e]/50 stroke-[#c9a96e]"
                  : "fill-transparent stroke-transparent hover:fill-[#c9a96e]/30",
              )}
              strokeWidth={0.3}
              onMouseEnter={() => setHoveredId(h.id)}
              onMouseMove={track}
              onMouseLeave={() => {
                setHoveredId(null);
                setTip(null);
              }}
              onClick={() => activate(h)}
            />
          ) : null,
        )}
      </svg>
      {stage.hotspots.map((h) => {
        const m = markerPos(h);
        const pinLabel = hotspotDisplayLabel(h, buildingsById, stagesById, lang);
        return (
          <button
            key={`m-${h.id}`}
            type="button"
            className={cn(
              "absolute z-10 flex h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0c1428] px-2.5 text-[11px] font-bold text-white shadow-md transition-transform duration-200",
              hoveredId === h.id ? "scale-110 bg-[#c9a96e] text-[#0c1428]" : "hover:scale-105",
            )}
            style={{ left: `${m.x}%`, top: `${m.y}%` }}
            onMouseEnter={() => setHoveredId(h.id)}
            onMouseMove={track}
            onMouseLeave={() => {
              setHoveredId(null);
              setTip(null);
            }}
            onClick={() => activate(h)}
          >
            {pinLabel}
          </button>
        );
      })}
      {hovered && tip ? (
        <HoverTip
          tip={tip}
          title={tipTitle || hotspotDisplayLabel(hovered, buildingsById, stagesById, lang)}
          actionLabel={moreLabel}
          onAction={() => activate(hovered)}
        />
      ) : null}
    </div>
  );
}

function BuildingExteriorView({
  building,
  floors,
  onSelectFloor,
  moreLabel,
  floorLabelTemplate,
  emptyLabel,
  overlay,
}: {
  building: Building;
  floors: BuildingFloor[];
  onSelectFloor: (floor: BuildingFloor) => void;
  moreLabel: string;
  floorLabelTemplate: string;
  emptyLabel: string;
  overlay?: ReactNode;
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
      <div className="space-y-5 px-4 py-8 sm:px-6 lg:px-8">
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
    );
  }

  return (
    <div className="w-full max-w-none">
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
          src={exterior}
          alt={building.name}
          className={MAP_IMG}
          draggable={false}
          decoding="async"
        />
        {overlay}
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 z-[5] h-full w-full"
        >
          {withBands.map((f) => (
            <polygon
              key={f.id}
              points={pointsToSvg(f.exteriorHotspot as [number, number][])}
              className={cn(
                "cursor-pointer transition-opacity duration-200",
                hoveredId === f.id
                  ? "fill-[#c9a96e]/50 stroke-[#c9a96e]"
                  : "fill-transparent hover:fill-[#c9a96e]/30",
              )}
              strokeWidth={0.25}
              onMouseEnter={() => setHoveredId(f.id)}
              onMouseMove={track}
              onMouseLeave={() => {
                setHoveredId(null);
                setTip(null);
              }}
              onClick={() => onSelectFloor(f)}
            />
          ))}
        </svg>
        {floors.map((f) => {
          const pts = f.exteriorHotspot;
          if (!pts || pts.length < 3) return null;
          const x = pts.reduce((s, p) => s + p[0], 0) / pts.length;
          const y = pts.reduce((s, p) => s + p[1], 0) / pts.length;
          return (
            <button
              key={`lbl-${f.id}`}
              type="button"
              className={cn(
                "absolute z-10 flex h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#0c1428] px-2.5 text-[11px] font-bold text-white shadow-md transition-transform duration-200",
                hoveredId === f.id ? "scale-110 bg-[#c9a96e] text-[#0c1428]" : "hover:scale-105",
              )}
              style={{ left: `${x}%`, top: `${y}%` }}
              onMouseEnter={() => setHoveredId(f.id)}
              onMouseMove={track}
              onMouseLeave={() => {
                setHoveredId(null);
                setTip(null);
              }}
              onClick={() => onSelectFloor(f)}
            >
              {f.label}
            </button>
          );
        })}
        {hovered && tip ? (
          <HoverTip
            tip={tip}
            title={floorLabelTemplate.replace("{n}", hovered.label)}
            actionLabel={moreLabel}
            onAction={() => onSelectFloor(hovered)}
          />
        ) : null}
      </div>
      <div className="flex flex-wrap justify-center gap-2 px-4 py-4 sm:px-6 lg:px-8">
        {floors.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFloor(f)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-full px-2.5 text-sm font-semibold transition-colors",
              hoveredId === f.id
                ? "bg-[#0c1428] text-white"
                : "bg-[#F3F4F6] text-[#0c1428] hover:bg-[#E5E7EB]",
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
    </div>
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
    <div className="px-4 py-8 sm:px-6 lg:px-8">
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
 * Public apartment sales journey — three flows:
 * 1. plans — apartment plan list (+ floor map if plates exist)
 * 2. floors — single building exterior → floor → apartments
 * 3. buildings — site map → pick building → then floors flow
 */
export function ApartmentSalesJourney({ project }: Props) {
  const { t, lang } = useI18n();
  const mode = projectSalesMode(project);
  const d = t.developerDetail;
  const stages = project.mapStages ?? [];
  const stagesById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const buildingsById = useMemo(
    () => new Map((project.buildings ?? []).map((b) => [b.id, b])),
    [project.buildings],
  );
  const buildings = useMemo(() => sortedBuildings(project.buildings), [project.buildings]);

  const [stageStack, setStageStack] = useState<ProjectMapStage[]>(() => {
    if (!usesMapStages(mode)) return [];
    const entry = rootStage(stages);
    return entry ? [entry] : [];
  });
  const [building, setBuilding] = useState<Building | null>(null);
  const [floor, setFloor] = useState<BuildingFloor | null>(null);

  // Case 2: auto-select the only building
  useEffect(() => {
    if (mode !== "floors" || building || buildings.length !== 1) return;
    setBuilding(buildings[0]);
  }, [mode, buildings, building]);

  const projectTitle = getProjectTitle(project, lang);
  const currentStage = stageStack[stageStack.length - 1] ?? null;

  const crumbs: Crumb[] = useMemo(() => {
    const list: Crumb[] = [{ id: "project", label: projectTitle }];
    for (const s of stageStack) {
      list.push({ id: s.id, label: stageLabel(s, lang) });
    }
    if (building) list.push({ id: building.id, label: building.name });
    if (floor) {
      list.push({
        id: floor.id,
        label: d.salesJourneyFloor.replace("{n}", floor.label),
      });
    }
    return list;
  }, [projectTitle, stageStack, building, floor, lang, d.salesJourneyFloor]);

  // ——— Case 1: plans only ———
  if (mode === "plans") {
    return (
      <>
        <section id="apartments" className="border-t border-[#E5E7EB]">
          <Container className="py-10 md:py-14">
            <DeveloperFloorPlanSection project={project} />
          </Container>
        </section>
        <BuildingFloorMapSection project={project} />
      </>
    );
  }

  function goBack() {
    if (floor) {
      setFloor(null);
      return;
    }
    if (building) {
      if (mode === "floors" && buildings.length <= 1) return;
      setBuilding(null);
      return;
    }
    if (stageStack.length > 1) {
      setStageStack((s) => s.slice(0, -1));
    }
  }

  function selectBuilding(b: Building) {
    setBuilding(b);
    setFloor(null);
  }

  const canGoBack =
    Boolean(floor) ||
    (Boolean(building) && !(mode === "floors" && buildings.length <= 1)) ||
    stageStack.length > 1;

  // ——— Floor plate (apartments) ———
  if (building && floor) {
    return (
      <section id="sales-journey" className="w-full max-w-none">
        <BuildingFloorMapSection
          project={{ ...project, buildings: [building] }}
          lockedFloorId={floor.id}
          overlay={
            <JourneyOverlay
              crumbs={crumbs}
              title={d.salesJourneySelectApartment}
              onBack={canGoBack ? goBack : undefined}
              backLabel={d.salesJourneyBack}
            />
          }
        />
      </section>
    );
  }

  // ——— Building exterior (choose floor) ———
  if (building && !floor) {
    return (
      <section id="sales-journey" className="w-full max-w-none">
        <BuildingExteriorView
          building={building}
          floors={sortedFloors(building.floors)}
          onSelectFloor={setFloor}
          moreLabel={d.salesJourneyMore}
          floorLabelTemplate={d.salesJourneyFloor}
          emptyLabel={d.salesJourneyEmptyExterior}
          overlay={
            <JourneyOverlay
              crumbs={crumbs}
              title={d.salesJourneySelectFloor}
              onBack={canGoBack ? goBack : undefined}
              backLabel={d.salesJourneyBack}
            />
          }
        />
      </section>
    );
  }

  // ——— Case 2: floors — multi-building picker (rare) ———
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

  // ——— Case 3: buildings — site map ———
  if (currentStage?.imageUrl.trim()) {
    return (
      <section id="sales-journey" className="w-full max-w-none">
        <MapStageView
          stage={currentStage}
          stagesById={stagesById}
          buildingsById={buildingsById}
          lang={lang}
          onSelectStage={(s) => {
            setStageStack((prev) => [...prev, s]);
            setBuilding(null);
            setFloor(null);
          }}
          onSelectBuilding={selectBuilding}
          moreLabel={d.salesJourneyMore}
          overlay={
            <JourneyOverlay
              crumbs={crumbs}
              title={d.salesJourneySelectBuilding}
              onBack={canGoBack ? goBack : undefined}
              backLabel={d.salesJourneyBack}
            />
          }
        />
      </section>
    );
  }

  // Map missing — building buttons
  if (buildings.length > 0) {
    return (
      <section id="sales-journey">
        <p className="px-4 pt-6 text-sm text-[#6B7280] sm:px-6 lg:px-8">{d.salesJourneyEmptyMap}</p>
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
