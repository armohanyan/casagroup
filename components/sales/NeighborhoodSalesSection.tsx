"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { X, BedDouble, Maximize2, Layers } from "lucide-react";
import { Container } from "@/components/site/Container";
import { apartmentDisplayNumber, hasApartmentNumber } from "@/lib/apartment-number";
import { formatPrice } from "@/lib/format-price";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Apartment, LandPlot, Project } from "@/types";

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
        .sort(
          (a, b) =>
            a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
        ),
    [project.landPlots],
  );
  const imageUrl = project.sitePlanImage?.trim() ?? "";
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const [modalPlotId, setModalPlotId] = useState<string | null>(null);

  const hovered = plots.find((p) => p.id === hoveredId);
  const modalPlot = plots.find((p) => p.id === modalPlotId);
  const modalPlans = useMemo(() => {
    if (!modalPlotId) return [];
    return project.apartments.filter(
      (a) => a.landPlotId === modalPlotId && a.status !== "Reserved",
    );
  }, [project.apartments, modalPlotId]);

  useEffect(() => {
    if (!modalPlotId) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalPlotId(null);
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [modalPlotId]);

  if (!imageUrl && plots.length === 0 && project.apartments.every((a) => !a.landPlotId)) {
    return null;
  }

  return (
    <>
      <section id="neighborhood-map" className="mapped-section relative hidden w-full bg-white md:block">
        {!imageUrl ? (
          <Container className="py-10 md:py-14">
            <h2 className="mb-3 text-2xl font-semibold leading-snug tracking-tight text-[#0c1428] sm:mb-4 sm:text-3xl">
              {t.developerDetail.siteMapTitle}
            </h2>
            <p className="mb-8 max-w-2xl text-sm text-[#6B7280]">{t.developerDetail.plotMapHint}</p>
            <p className="text-sm text-[#9CA3AF]">{t.developerDetail.plotMapEmpty}</p>
          </Container>
        ) : (
          <>
            <div className="map relative mb-1 h-full w-full">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                id="mappedImage"
                src={imageUrl}
                alt={t.developerDetail.siteMapTitle}
                className="w-full md:min-h-[80vh] h-auto max-h-screen"
                decoding="async"
              />
              <svg
                viewBox="0 0 100 100"
                preserveAspectRatio="none"
                fill="none"
                className="absolute left-0 top-0 z-10 h-full w-full"
              >
                {plots.map((plot) => {
                  const active = plot.id === modalPlotId;
                  const hover = plot.id === hoveredId;
                  const [cx, cy] = centroid(plot.points);
                  return (
                    <g key={plot.id}>
                      <polygon
                        points={pointsToSvg(plot.points)}
                        className={cn(
                          "relative cursor-pointer fill-[#c9a96e]/5 transition duration-150 ease-in-out",
                          (active || hover) && "fill-[#c9a96e]/40",
                        )}
                        onMouseEnter={() => setHoveredId(plot.id)}
                        onMouseLeave={() => setHoveredId(null)}
                        onClick={() => setModalPlotId(plot.id)}
                      />
                      <circle
                        className="fill-[#c9a96e] stroke-white"
                        strokeWidth={0.35}
                        cx={cx}
                        cy={cy}
                        r={1.15}
                        style={{ pointerEvents: "none" }}
                      />
                      <text
                        textAnchor="middle"
                        fill="white"
                        dy=".35em"
                        x={cx}
                        y={cy}
                        fontSize={1.15}
                        style={{ pointerEvents: "none", fontWeight: 700 }}
                      >
                        {plot.label}
                      </text>
                    </g>
                  );
                })}
              </svg>
              {hovered && !modalPlotId ? (
                <div className="popovers pointer-events-none absolute left-0 top-0 z-20 hidden h-full w-full md:block">
                  <div
                    className="absolute z-10 -translate-x-1/2 -translate-y-[110%] rounded-[5px] border border-[#E5E7EB] bg-white px-3 py-2 shadow-lg"
                    style={{
                      left: `${centroid(hovered.points)[0]}%`,
                      top: `${centroid(hovered.points)[1]}%`,
                    }}
                  >
                    <p className="text-xs font-semibold text-[#0c1428]">{hovered.label}</p>
                    {hovered.area && hovered.area > 0 ? (
                      <p className="mt-0.5 text-[11px] text-[#6B7280]">
                        {t.developerDetail.plotArea}: {hovered.area} m²
                      </p>
                    ) : null}
                    {hovered.price && hovered.price > 0 ? (
                      <p className="mt-0.5 text-[11px] font-medium text-[#c9a96e]">
                        {formatPrice(hovered.price)}
                      </p>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
            {plots.length > 0 ? (
              <div className="z-20 mb-4 hidden items-center justify-end lg:mr-10 lg:flex">
                <div
                  className="flex max-w-full flex-wrap items-center text-sm text-[#0c1428]"
                  role="list"
                  aria-label={t.developerDetail.choosePlot}
                >
                  <span className="flex h-12 items-center justify-center border border-[#c9a96e] bg-[#c9a96e] p-4 text-white">
                    {t.developerDetail.choosePlot}
                  </span>
                  {plots.map((plot) => (
                    <button
                      key={plot.id}
                      type="button"
                      title={plot.label}
                      aria-label={plot.label}
                      onMouseEnter={() => setHoveredId(plot.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onClick={() => setModalPlotId(plot.id)}
                      className={cn(
                        "flex h-12 min-w-12 cursor-pointer items-center justify-center border border-white bg-[#F3F4F6] px-3 transition duration-100 ease-in hover:border-[#c9a96e]",
                        (hoveredId === plot.id || modalPlotId === plot.id) && "border-[#c9a96e]",
                      )}
                    >
                      {plot.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </>
        )}
      </section>

      {/* Below md: Defanse hides the mapped image — show plot picker instead. */}
      <section className="border-t border-[#E5E7EB] bg-white pt-header md:hidden">
        <Container className="py-8">
          <h2 className="mb-2 text-xl font-semibold text-[#0c1428]">{t.developerDetail.siteMapTitle}</h2>
          <p className="mb-5 text-sm text-[#6B7280]">{t.developerDetail.plotMapHint}</p>
          {!imageUrl ? (
            <p className="text-sm text-[#9CA3AF]">{t.developerDetail.plotMapEmpty}</p>
          ) : plots.length > 0 ? (
            <div className="flex flex-wrap gap-2" role="list" aria-label={t.developerDetail.choosePlot}>
              {plots.map((plot) => (
                <button
                  key={`m-${plot.id}`}
                  type="button"
                  onClick={() => setModalPlotId(plot.id)}
                  className="rounded-[5px] border border-[#E5E7EB] bg-white px-3.5 py-2 text-sm font-semibold text-[#0c1428] transition-colors hover:border-[#c9a96e]"
                >
                  {plot.label}
                </button>
              ))}
            </div>
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={imageUrl} alt="" className="h-auto w-full max-h-[70vh] object-contain" />
          )}
        </Container>
      </section>

      {modalPlot ? (
        <PlotPlansModal
          plot={modalPlot}
          plans={modalPlans}
          projectSlug={project.slug}
          onClose={() => setModalPlotId(null)}
        />
      ) : null}
    </>
  );
}

function PlotPlansModal({
  plot,
  plans,
  projectSlug,
  onClose,
}: {
  plot: LandPlot;
  plans: Apartment[];
  projectSlug: string;
  onClose: () => void;
}) {
  const { t } = useI18n();

  return (
    <div
      className="fixed inset-0 z-[1200] flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-6"
      role="dialog"
      aria-modal="true"
      aria-label={plot.label}
      onClick={onClose}
    >
      <div
        className="flex max-h-[92vh] w-full max-w-3xl flex-col overflow-hidden rounded-t-[12px] bg-white shadow-xl sm:rounded-[12px]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#E5E7EB] px-5 py-4">
          <div className="min-w-0">
            <p className="text-lg font-semibold text-[#0c1428]">{plot.label}</p>
            <div className="mt-1 flex flex-wrap gap-x-3 gap-y-0.5 text-sm text-[#6B7280]">
              {plot.area && plot.area > 0 ? (
                <span>
                  {t.developerDetail.plotArea}: {plot.area} m²
                </span>
              ) : null}
              {plot.price && plot.price > 0 ? (
                <span className="font-medium text-[#c9a96e]">{formatPrice(plot.price)}</span>
              ) : null}
              <span className="uppercase tracking-wide text-[11px] text-[#9CA3AF]">
                {getStatusLabel(t, plot.status)}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0c1428]"
            aria-label={t.developerDetail.salesJourneyBack}
          >
            <X size={18} />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {t.developerDetail.plotPlansTitle}
          </p>
          {plans.length === 0 ? (
            <p className="py-8 text-center text-sm text-[#6B7280]">{t.properties.noResults}</p>
          ) : (
            <ul className="space-y-3">
              {plans.map((apt) => (
                <PlotPlanRow key={apt.id} apartment={apt} projectSlug={projectSlug} />
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

function PlotPlanRow({
  apartment,
  projectSlug,
}: {
  apartment: Apartment;
  projectSlug: string;
}) {
  const { t } = useI18n();
  const sold = apartment.status === "Sold";
  const href = `/projects/${projectSlug}/apartments/${apartment.id}`;
  const cover = apartment.floorPlanImage || apartment.gallery[0];
  const showNumber = hasApartmentNumber(apartment);

  return (
    <li className="flex flex-col gap-3 rounded-[8px] border border-[#E5E7EB] bg-[#FAFAF8] p-3 sm:flex-row sm:items-center">
      <div className="relative h-28 w-full shrink-0 overflow-hidden rounded-[5px] bg-white sm:h-24 sm:w-36">
        {cover ? (
          <Image
            src={cover}
            alt=""
            fill
            unoptimized
            className="object-contain"
            sizes="144px"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-[10px] uppercase tracking-wide text-[#A8A29E]">
            {t.aptDetail.layoutTitle}
          </div>
        )}
        {showNumber ? (
          <span className="absolute left-1.5 top-1.5 rounded bg-[#0c1428]/90 px-1.5 py-0.5 text-[10px] font-semibold text-white">
            № {apartmentDisplayNumber(apartment)}
          </span>
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-base font-bold tabular-nums text-[#0c1428]">
          {sold ? "—" : formatPrice(apartment.price)}
        </p>
        <div className="mt-1.5 flex flex-wrap gap-3 text-xs text-[#6B7280]">
          <span className="inline-flex items-center gap-1">
            <BedDouble size={13} className="text-[#c9a96e]" />
            {apartment.rooms}
          </span>
          <span className="inline-flex items-center gap-1">
            <Maximize2 size={13} className="text-[#c9a96e]" />
            {apartment.area} m²
          </span>
          {apartment.landArea && apartment.landArea > 0 ? (
            <span className="inline-flex items-center gap-1">
              <Layers size={13} className="text-[#c9a96e]" />
              {apartment.landArea} m²
            </span>
          ) : null}
          <span className="uppercase tracking-wide text-[10px] text-[#9CA3AF]">
            {getStatusLabel(t, apartment.status)}
          </span>
        </div>
      </div>
      <Link
        href={href}
        className="inline-flex h-10 shrink-0 items-center justify-center rounded-[5px] bg-[#0c1428] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#152038]"
      >
        {t.developerDetail.details}
      </Link>
    </li>
  );
}
