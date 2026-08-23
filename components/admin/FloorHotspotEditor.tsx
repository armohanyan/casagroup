"use client";

import { useEffect, useState } from "react";
import type { Apartment, BuildingFloor, FloorHotspot } from "@/types";
import { adminSelectCls } from "@/components/admin/admin-config";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";

interface Props {
  floor: BuildingFloor;
  apartments: Apartment[];
  onChange: (patch: Partial<BuildingFloor>) => void;
  onAddApartment?: () => void;
  labels: {
    selectApartment: string;
    drawHint: string;
    finishPolygon: string;
    undoPoint: string;
    clearDraft: string;
    removeHotspot: string;
    noApartments: string;
    hotspotCount: string;
    zoomIn: string;
    zoomOut: string;
    zoomReset: string;
    panMode: string;
    drawMode: string;
    addApartmentOnFloor?: string;
  };
}

export function FloorHotspotEditor({ floor, apartments, onChange, onAddApartment, labels }: Props) {
  const [selectedAptId, setSelectedAptId] = useState(apartments[0]?.id ?? "");
  const [draft, setDraft] = useState<[number, number][]>([]);

  useEffect(() => {
    if (apartments.length === 0) {
      if (selectedAptId) setSelectedAptId("");
      return;
    }
    if (!apartments.some((a) => a.id === selectedAptId)) {
      setSelectedAptId(apartments[0].id);
      setDraft([]);
    }
  }, [apartments, selectedAptId]);

  function finishPolygon() {
    if (!selectedAptId || draft.length < 3) return;
    const next: FloorHotspot = { apartmentId: selectedAptId, points: draft };
    onChange({
      hotspots: [...floor.hotspots.filter((h) => h.apartmentId !== selectedAptId), next],
    });
    setDraft([]);
  }

  function removeHotspot(apartmentId: string) {
    onChange({ hotspots: floor.hotspots.filter((h) => h.apartmentId !== apartmentId) });
  }

  const aptLabel = (id: string) => {
    const apt = apartments.find((a) => a.id === id);
    if (!apt) return id;
    const num = apt.apartmentNumber?.trim();
    const base = num ? `№ ${num}` : `${apt.rooms}ր · ${apt.area} մ²`;
    const unassigned = !apt.buildingId ? " · —" : "";
    return `${base} · հարկ ${apt.floor}${unassigned}`;
  };

  if (!floor.imageUrl) {
    return (
      <p className="rounded-[5px] border border-dashed border-[#E5E7EB] bg-white px-3 py-6 text-center text-xs text-[#9CA3AF]">
        Վերբեռնեք հարկի հատակագծի նկարը՝ գոտիներ նշելու համար
      </p>
    );
  }

  const drawing = Boolean(selectedAptId);

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
        <div>
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.selectApartment}
          </label>
          <select
            className={adminSelectCls}
            value={selectedAptId}
            onChange={(e) => {
              setSelectedAptId(e.target.value);
              setDraft([]);
            }}
            disabled={apartments.length === 0}
          >
            {apartments.length === 0 ? (
              <option value="">{labels.noApartments}</option>
            ) : (
              apartments.map((apt) => (
                <option key={apt.id} value={apt.id}>
                  {aptLabel(apt.id)} ({apt.status})
                  {floor.hotspots.some((h) => h.apartmentId === apt.id) ? " ✓" : ""}
                </option>
              ))
            )}
          </select>
        </div>
        <div className="flex flex-wrap gap-2">
          {onAddApartment && labels.addApartmentOnFloor ? (
            <button
              type="button"
              onClick={onAddApartment}
              className="h-11 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
            >
              {labels.addApartmentOnFloor}
            </button>
          ) : null}
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
        imageUrl={floor.imageUrl}
        drawing={drawing}
        draft={draft}
        onAddPoint={(pt) => {
          if (!selectedAptId) return;
          setDraft((d) => [...d, pt]);
        }}
        onFinishDraft={finishPolygon}
        onSelectPolygon={(id) => {
          setSelectedAptId(id);
          setDraft([]);
        }}
        polygons={floor.hotspots.map((h) => ({
          id: h.apartmentId,
          points: h.points,
          active: h.apartmentId === selectedAptId,
          dimmed: Boolean(selectedAptId) && h.apartmentId !== selectedAptId,
        }))}
        labels={{
          zoomIn: labels.zoomIn,
          zoomOut: labels.zoomOut,
          zoomReset: labels.zoomReset,
          panMode: labels.panMode,
          drawMode: labels.drawMode,
        }}
      />

      {floor.hotspots.length > 0 ? (
        <ul className="space-y-1.5">
          <li className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.hotspotCount.replace("{count}", String(floor.hotspots.length))}
          </li>
          {floor.hotspots.map((h) => (
            <li
              key={h.apartmentId}
              className="flex items-center justify-between gap-2 rounded-[5px] border border-[#E8EAED] bg-white px-3 py-2 text-xs"
            >
              <button
                type="button"
                className="min-w-0 truncate text-left text-[#0c1428] hover:underline"
                onClick={() => {
                  setSelectedAptId(h.apartmentId);
                  setDraft([]);
                }}
              >
                {aptLabel(h.apartmentId)}
              </button>
              <button
                type="button"
                className="shrink-0 text-red-500 hover:underline"
                onClick={() => removeHotspot(h.apartmentId)}
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
