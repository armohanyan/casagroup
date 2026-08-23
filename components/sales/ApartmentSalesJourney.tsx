"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
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
    <div className="relative mx-auto w-full max-w-5xl overflow-hidden rounded-[5px] bg-[#0c1428]">
      <div className="relative aspect-[16/10] w-full">
        <Image src={stage.imageUrl} alt={stage.label} fill className="object-contain" sizes="100vw" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {stage.hotspots.map((h) =>
            h.points.length >= 3 ? (
              <polygon
                key={h.id}
                points={pointsToSvg(h.points)}
                className={cn(
                  "cursor-pointer transition-opacity",
                  hoveredId === h.id ? "fill-[#e85d04]/55 stroke-[#e85d04]" : "fill-transparent stroke-transparent hover:fill-[#e85d04]/35",
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
              className="absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e85d04] text-[11px] font-bold text-white shadow"
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
            className="pointer-events-auto absolute z-20 -translate-x-1/2 -translate-y-[110%] rounded-[5px] bg-white px-3 py-2 shadow-lg"
            style={{ left: `${tip.x}%`, top: `${tip.y}%` }}
          >
            <p className="mb-2 text-sm font-semibold text-[#0c1428]">{tipTitle || hovered.label}</p>
            <button
              type="button"
              className="w-full rounded-[5px] bg-[#e85d04] px-3 py-1.5 text-xs font-semibold text-white"
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
      <div className="space-y-4">
        <p className="text-center text-sm text-white/50">{emptyLabel}</p>
        <div className="flex flex-wrap justify-center gap-2">
          {floors.map((f) => (
            <button
              key={f.id}
              type="button"
              onClick={() => onSelectFloor(f)}
              className="rounded-[5px] bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-[#e85d04]"
            >
              {floorLabelTemplate.replace("{n}", f.label)}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative mx-auto w-full max-w-3xl">
      <div className="relative aspect-[3/4] w-full overflow-hidden rounded-[5px] bg-white">
        <Image src={exterior} alt={building.name} fill className="object-contain" sizes="(max-width:768px) 100vw, 640px" />
        <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" preserveAspectRatio="none">
          {withBands.map((f) => (
            <polygon
              key={f.id}
              points={pointsToSvg(f.exteriorHotspot as [number, number][])}
              className={cn(
                "cursor-pointer transition-opacity",
                hoveredId === f.id ? "fill-[#e85d04]/55 stroke-[#e85d04]" : "fill-transparent hover:fill-[#e85d04]/35",
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
              className="absolute z-10 flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#e85d04] text-[11px] font-bold text-white"
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
          <div className="absolute left-1/2 top-6 z-20 w-44 -translate-x-1/2 rounded-[5px] bg-white px-3 py-2 shadow-lg">
            <p className="mb-2 text-sm font-semibold text-[#0c1428]">
              {floorLabelTemplate.replace("{n}", hovered.label)}
            </p>
            <button
              type="button"
              className="w-full rounded-[5px] bg-[#e85d04] px-3 py-1.5 text-xs font-semibold text-white"
              onClick={() => onSelectFloor(hovered)}
            >
              {moreLabel}
            </button>
          </div>
        ) : null}
      </div>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        {floors.map((f) => (
          <button
            key={f.id}
            type="button"
            onClick={() => onSelectFloor(f)}
            className={cn(
              "flex h-9 min-w-9 items-center justify-center rounded-[5px] px-2 text-sm font-semibold",
              hoveredId === f.id ? "bg-[#e85d04] text-white" : "bg-white/10 text-white hover:bg-white/20",
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
      <section id="sales-journey" className="scroll-mt-24 border-t border-[#E5E7EB] bg-[#0c1428]">
        <Container className="py-10 md:py-14">
          <h2 className="mb-6 text-2xl font-semibold text-white sm:text-3xl">
            {t.developerDetail.salesJourneyTitle}
          </h2>
          {exteriorBuildings.length > 1 ? (
            <div className="mb-6 flex flex-wrap gap-2">
              {exteriorBuildings.map((b) => (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => selectBuilding(b)}
                  className="rounded-[5px] bg-white/10 px-3 py-2 text-sm font-semibold text-white hover:bg-[#e85d04]"
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
        </Container>
      </section>
    );
  }

  // After floor picked in floors-only quick path — show plate via filtered section
  if (mode === "floors" && building && floor) {
    return (
      <section id="sales-journey" className="scroll-mt-24 bg-[#0c1428]">
        <Container className="py-6">
          <JourneyBreadcrumbs crumbs={crumbs} onBack={goBack} backLabel={t.developerDetail.salesJourneyBack} />
        </Container>
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
      <section id="sales-journey" className="scroll-mt-24 border-t border-[#E5E7EB] bg-[#0c1428]">
        <Container className="py-10 md:py-14">
          <JourneyBreadcrumbs crumbs={crumbs} onBack={goBack} backLabel={t.developerDetail.salesJourneyBack} />
          <h2 className="mb-6 text-2xl font-semibold text-white">{building.name}</h2>
          <BuildingExteriorView
            building={building}
            floors={floors}
            onSelectFloor={selectFloor}
            moreLabel={t.developerDetail.salesJourneyMore}
            floorLabelTemplate={t.developerDetail.salesJourneyFloor}
            emptyLabel={t.developerDetail.salesJourneyEmptyExterior}
          />
        </Container>
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
      <section id="sales-journey" className="scroll-mt-24 bg-[#0c1428]">
        <Container className="py-6">
          <JourneyBreadcrumbs crumbs={crumbs} onBack={goBack} backLabel={t.developerDetail.salesJourneyBack} />
        </Container>
        <BuildingFloorMapSection
          project={{
            ...project,
            buildings: [building],
          }}
        />
      </section>
    );
  }

  return (
    <section id="sales-journey" className="scroll-mt-24 border-t border-[#E5E7EB] bg-[#0c1428]">
      <Container className="py-10 md:py-14">
        <JourneyBreadcrumbs crumbs={crumbs} onBack={goBack} backLabel={t.developerDetail.salesJourneyBack} />
        <h2 className="mb-6 text-2xl font-semibold text-white sm:text-3xl">
          {building
            ? building.name
            : currentStage
              ? stageLabel(currentStage, lang)
              : t.developerDetail.salesJourneyTitle}
        </h2>

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
      </Container>
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
    <div className="mb-4 flex flex-wrap items-center gap-2 text-xs text-[#e85d04]">
      <button type="button" onClick={onBack} className="font-semibold text-white/70 hover:text-white">
        ← {backLabel}
      </button>
      <span className="text-white/30">|</span>
      {crumbs.map((c, i) => (
        <span key={c.id} className="inline-flex items-center gap-2">
          {i > 0 ? <span className="text-white/30">/</span> : null}
          <span className={i === crumbs.length - 1 ? "font-semibold text-[#e85d04]" : "text-white/60"}>
            {c.label}
          </span>
        </span>
      ))}
    </div>
  );
}
