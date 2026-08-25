"use client";

import { useMemo, useState } from "react";
import { Container } from "@/components/site/Container";
import { BuildingFloorMapSection } from "@/components/sales/BuildingFloorMapSection";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { useI18n, type Lang } from "@/lib/i18n";
import { getProjectTitle } from "@/lib/project-i18n";
import { projectSalesMode, usesBuildingExterior, usesMapStages } from "@/lib/sales-mode";
import { cn } from "@/lib/utils";
import type {
  Building,
  BuildingFloor,
  MapStageHotspot,
  Project,
  ProjectMapStage,
  SalesMode,
} from "@/types";

interface Props {
  project: Project;
}

type Crumb = { id: string; label: string };

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

function JourneyHeader({
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
    <div className="px-4 py-6 sm:px-6 md:py-8 lg:px-8">
      {crumbs.length > 1 && onBack && backLabel ? (
        <JourneyBreadcrumbs crumbs={crumbs} onBack={onBack} backLabel={backLabel} />
      ) : null}
      <h2 className="text-2xl font-semibold tracking-tight text-[#0c1428] sm:text-3xl">{title}</h2>
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
}: {
  stage: ProjectMapStage;
  stagesById: Map<string, ProjectMapStage>;
  buildingsById: Map<string, Building>;
  lang: Lang;
  onSelectStage: (stage: ProjectMapStage) => void;
  onSelectBuilding: (building: Building) => void;
  moreLabel: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const hovered = stage.hotspots.find((h) => h.id === hoveredId) ?? null;
  const tip = hovered ? markerPos(hovered) : null;
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

  if (!stage.imageUrl.trim()) {
    return null;
  }

  return (
    <div className="flex w-full justify-center overflow-hidden">
      {/* Shrink-wrap to the scaled image so % hotspots stay aligned (no letterboxing). */}
      <div className="relative inline-block max-h-[min(65vh,640px)] max-w-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={stage.imageUrl}
          alt={stage.label}
          className="pointer-events-none block h-auto max-h-[min(65vh,640px)] w-auto max-w-full select-none"
          draggable={false}
        />
        <svg
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full"
        >
          {stage.hotspots.map((h) =>
            h.points.length >= 3 ? (
              <polygon
                key={h.id}
                points={pointsToSvg(h.points)}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredId === h.id
                    ? "fill-[#e85d04]/50 stroke-[#e85d04]"
                    : "fill-transparent stroke-transparent hover:fill-[#e85d04]/30",
                )}
                strokeWidth={0.3}
                onMouseEnter={() => setHoveredId(h.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => activate(h)}
              />
            ) : null,
          )}
        </svg>
        {stage.hotspots.map((h) => {
          const m = markerPos(h);
          return (
            <button
              key={`m-${h.id}`}
              type="button"
              className={cn(
                "absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e85d04] text-[11px] font-bold text-white shadow-md transition-transform duration-200",
                hoveredId === h.id ? "scale-110" : "hover:scale-105",
              )}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              onMouseEnter={() => setHoveredId(h.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => activate(h)}
            >
              {h.label || "·"}
            </button>
          );
        })}
        {hovered && tip ? (
          <div
            className="pointer-events-auto absolute z-20 min-w-[9.5rem] -translate-x-1/2 -translate-y-[110%] rounded-[5px] bg-white px-3.5 py-2.5 shadow-xl"
            style={{ left: `${tip.x}%`, top: `${tip.y}%` }}
          >
            <p className="mb-2 text-sm font-semibold text-[#0c1428]">{tipTitle || hovered.label}</p>
            <button
              type="button"
              className="w-full rounded-[5px] bg-[#e85d04] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#d45303]"
              onClick={() => activate(hovered)}
            >
              {moreLabel}
            </button>
          </div>
        ) : null}
      </div>
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
}: {
  building: Building;
  floors: BuildingFloor[];
  onSelectFloor: (floor: BuildingFloor) => void;
  moreLabel: string;
  floorLabelTemplate: string;
  emptyLabel: string;
}) {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const exterior = building.exteriorImageUrl?.trim() ?? "";
  const withBands = floors.filter((f) => (f.exteriorHotspot?.length ?? 0) >= 3);
  const hovered = withBands.find((f) => f.id === hoveredId) ?? null;

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
              className="rounded-[5px] bg-[#F3F4F6] px-3.5 py-2 text-sm font-semibold text-[#0c1428] transition-colors hover:bg-[#e85d04] hover:text-white"
            >
              {floorLabelTemplate.replace("{n}", f.label)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {/* Same overlay model as admin PlanHotspotCanvas: image sizes the box, SVG matches it. */}
      <div className="flex w-full justify-center overflow-hidden">
        <div className="relative inline-block max-h-[min(65vh,640px)] max-w-full">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={exterior}
            alt={building.name}
            className="pointer-events-none block h-auto max-h-[min(65vh,640px)] w-auto max-w-full select-none"
            draggable={false}
          />
          <svg
            viewBox="0 0 100 100"
            preserveAspectRatio="none"
            className="absolute inset-0 h-full w-full"
          >
            {withBands.map((f) => (
              <polygon
                key={f.id}
                points={pointsToSvg(f.exteriorHotspot as [number, number][])}
                className={cn(
                  "cursor-pointer transition-opacity duration-200",
                  hoveredId === f.id
                    ? "fill-[#e85d04]/50 stroke-[#e85d04]"
                    : "fill-transparent hover:fill-[#e85d04]/30",
                )}
                strokeWidth={0.25}
                onMouseEnter={() => setHoveredId(f.id)}
                onMouseLeave={() => setHoveredId(null)}
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
                  "absolute z-10 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e85d04] text-[11px] font-bold text-white shadow-md transition-transform duration-200",
                  hoveredId === f.id ? "scale-110" : "hover:scale-105",
                )}
                style={{ left: `${x}%`, top: `${y}%` }}
                onMouseEnter={() => setHoveredId(f.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectFloor(f)}
              >
                {f.label}
              </button>
            );
          })}
          {hovered ? (
            <div className="absolute left-1/2 top-6 z-20 w-44 -translate-x-1/2 rounded-[5px] bg-white px-3.5 py-2.5 shadow-xl">
              <p className="mb-2 text-sm font-semibold text-[#0c1428]">
                {floorLabelTemplate.replace("{n}", hovered.label)}
              </p>
              <button
                type="button"
                className="w-full rounded-[5px] bg-[#e85d04] px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-[#d45303]"
                onClick={() => onSelectFloor(hovered)}
              >
                {moreLabel}
              </button>
            </div>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap justify-center gap-2 px-4 py-5 sm:px-6 lg:px-8">
        {floors.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFloor(f)}
            className={cn(
              "flex h-10 min-w-10 items-center justify-center rounded-full px-2.5 text-sm font-semibold transition-colors",
              hoveredId === f.id
                ? "bg-[#e85d04] text-white"
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

function entryStageForMode(
  mode: SalesMode,
  stages: ProjectMapStage[],
): ProjectMapStage | null {
  const roots = stages.filter((s) => !s.parentId).sort((a, b) => a.sortOrder - b.sortOrder);
  if (!roots.length) return null;
  if (mode === "master" || mode === "complex" || mode === "buildings") return roots[0];
  return null;
}

export function ApartmentSalesJourney({ project }: Props) {
  const { t, lang } = useI18n();
  const mode = projectSalesMode(project);
  const stages = project.mapStages ?? [];
  const stagesById = useMemo(() => new Map(stages.map((s) => [s.id, s])), [stages]);
  const buildingsById = useMemo(
    () => new Map((project.buildings ?? []).map((b) => [b.id, b])),
    [project.buildings],
  );

  const [stageStack, setStageStack] = useState<ProjectMapStage[]>(() => {
    const entry = entryStageForMode(mode, stages);
    return entry ? [entry] : [];
  });
  const [building, setBuilding] = useState<Building | null>(null);
  const [floor, setFloor] = useState<BuildingFloor | null>(null);

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
        label: t.developerDetail.salesJourneyFloor.replace("{n}", floor.label),
      });
    }
    return list;
  }, [projectTitle, stageStack, building, floor, lang, t.developerDetail.salesJourneyFloor]);

  // plans-only: classic list + optional floor map
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

  const showMap = usesMapStages(mode) && !building && currentStage?.imageUrl.trim();
  const showExterior = Boolean(building) && !floor && usesBuildingExterior(mode);
  const showFloorPlate = Boolean(building && floor);

  // floors mode with no exterior: jump into BuildingFloorMapSection
  if (mode === "floors" && !building) {
    const withExterior = (project.buildings ?? []).filter((b) => b.exteriorImageUrl?.trim());
    if (withExterior.length === 0) {
      return <BuildingFloorMapSection project={project} />;
    }
  }

  function goBack() {
    if (floor) {
      setFloor(null);
      return;
    }
    if (building) {
      setBuilding(null);
      if (!usesMapStages(mode)) return;
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

  function selectFloor(f: BuildingFloor) {
    setFloor(f);
  }

  // floors mode starting at exterior: pick first / allow building tabs
  const exteriorBuildings = useMemo(() => {
    return [...(project.buildings ?? [])]
      .filter((b) => b.name.trim())
      .sort((a, b) => a.sortOrder - b.sortOrder);
  }, [project.buildings]);

  if (mode === "floors" && !building && exteriorBuildings.some((b) => b.exteriorImageUrl?.trim())) {
    return (
      <section id="sales-journey">
        <JourneyHeader title={t.developerDetail.salesJourneyTitle} crumbs={crumbs} />
        {exteriorBuildings.length > 1 ? (
          <div className="flex flex-wrap gap-2 px-4 pb-6 sm:px-6 lg:px-8">
            {exteriorBuildings.map((b) => (
              <button
                key={b.id}
                type="button"
                onClick={() => selectBuilding(b)}
                className="rounded-[5px] bg-[#F3F4F6] px-3.5 py-2 text-sm font-semibold text-[#0c1428] transition-colors hover:bg-[#e85d04] hover:text-white"
              >
                {b.name}
              </button>
            ))}
          </div>
        ) : (
          <BuildingExteriorView
            building={exteriorBuildings[0]}
            floors={[...(exteriorBuildings[0].floors ?? [])].sort(
              (a, b) =>
                a.sortOrder - b.sortOrder ||
                a.label.localeCompare(b.label, undefined, { numeric: true }),
            )}
            onSelectFloor={(f) => {
              selectBuilding(exteriorBuildings[0]);
              selectFloor(f);
            }}
            moreLabel={t.developerDetail.salesJourneyMore}
            floorLabelTemplate={t.developerDetail.salesJourneyFloor}
            emptyLabel={t.developerDetail.salesJourneyEmptyExterior}
          />
        )}
      </section>
    );
  }

  // After floor picked in floors-only quick path — show plate via filtered section
  if (mode === "floors" && building && floor) {
    return (
      <section id="sales-journey">
        <JourneyHeader
          crumbs={crumbs}
          title={building.name}
          onBack={goBack}
          backLabel={t.developerDetail.salesJourneyBack}
        />
        <BuildingFloorMapSection
          project={{
            ...project,
            buildings: [
              {
                ...building,
                floors: building.floors.filter((f) => f.id === floor.id || f.imageUrl.trim()),
              },
            ],
          }}
        />
      </section>
    );
  }

  if (mode === "floors" && building && !floor) {
    const floors = [...(building.floors ?? [])].sort(
      (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
    );
    return (
      <section id="sales-journey">
        <JourneyHeader
          crumbs={crumbs}
          title={building.name}
          onBack={goBack}
          backLabel={t.developerDetail.salesJourneyBack}
        />
        <BuildingExteriorView
          building={building}
          floors={floors}
          onSelectFloor={selectFloor}
          moreLabel={t.developerDetail.salesJourneyMore}
          floorLabelTemplate={t.developerDetail.salesJourneyFloor}
          emptyLabel={t.developerDetail.salesJourneyEmptyExterior}
        />
      </section>
    );
  }

  // master / complex / buildings journey
  if (!usesMapStages(mode)) {
    return <BuildingFloorMapSection project={project} />;
  }

  if (!currentStage && !building) {
    return (
      <>
        <section id="apartments" className="border-t border-[#E5E7EB]">
          <Container className="py-10 md:py-14">
            <p className="mb-6 text-sm text-[#6B7280]">{t.developerDetail.salesJourneyEmptyMap}</p>
            <DeveloperFloorPlanSection project={project} />
          </Container>
        </section>
        <BuildingFloorMapSection project={project} />
      </>
    );
  }

  if (showFloorPlate && building && floor) {
    return (
      <section id="sales-journey">
        <JourneyHeader
          crumbs={crumbs}
          title={building.name}
          onBack={goBack}
          backLabel={t.developerDetail.salesJourneyBack}
        />
        <BuildingFloorMapSection
          project={{
            ...project,
            buildings: [building],
          }}
        />
      </section>
    );
  }

  const heading = building
    ? building.name
    : currentStage
      ? stageLabel(currentStage, lang)
      : t.developerDetail.salesJourneyTitle;

  return (
    <section id="sales-journey">
      <JourneyHeader
        crumbs={crumbs}
        title={heading}
        onBack={crumbs.length > 1 ? goBack : undefined}
        backLabel={t.developerDetail.salesJourneyBack}
      />

      {showMap && currentStage ? (
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
          moreLabel={t.developerDetail.salesJourneyMore}
        />
      ) : null}

      {showExterior && building ? (
        <BuildingExteriorView
          building={building}
          floors={[...(building.floors ?? [])].sort(
            (a, b) =>
              a.sortOrder - b.sortOrder ||
              a.label.localeCompare(b.label, undefined, { numeric: true }),
          )}
          onSelectFloor={selectFloor}
          moreLabel={t.developerDetail.salesJourneyMore}
          floorLabelTemplate={t.developerDetail.salesJourneyFloor}
          emptyLabel={t.developerDetail.salesJourneyEmptyExterior}
        />
      ) : null}
    </section>
  );
}

function JourneyBreadcrumbs({
  crumbs,
  onBack,
  backLabel,
}: {
  crumbs: Crumb[];
  onBack: () => void;
  backLabel: string;
}) {
  if (crumbs.length <= 1) return null;
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2 text-xs">
      <button
        type="button"
        onClick={onBack}
        className="font-semibold text-[#6B7280] transition-colors hover:text-[#0c1428]"
      >
        ← {backLabel}
      </button>
      <span className="text-[#D1D5DB]">|</span>
      {crumbs.map((c, i) => (
        <span key={c.id} className="inline-flex items-center gap-2">
          {i > 0 ? <span className="text-[#D1D5DB]">/</span> : null}
          <span className={i === crumbs.length - 1 ? "font-semibold text-[#e85d04]" : "text-[#6B7280]"}>
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}
