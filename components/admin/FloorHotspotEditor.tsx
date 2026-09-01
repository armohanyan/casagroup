"use client";

import { useEffect, useState } from "react";
import type { Apartment, ApartmentStatus, BuildingFloor, FloorHotspot, FloorTextLabel } from "@/types";
import { adminSelectCls } from "@/components/admin/admin-config";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";
import { generateId } from "@/lib/store";

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
    textLabelsTitle?: string;
    textLabelAdd?: string;
    textLabelText?: string;
    textLabelColor?: string;
    textLabelBgColor?: string;
    textLabelPlace?: string;
    textLabelRemove?: string;
    textLabelCount?: string;
    textLabelHint?: string;
    hotspotLabelText?: string;
    hotspotLabelColor?: string;
    hotspotLabelBgColor?: string;
    hotspotLabelPlace?: string;
  };
}

const DEFAULT_LABEL_COLOR = "#ffffff";
const DEFAULT_LABEL_BG = "rgba(12, 20, 40, 0.7)";

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
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [labelPlacementMode, setLabelPlacementMode] = useState(false);
  const [hotspotLabelPlacement, setHotspotLabelPlacement] = useState(false);

  const textLabels = floor.textLabels ?? [];

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
    setHotspotLabelPlacement(false);
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
    if (checked && selectedAptId) {
      onChange((fl) => ({
        hotspots: (fl.hotspots ?? []).filter((h) => h.apartmentId !== selectedAptId),
      }));
      setDraft([]);
    }
  }

  async function finishPolygon() {
    if (!selectedAptId || draft.length < 3) {
      onToast?.("Առնվազն 3 կետ է պետք գոտին ավարտելու համար", "error");
      return;
    }
    const points = draft.map((p) => [p[0], p[1]] as [number, number]);
    const existing = floor.hotspots.find((h) => h.apartmentId === selectedAptId);
    const next: FloorHotspot = {
      apartmentId: selectedAptId,
      points,
      ...(existing?.label ? { label: existing.label } : {}),
      ...(existing?.labelColor ? { labelColor: existing.labelColor } : {}),
      ...(existing?.labelBgColor ? { labelBgColor: existing.labelBgColor } : {}),
      ...(existing?.labelX !== undefined ? { labelX: existing.labelX } : {}),
      ...(existing?.labelY !== undefined ? { labelY: existing.labelY } : {}),
    };
    onChange((fl) => ({
      hotspots: [...(fl.hotspots ?? []).filter((h) => h.apartmentId !== selectedAptId), next],
    }));
    setDraft([]);

    if (markAsSold && onApartmentStatusChange) {
      onApartmentStatusChange(selectedAptId, "Sold");
    }

    if (!onPersistZone) {
      onToast?.("Բնակարանի գոտին նշվեց - պահպանեք նախագիծը", "info");
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

  function updateTextLabels(next: FloorTextLabel[]) {
    onChange({ textLabels: next });
  }

  function addTextLabel() {
    const id = generateId();
    const next: FloorTextLabel = {
      id,
      text: "SOLD",
      color: DEFAULT_LABEL_COLOR,
      backgroundColor: DEFAULT_LABEL_BG,
      x: 50,
      y: 50,
    };
    updateTextLabels([...textLabels, next]);
    setSelectedLabelId(id);
    setLabelPlacementMode(true);
    setHotspotLabelPlacement(false);
  }

  function updateTextLabel(id: string, patch: Partial<FloorTextLabel>) {
    updateTextLabels(textLabels.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeTextLabel(id: string) {
    updateTextLabels(textLabels.filter((l) => l.id !== id));
    if (selectedLabelId === id) setSelectedLabelId(null);
  }

  function updateHotspotLabel(patch: Partial<FloorHotspot>) {
    if (!selectedAptId) return;
    const existing = floor.hotspots.find((h) => h.apartmentId === selectedAptId);
    if (!existing) return;
    onChange((fl) => ({
      hotspots: (fl.hotspots ?? []).map((h) =>
        h.apartmentId === selectedAptId ? { ...h, ...patch } : h,
      ),
    }));
  }

  function hotspotLabelPosition(h: FloorHotspot): [number, number] {
    if (h.labelX !== undefined && h.labelY !== undefined) return [h.labelX, h.labelY];
    const cx = h.points.reduce((s, p) => s + p[0], 0) / h.points.length;
    const cy = h.points.reduce((s, p) => s + p[1], 0) / h.points.length;
    return [cx, cy];
  }

  const aptLabel = (id: string) => {
    const apt = apartments.find((a) => a.id === id);
    if (!apt) return id;
    const num = apt.apartmentNumber?.trim();
    const base = num ? `№ ${num}` : `${apt.rooms}ր · ${apt.area} մ²`;
    const unassigned = !apt.buildingId ? " · -" : "";
    return `${base} · հարկ ${apt.floor}${unassigned}`;
  };

  if (!floor.imageUrl) {
    return (
      <p className="rounded-[5px] border border-dashed border-[#E5E7EB] bg-white px-3 py-6 text-center text-xs text-[#9CA3AF]">
        Վերբեռնեք հարկի հատակագծի նկարը՝ գոտիներ նշելու համար
      </p>
    );
  }

  const drawing = Boolean(selectedAptId) && !markAsSold && !labelPlacementMode && !hotspotLabelPlacement;
  const selectedApt = apartments.find((a) => a.id === selectedAptId);
  const isSold = markAsSold || selectedApt?.status === "Sold";
  const selectedHotspot = floor.hotspots.find((h) => h.apartmentId === selectedAptId);
  const selectedTextLabel = textLabels.find((l) => l.id === selectedLabelId);

  const canvasTextLabels = [
    ...textLabels.map((l) => ({
      id: l.id,
      text: l.text,
      color: l.color,
      backgroundColor: l.backgroundColor,
      x: l.x,
      y: l.y,
      active: l.id === selectedLabelId,
    })),
    ...floor.hotspots
      .filter((h) => h.label?.trim())
      .map((h) => {
        const pos = hotspotLabelPosition(h);
        return {
          id: `hotspot-${h.apartmentId}`,
          text: h.label!.trim(),
          color: h.labelColor ?? DEFAULT_LABEL_COLOR,
          backgroundColor: h.labelBgColor ?? DEFAULT_LABEL_BG,
          x: pos[0],
          y: pos[1],
          active: hotspotLabelPlacement && h.apartmentId === selectedAptId,
        };
      }),
  ];

  const placementActive = labelPlacementMode || hotspotLabelPlacement;

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
                  {apt.status !== "Sold" && floor.hotspots.some((h) => h.apartmentId === apt.id)
                    ? " ✓"
                    : ""}
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
        {isSold ? (
          onAddApartment && labels.addApartmentOnFloor ? (
            <button
              type="button"
              onClick={() => onAddApartment({ sold: true })}
              className="h-11 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
            >
              {labels.addApartmentOnFloor}
            </button>
          ) : null
        ) : (
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
              disabled={draft.length < 3 || persisting || placementActive}
              onClick={() => void finishPolygon()}
              className="h-11 rounded-[5px] bg-[#0c1428] px-3 text-xs font-semibold text-white disabled:opacity-40"
            >
              {persisting ? "…" : labels.finishPolygon}
            </button>
            <button
              type="button"
              disabled={draft.length === 0 || persisting || placementActive}
              onClick={() => setDraft((d) => d.slice(0, -1))}
              className="h-11 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428] disabled:opacity-40"
            >
              {labels.undoPoint}
            </button>
            <button
              type="button"
              disabled={draft.length === 0 || persisting || placementActive}
              onClick={() => setDraft([])}
              className="h-11 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428] disabled:opacity-40"
            >
              {labels.clearDraft}
            </button>
          </div>
        )}
      </div>

      {isSold && labels.soldZoneHint ? (
        <p className="text-xs text-[#6B7280]">{labels.soldZoneHint}</p>
      ) : (
        <p className="text-xs text-[#6B7280]">{labels.drawHint}</p>
      )}

      <PlanHotspotCanvas
        imageUrl={floor.imageUrl}
        drawing={drawing}
        draft={isSold ? [] : draft}
        onAddPoint={(pt) => {
          if (!selectedAptId || placementActive) return;
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
        textLabels={canvasTextLabels}
        labelPlacementMode={placementActive}
        selectedLabelId={selectedLabelId}
        onPlaceLabel={(pt) => {
          if (labelPlacementMode && selectedLabelId) {
            updateTextLabel(selectedLabelId, { x: pt[0], y: pt[1] });
            setLabelPlacementMode(false);
            return;
          }
          if (hotspotLabelPlacement && selectedHotspot) {
            updateHotspotLabel({ labelX: pt[0], labelY: pt[1] });
            setHotspotLabelPlacement(false);
          }
        }}
        onMoveLabel={(id, pt) => {
          if (id.startsWith("hotspot-")) {
            const aptId = id.slice("hotspot-".length);
            onChange((fl) => ({
              hotspots: (fl.hotspots ?? []).map((h) =>
                h.apartmentId === aptId ? { ...h, labelX: pt[0], labelY: pt[1] } : h,
              ),
            }));
            return;
          }
          updateTextLabel(id, { x: pt[0], y: pt[1] });
        }}
        onSelectLabel={(id) => {
          if (id.startsWith("hotspot-")) return;
          setSelectedLabelId(id);
          setLabelPlacementMode(false);
          setHotspotLabelPlacement(false);
        }}
        labels={{
          zoomIn: labels.zoomIn,
          zoomOut: labels.zoomOut,
          zoomReset: labels.zoomReset,
          panMode: labels.panMode,
          drawMode: labels.drawMode,
        }}
      />

      {selectedHotspot && !isSold ? (
        <div className="space-y-2 rounded-[5px] border border-[#E8EAED] bg-[#FAFAF8] p-3">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.hotspotLabelText ?? "Zone label"}
          </p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[120px] flex-1">
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.hotspotLabelText ?? "Text"}</label>
              <input
                type="text"
                className="h-9 w-full rounded-[5px] border border-[#E5E7EB] px-2 text-sm"
                value={selectedHotspot.label ?? ""}
                placeholder="SOLD"
                onChange={(e) =>
                  updateHotspotLabel({ label: e.target.value || undefined })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.hotspotLabelColor ?? "Text color"}</label>
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
                value={selectedHotspot.labelColor ?? DEFAULT_LABEL_COLOR}
                onChange={(e) => updateHotspotLabel({ labelColor: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.hotspotLabelBgColor ?? "Background"}</label>
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
                value={
                  selectedHotspot.labelBgColor?.startsWith("#")
                    ? selectedHotspot.labelBgColor
                    : "#0c1428"
                }
                onChange={(e) => updateHotspotLabel({ labelBgColor: e.target.value })}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setHotspotLabelPlacement(true);
                setLabelPlacementMode(false);
              }}
              className={
                hotspotLabelPlacement
                  ? "h-9 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
                  : "h-9 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428]"
              }
            >
              {labels.hotspotLabelPlace ?? "Place on map"}
            </button>
          </div>
        </div>
      ) : null}

      <div className="space-y-2 rounded-[5px] border border-[#E8EAED] bg-[#FAFAF8] p-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
            {labels.textLabelsTitle ?? "Text on floor plan"}
          </p>
          {labels.textLabelAdd ? (
            <button
              type="button"
              onClick={addTextLabel}
              className="h-9 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
            >
              {labels.textLabelAdd}
            </button>
          ) : null}
        </div>
        {labels.textLabelHint ? (
          <p className="text-xs text-[#6B7280]">{labels.textLabelHint}</p>
        ) : null}
        {selectedTextLabel ? (
          <div className="flex flex-wrap items-end gap-3">
            <div className="min-w-[120px] flex-1">
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.textLabelText ?? "Text"}</label>
              <input
                type="text"
                className="h-9 w-full rounded-[5px] border border-[#E5E7EB] px-2 text-sm"
                value={selectedTextLabel.text}
                onChange={(e) => updateTextLabel(selectedTextLabel.id, { text: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.textLabelColor ?? "Text color"}</label>
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
                value={selectedTextLabel.color}
                onChange={(e) => updateTextLabel(selectedTextLabel.id, { color: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.textLabelBgColor ?? "Background"}</label>
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
                value={
                  selectedTextLabel.backgroundColor?.startsWith("#")
                    ? selectedTextLabel.backgroundColor
                    : "#0c1428"
                }
                onChange={(e) =>
                  updateTextLabel(selectedTextLabel.id, { backgroundColor: e.target.value })
                }
              />
            </div>
            <button
              type="button"
              onClick={() => {
                setLabelPlacementMode(true);
                setHotspotLabelPlacement(false);
              }}
              className={
                labelPlacementMode
                  ? "h-9 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
                  : "h-9 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428]"
              }
            >
              {labels.textLabelPlace ?? "Place on map"}
            </button>
            <button
              type="button"
              onClick={() => removeTextLabel(selectedTextLabel.id)}
              className="h-9 rounded-[5px] px-3 text-xs font-semibold text-red-500 hover:bg-red-50"
            >
              {labels.textLabelRemove ?? "Remove"}
            </button>
          </div>
        ) : null}
        {textLabels.length > 0 ? (
          <ul className="space-y-1">
            {labels.textLabelCount ? (
              <li className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                {labels.textLabelCount.replace("{count}", String(textLabels.length))}
              </li>
            ) : null}
            {textLabels.map((l) => (
              <li key={l.id}>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedLabelId(l.id);
                    setLabelPlacementMode(false);
                    setHotspotLabelPlacement(false);
                  }}
                  className={
                    l.id === selectedLabelId
                      ? "w-full rounded-[5px] border border-[#c9a96e] bg-white px-3 py-2 text-left text-xs text-[#0c1428]"
                      : "w-full rounded-[5px] border border-[#E8EAED] bg-white px-3 py-2 text-left text-xs text-[#0c1428] hover:border-[#c9a96e]"
                  }
                >
                  <span style={{ color: l.color }}>{l.text}</span>
                  <span className="ml-2 text-[#9CA3AF]">
                    ({Math.round(l.x)}%, {Math.round(l.y)}%)
                  </span>
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      {!isSold && floor.hotspots.length > 0 ? (
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
                {h.label ? ` · "${h.label}"` : ""}
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
