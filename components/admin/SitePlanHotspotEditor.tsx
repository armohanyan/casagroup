"use client";

import { useRef, useState } from "react";
import type { LandPlot } from "@/types";
import { cn } from "@/lib/utils";
import { adminSelectCls } from "@/components/admin/admin-config";

interface Props {
  imageUrl: string;
  plots: LandPlot[];
  onChangePlot: (id: string, patch: Partial<LandPlot>) => void;
  labels: {
    selectPlot: string;
    drawHint: string;
    finishPolygon: string;
    undoPoint: string;
    clearDraft: string;
    removeHotspot: string;
    noPlots: string;
    hotspotCount: string;
    emptyImage: string;
  };
}

function pointsToSvg(points: [number, number][]) {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

export function SitePlanHotspotEditor({ imageUrl, plots, onChangePlot, labels }: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const drawable = plots.filter((p) => p.label.trim());
  const [selectedId, setSelectedId] = useState(drawable[0]?.id ?? "");
  const [draft, setDraft] = useState<[number, number][]>([]);
  const [hoveredId, setHoveredId] = useState<string | null>(null);

  function pointerToPercent(e: React.MouseEvent<SVGSVGElement>): [number, number] | null {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.width <= 0 || rect.height <= 0) return null;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    return [Math.min(100, Math.max(0, x)), Math.min(100, Math.max(0, y))];
  }

  function addPoint(e: React.MouseEvent<SVGSVGElement>) {
    if (!selectedId || !imageUrl) return;
    const pt = pointerToPercent(e);
    if (!pt) return;
    setDraft((d) => [...d, pt]);
  }

  function finishPolygon() {
    if (!selectedId || draft.length < 3) return;
    onChangePlot(selectedId, { points: draft });
    setDraft([]);
  }

  function removeHotspot(id: string) {
    onChangePlot(id, { points: [] });
  }

  if (!imageUrl.trim()) {
    return (
      <p className="rounded-[5px] border border-dashed border-[#E5E7EB] bg-white px-3 py-6 text-center text-xs text-[#9CA3AF]">
        {labels.emptyImage}
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.selectPlot}
          </label>
          <select
            className={adminSelectCls}
            value={selectedId}
            onChange={(e) => {
              setSelectedId(e.target.value);
              setDraft([]);
            }}
            disabled={drawable.length === 0}
          >
            {drawable.length === 0 ? (
              <option value="">{labels.noPlots}</option>
            ) : (
              drawable.map((plot) => (
                <option key={plot.id} value={plot.id}>
                  {plot.label} ({plot.status})
                </option>
              ))
            )}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={draft.length < 3}
            onClick={finishPolygon}
            className="h-11 rounded-[5px] bg-[#0c1428] px-3 text-xs font-semibold text-white disabled:opacity-40"
          >
            {labels.finishPolygon}
          </button>
          <button
            type="button"
            disabled={draft.length === 0}
            onClick={() => setDraft((d) => d.slice(0, -1))}
            className="h-11 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428] disabled:opacity-40"
          >
            {labels.undoPoint}
          </button>
          <button
            type="button"
            disabled={draft.length === 0}
            onClick={() => setDraft([])}
            className="h-11 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428] disabled:opacity-40"
          >
            {labels.clearDraft}
          </button>
        </div>
      </div>

      <p className="text-xs text-[#6B7280]">{labels.drawHint}</p>

      <div className="relative overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={imageUrl} alt="" className="block h-auto w-full select-none" draggable={false} />
        <svg
          ref={svgRef}
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          className="absolute inset-0 h-full w-full cursor-crosshair"
          onClick={addPoint}
        >
          {plots
            .filter((p) => p.points.length >= 3)
            .map((plot) => (
              <polygon
                key={plot.id}
                points={pointsToSvg(plot.points)}
                className={cn(
                  "stroke-[#0c1428] stroke-[0.3] transition-opacity",
                  hoveredId === plot.id || selectedId === plot.id
                    ? "fill-[#c45c4a]/55"
                    : "fill-[#c45c4a]/30",
                )}
                onMouseEnter={() => setHoveredId(plot.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedId(plot.id);
                }}
              />
            ))}
          {draft.length > 0 && (
            <>
              <polyline
                points={pointsToSvg(draft)}
                fill="none"
                stroke="#c9a96e"
                strokeWidth="0.4"
                strokeDasharray="1 1"
              />
              {draft.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r="0.7" fill="#c9a96e" />
              ))}
            </>
          )}
        </svg>
      </div>

      {plots.some((p) => p.points.length >= 3) && (
        <ul className="space-y-1.5">
          <li className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.hotspotCount.replace(
              "{count}",
              String(plots.filter((p) => p.points.length >= 3).length),
            )}
          </li>
          {plots
            .filter((p) => p.points.length >= 3)
            .map((plot) => (
              <li
                key={plot.id}
                className="flex items-center justify-between gap-2 rounded-[5px] border border-[#E8EAED] bg-white px-3 py-2 text-xs"
              >
                <span className="min-w-0 truncate text-[#0c1428]">{plot.label}</span>
                <button
                  type="button"
                  className="shrink-0 text-red-500 hover:underline"
                  onClick={() => removeHotspot(plot.id)}
                >
                  {labels.removeHotspot}
                </button>
              </li>
            ))}
        </ul>
      )}
    </div>
  );
}
