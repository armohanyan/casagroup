"use client";

import { useEffect, useState } from "react";
import type { Apartment, ApartmentStatus, BuildingFloor, FloorHotspot } from "@/types";
import { adminSelectCls } from "@/components/admin/admin-config";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";

interface Props {
  floor: BuildingFloor;
  apartments: Apartment[];
  onChange: (
    patch: Partial<BuildingFloor> | ((floor: BuildingFloor) => Partial<BuildingFloor>),
  ) => void;
  onAddApartment?: (options?: { sold?: boolean }) => void;
  onApartmentStatusChange?: (apartmentId: string, status: ApartmentStatus) => void;
  /** Persist project after a zone is committed. Return true when server kept the zone. */
  onPersistZone?: () => Promise<boolean>;
  onToast?: (message: string, type?: "success" | "error" | "info") => void;
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
    markAsSold?: string;
    soldZoneHint?: string;
  };
}

export function FloorHotspotEditor({
  floor,
  apartments,
  onChange,
  onAddApartment,
  onApartmentStatusChange,
  onPersistZone,
  onToast,
  labels,
}: Props) {
  const [selectedAptId, setSelectedAptId] = useState(apartments[0]?.id ?? "");
  const [draft, setDraft] = useState<[number, number][]>([]);
  const [persisting, setPersisting] = useState(false);
  const [markAsSold, setMarkAsSold] = useState(false);

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

  useEffect(() => {
    const apt = apartments.find((a) => a.id === selectedAptId);
    setMarkAsSold(apt?.status === "Sold");
  }, [apartments, selectedAptId]);

  function selectApartment(id: string) {
    setSelectedAptId(id);
    const existing = floor.hotspots.find((h) => h.apartmentId === id);
    setDraft(
      existing && existing.points.length >= 3
        ? existing.points.map((p) => [p[0], p[1]] as [number, number])
        : [],
    );
  }

  function handleMarkAsSoldChange(checked: boolean) {
    setMarkAsSold(checked);
    if (selectedAptId && onApartmentStatusChange) {
      onApartmentStatusChange(selectedAptId, checked ? "Sold" : "Available");
    }
  }

  async function finishPolygon() {
    if (!selectedAptId || draft.length < 3) {
      onToast?.("Առնվազն 3 կետ է պետք գոտին ավարտելու համար", "error");
      return;
    }
    const points = draft.map((p) => [p[0], p[1]] as [number, number]);
    const next: FloorHotspot = {
      apartmentId: selectedAptId,
      points,
    };
    onChange((fl) => ({
      hotspots: [...(fl.hotspots ?? []).filter((h) => h.apartmentId !== selectedAptId), next],
    }));
    // Clear draft so the committed polygon is visible immediately.
    setDraft([]);

    if (markAsSold && onApartmentStatusChange) {
      onApartmentStatusChange(selectedAptId, "Sold");
    }

    if (!onPersistZone) {
      onToast?.("Բնակարանի գոտին նշվեց — պահպանեք նախագիծը", "info");
      return;
    }
    setPersisting(true);
    try {
      const ok = await onPersistZone();
      if (!ok) setDraft(points);
    } finally {
      setPersisting(false);
    }
  }

  function removeHotspot(apartmentId: string) {
    onChange((fl) => ({
      hotspots: (fl.hotspots ?? []).filter((h) => h.apartmentId !== apartmentId),
    }));
    if (apartmentId === selectedAptId) setDraft([]);
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
        <div className="space-y-2">
          <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.selectApartment}
          </label>
          <select
            className={adminSelectCls}
            value={selectedAptId}
            onChange={(e) => selectApartment(e.target.value)}
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
          {labels.markAsSold ? (
            <label className="flex items-center gap-2 text-sm text-[#0c1428]">
              <input
                type="checkbox"
                checked={markAsSold}
                disabled={!selectedAptId}
                onChange={(e) => handleMarkAsSoldChange(e.target.checked)}
              />
              {labels.markAsSold}
            </label>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          {onAddApartment && labels.addApartmentOnFloor ? (
            <button
              type="button"
              onClick={() => onAddApartment({ sold: markAsSold })}
              className="h-11 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
            >
              {labels.addApartmentOnFloor}
            </button>
          ) : null}
          <button
            type="button"
            disabled={draft.length < 3 || persisting}
            onClick={() => void finishPolygon()}
            className="h-11 rounded-[5px] bg-[#0c1428] px-3 text-xs font-semibold text-white disabled:opacity-40"
          >
            {persisting ? "…" : labels.finishPolygon}
          </button>
          <button
            type="button"
            disabled={draft.length === 0 || persisting}
            onClick={() => setDraft((d) => d.slice(0, -1))}
            className="h-11 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428] disabled:opacity-40"
          >
            {labels.undoPoint}
          </button>
          <button
            type="button"
            disabled={draft.length === 0 || persisting}
            onClick={() => setDraft([])}
            className="h-11 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428] disabled:opacity-40"
          >
            {labels.clearDraft}
          </button>
        </div>
      </div>

      {markAsSold && labels.soldZoneHint ? (
        <p className="text-xs text-[#6B7280]">{labels.soldZoneHint}</p>
      ) : (
        <p className="text-xs text-[#6B7280]">{labels.drawHint}</p>
      )}

      <PlanHotspotCanvas
        imageUrl={floor.imageUrl}
        drawing={drawing}
        draft={draft}
        onAddPoint={(pt) => {
          if (!selectedAptId) return;
          setDraft((d) => [...d, pt]);
        }}
        onMovePoint={(index, pt) => setDraft((d) => d.map((p, i) => (i === index ? pt : p)))}
        onFinishDraft={() => void finishPolygon()}
        onSelectPolygon={(id) => selectApartment(id)}
        polygons={floor.hotspots
          .filter((h) => !(h.apartmentId === selectedAptId && draft.length > 0))
          .map((h) => ({
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
                onClick={() => selectApartment(h.apartmentId)}
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
