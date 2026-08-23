"use client";

import { useEffect, useMemo, useState } from "react";
import type { LandPlot } from "@/types";
import { adminSelectCls } from "@/components/admin/admin-config";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";

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
    zoomIn: string;
    zoomOut: string;
    zoomReset: string;
    panMode: string;
    drawMode: string;
  };
}

export function SitePlanHotspotEditor({ imageUrl, plots, onChangePlot, labels }: Props) {
  const drawable = useMemo(() => plots.filter((p) => p.label.trim()), [plots]);
  const [selectedId, setSelectedId] = useState(drawable[0]?.id ?? "");
  const [draft, setDraft] = useState<[number, number][]>([]);

  useEffect(() => {
    if (drawable.length === 0) {
      if (selectedId) setSelectedId("");
      return;
    }
    if (!drawable.some((p) => p.id === selectedId)) {
      setSelectedId(drawable[0].id);
      setDraft([]);
    }
  }, [drawable, selectedId]);

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

  const drawing = Boolean(selectedId);

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
                  {plot.points.length >= 3 ? " ✓" : ""}
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

      <PlanHotspotCanvas
        imageUrl={imageUrl}
        drawing={drawing}
        draft={draft}
        onAddPoint={(pt) => {
          if (!selectedId) return;
          setDraft((d) => [...d, pt]);
        }}
        onFinishDraft={finishPolygon}
        onSelectPolygon={(id) => {
          setSelectedId(id);
          setDraft([]);
        }}
        polygons={plots
          .filter((p) => p.points.length >= 3)
          .map((plot) => ({
            id: plot.id,
            points: plot.points,
            active: plot.id === selectedId,
            dimmed: Boolean(selectedId) && plot.id !== selectedId,
          }))}
        labels={{
          zoomIn: labels.zoomIn,
          zoomOut: labels.zoomOut,
          zoomReset: labels.zoomReset,
          panMode: labels.panMode,
          drawMode: labels.drawMode,
        }}
      />

      {plots.some((p) => p.points.length >= 3) ? (
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
                <button
                  type="button"
                  className="min-w-0 truncate text-left text-[#0c1428] hover:underline"
                  onClick={() => {
                    setSelectedId(plot.id);
                    setDraft([]);
                  }}
                >
                  {plot.label}
                </button>
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
      ) : null}
    </div>
  );
}
