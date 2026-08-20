"use client";

import { useEffect, useMemo, useState } from "react";
import { DeveloperUnitCard } from "@/components/sales/DeveloperUnitCard";
import { Container } from "@/components/site/Container";
import { formatPrice } from "@/lib/format-price";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { LandPlot, Project } from "@/types";

interface Props {
  project: Project;
}

function pointsToSvg(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

function centroid(points: [number, number][]): [number, number] {
  const n = points.length || 1;
  const x = points.reduce((s, p) => s + p[0], 0) / n;
  const y = points.reduce((s, p) => s + p[1], 0) / n;
  return [x, y];
}

export function NeighborhoodSalesSection({ project }: Props) {
  const { t } = useI18n();
  const plots = useMemo(
    () =>
      [...(project.landPlots ?? [])]
        .filter((p) => p.label.trim() && p.points.length >= 3)
        .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true })),
    [project.landPlots],
  );
  const imageUrl = project.sitePlanImage?.trim() ?? "";
  const [selectedId, setSelectedId] = useState<string | null>(plots[0]?.id ?? null);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  useEffect(() => {
    if (!plots.length) {
      setSelectedId(null);
      return;
    }
    if (!selectedId || !plots.some((p) => p.id === selectedId)) {
      setSelectedId(plots[0]?.id ?? null);
    }
  }, [plots, selectedId]);

  const selected = plots.find((p) => p.id === selectedId);
  const plans = project.apartments.filter(
    (a) => a.landPlotId === selectedId && a.status !== "Reserved",
  );
  const tooltipPlot: LandPlot | undefined =
    plots.find((p) => p.id === hoveredId) ?? selected;

  if (!imageUrl && plots.length === 0 && project.apartments.every((a) => !a.landPlotId)) {
    return null;
  }

  return (
    <>
      <section id="neighborhood-map" className="scroll-mt-24 bg-[#0c1428]">
        <Container className="py-10 md:py-14">
          <h2 className="mb-3 text-2xl font-semibold leading-snug tracking-tight text-white sm:mb-4 sm:text-3xl">
            {t.developerDetail.siteMapTitle}
          </h2>
          <p className="mb-8 max-w-2xl text-sm text-white/55">{t.developerDetail.plotMapHint}</p>

          {!imageUrl ? (
            <p className="text-sm text-white/40">{t.developerDetail.plotMapEmpty}</p>
          ) : (
            <div className="relative overflow-hidden rounded-[8px] border border-white/10 bg-[#152038]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="block h-auto w-full select-none" />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                className="absolute inset-0 h-full w-full"
              >
                {plots.map((plot) => {
                  const active = plot.id === selectedId;
                  const hover = plot.id === hoveredId;
                  return (
                    <polygon
                      key={plot.id}
                      points={pointsToSvg(plot.points)}
                      className={cn(
                        "cursor-pointer stroke-[0.35] transition-opacity",
                        active || hover
                          ? "fill-[#c9a96e]/45 stroke-[#c9a96e]"
                          : "fill-[#c45c4a]/28 stroke-white/70",
                      )}
                      onMouseEnter={() => setHoveredId(plot.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setSelectedId(plot.id)}
                    />
                  );
                })}
              </svg>
              {tooltipPlot ? (
                <div
                  className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[110%] rounded-[5px] border border-white/15 bg-[#0c1428]/95 px-3 py-2 shadow-lg"
                  style={{
                    left: `${centroid(tooltipPlot.points)[0]}%`,
                    top: `${centroid(tooltipPlot.points)[1]}%`,
                  }}
                >
                  <p className="text-xs font-semibold text-white">{tooltipPlot.label}</p>
                  {tooltipPlot.area && tooltipPlot.area > 0 ? (
                    <p className="mt-0.5 text-[11px] text-white/70">
                      {t.developerDetail.plotArea}: {tooltipPlot.area} m²
                    </p>
                  ) : null}
                  {tooltipPlot.price && tooltipPlot.price > 0 ? (
                    <p className="mt-0.5 text-[11px] text-[#c9a96e]">
                      {formatPrice(tooltipPlot.price)}
                    </p>
                  ) : null}
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-white/45">
                    {getStatusLabel(t, tooltipPlot.status)}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {plots.length > 0 ? (
            <div className="mt-6 flex flex-wrap gap-2" role="tablist" aria-label={t.developerDetail.choosePlot}>
              {plots.map((plot) => {
                const active = plot.id === selectedId;
                return (
                  <button
                    key={plot.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedId(plot.id)}
                    className={cn(
                      "rounded-[5px] px-3.5 py-2 text-sm font-semibold transition-colors",
                      active
                        ? "bg-[#c9a96e] text-[#0c1428]"
                        : "bg-white/5 text-white/70 hover:bg-white/10 hover:text-white",
                    )}
                  >
                    {plot.label}
                  </button>
                );
              })}
            </div>
          ) : null}
        </Container>
      </section>

      <section id="apartments" className="border-t border-[#E5E7EB] bg-white">
        <Container className="py-10 md:py-14">
          <h2 className="text-xl font-bold text-[#1C1917] sm:text-2xl">
            {t.developerDetail.plotPlansTitle}
            {selected?.label ? ` · ${selected.label}` : ""}
          </h2>
          {plans.length === 0 ? (
            <p className="mt-6 text-sm text-[#6B7280]">{t.properties.noResults}</p>
          ) : (
            <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {plans.map((apartment) => (
                <DeveloperUnitCard
                  key={apartment.id}
                  apartment={apartment}
                  projectSlug={project.slug}
                  isHouse
                />
              ))}
            </div>
          )}
        </Container>
      </section>
    </>
  );
}
