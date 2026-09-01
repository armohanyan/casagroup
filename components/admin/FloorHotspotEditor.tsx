"use client";

import { useEffect, useState } from "react";
import type { Apartment, ApartmentStatus, BuildingFloor, FloorHotspot } from "@/types";
import { adminSelectCls } from "@/components/admin/admin-config";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";
import { PlanTextLabelSection } from "@/components/admin/PlanTextLabelSection";
import { BilingualField } from "@/components/admin/BilingualField";
import { usePlanTextLabels } from "@/components/admin/usePlanTextLabels";
import {
  DEFAULT_PLAN_TEXT_BG,
  DEFAULT_PLAN_TEXT_COLOR,
  MAX_PLAN_TEXT_FONT_SIZE,
  MAX_PLAN_TEXT_ROTATION,
  MIN_PLAN_TEXT_FONT_SIZE,
  MIN_PLAN_TEXT_ROTATION,
  hasPlanText,
  planTextLabelFontSize,
  planTextLabelRotation,
  resolvePlanText,
} from "@/lib/plan-text-labels";

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
    textLabelSize?: string;
    textLabelRotation?: string;
    textLabelPlace?: string;
    textLabelRemove?: string;
    textLabelDuplicate?: string;
    textLabelPlaceholderHy?: string;
    textLabelPlaceholderEn?: string;
    textLabelPlaceholderRu?: string;
    copyFromOther?: string;
    textLabelCount?: string;
    textLabelHint?: string;
    hotspotLabelText?: string;
    hotspotLabelColor?: string;
    hotspotLabelBgColor?: string;
    hotspotLabelSize?: string;
    hotspotLabelRotation?: string;
    hotspotLabelPlace?: string;
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
  const [hotspotLabelPlacement, setHotspotLabelPlacement] = useState(false);

  const textLabels = floor.textLabels ?? [];
  const planLabels = usePlanTextLabels(textLabels, (next) => onChange({ textLabels: next }));

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
      ...(existing?.labelHy ? { labelHy: existing.labelHy } : {}),
      ...(existing?.labelRu ? { labelRu: existing.labelRu } : {}),
      ...(existing?.labelColor ? { labelColor: existing.labelColor } : {}),
      ...(existing?.labelBgColor ? { labelBgColor: existing.labelBgColor } : {}),
      ...(existing?.labelFontSize !== undefined ? { labelFontSize: existing.labelFontSize } : {}),
      ...(existing?.labelRotation !== undefined ? { labelRotation: existing.labelRotation } : {}),
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

  const drawing =
    Boolean(selectedAptId) &&
    !markAsSold &&
    !planLabels.labelPlacementMode &&
    !hotspotLabelPlacement;
  const selectedApt = apartments.find((a) => a.id === selectedAptId);
  const isSold = markAsSold || selectedApt?.status === "Sold";
  const selectedHotspot = floor.hotspots.find((h) => h.apartmentId === selectedAptId);

  const canvasTextLabels = [
    ...planLabels.canvasTextLabels,
    ...floor.hotspots
      .filter((h) => hasPlanText({ text: h.label, textHy: h.labelHy, textRu: h.labelRu }))
      .map((h) => {
        const pos = hotspotLabelPosition(h);
        return {
          id: `hotspot-${h.apartmentId}`,
          text: resolvePlanText({ text: h.label, textHy: h.labelHy, textRu: h.labelRu }, "hy"),
          color: h.labelColor ?? DEFAULT_PLAN_TEXT_COLOR,
          backgroundColor: h.labelBgColor ?? DEFAULT_PLAN_TEXT_BG,
          fontSize: h.labelFontSize,
          rotation: h.labelRotation,
          x: pos[0],
          y: pos[1],
          active: hotspotLabelPlacement && h.apartmentId === selectedAptId,
        };
      }),
  ];

  const placementActive = planLabels.labelPlacementMode || hotspotLabelPlacement;

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
        selectedLabelId={planLabels.selectedLabelId}
        onPlaceLabel={(pt) => {
          if (planLabels.labelPlacementMode) {
            planLabels.placeLabel(pt);
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
          planLabels.moveLabel(id, pt);
        }}
        onSelectLabel={(id) => {
          if (id.startsWith("hotspot-")) return;
          planLabels.setSelectedLabelId(id);
          planLabels.setLabelPlacementMode(false);
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
        <div className="space-y-3 rounded-[5px] border border-[#E8EAED] bg-[#FAFAF8] p-3">
          <BilingualField
            label={labels.hotspotLabelText ?? "Zone label"}
            hy={selectedHotspot.labelHy ?? ""}
            ru={selectedHotspot.labelRu ?? ""}
            en={selectedHotspot.label ?? ""}
            onHy={(v) => updateHotspotLabel({ labelHy: v || undefined })}
            onRu={(v) => updateHotspotLabel({ labelRu: v || undefined })}
            onEn={(v) => updateHotspotLabel({ label: v || undefined })}
            placeholderHy={labels.textLabelPlaceholderHy ?? "ՎԱՃԱՌՎԱԾ"}
            placeholderRu={labels.textLabelPlaceholderRu ?? "ПРОДАНО"}
            placeholderEn={labels.textLabelPlaceholderEn ?? "SOLD"}
            copyHyLabel={labels.copyFromOther ?? "Copy"}
            copyRuLabel={labels.copyFromOther ?? "Copy"}
            copyEnLabel={labels.copyFromOther ?? "Copy"}
            className="md:col-span-3"
          />
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.hotspotLabelColor ?? "Text color"}</label>
              <input
                type="color"
                className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
                value={selectedHotspot.labelColor ?? DEFAULT_PLAN_TEXT_COLOR}
                onChange={(e) => updateHotspotLabel({ labelColor: e.target.value })}
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.hotspotLabelSize ?? "Size"}</label>
              <input
                type="number"
                min={MIN_PLAN_TEXT_FONT_SIZE}
                max={MAX_PLAN_TEXT_FONT_SIZE}
                className="h-9 w-16 rounded-[5px] border border-[#E5E7EB] px-2 text-sm"
                value={planTextLabelFontSize({ fontSize: selectedHotspot.labelFontSize })}
                onChange={(e) =>
                  updateHotspotLabel({
                    labelFontSize: Number(e.target.value) || undefined,
                  })
                }
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-[#6B7280]">{labels.hotspotLabelRotation ?? "Rotation"}</label>
              <input
                type="number"
                min={MIN_PLAN_TEXT_ROTATION}
                max={MAX_PLAN_TEXT_ROTATION}
                className="h-9 w-16 rounded-[5px] border border-[#E5E7EB] px-2 text-sm"
                value={planTextLabelRotation({ rotation: selectedHotspot.labelRotation })}
                onChange={(e) =>
                  updateHotspotLabel({
                    labelRotation: Number(e.target.value) || 0,
                  })
                }
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
                planLabels.setLabelPlacementMode(false);
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

      <PlanTextLabelSection
        textLabels={textLabels}
        selectedLabelId={planLabels.selectedLabelId}
        labelPlacementMode={planLabels.labelPlacementMode}
        onSelectLabel={(id) => {
          planLabels.setSelectedLabelId(id);
          planLabels.setLabelPlacementMode(false);
          setHotspotLabelPlacement(false);
        }}
        onAddLabel={() => {
          planLabels.addTextLabel();
          setHotspotLabelPlacement(false);
        }}
        onUpdateLabel={planLabels.updateTextLabel}
        onRemoveLabel={planLabels.removeTextLabel}
        onDuplicateLabel={planLabels.duplicateTextLabel}
        onStartPlacement={() => {
          planLabels.setLabelPlacementMode(true);
          setHotspotLabelPlacement(false);
        }}
        labels={{
          title: labels.textLabelsTitle,
          add: labels.textLabelAdd,
          text: labels.textLabelText,
          color: labels.textLabelColor,
          bgColor: labels.textLabelBgColor,
          size: labels.textLabelSize,
          rotation: labels.textLabelRotation,
          place: labels.textLabelPlace,
          remove: labels.textLabelRemove,
          duplicate: labels.textLabelDuplicate,
          count: labels.textLabelCount,
          hint: labels.textLabelHint,
          placeholderHy: labels.textLabelPlaceholderHy,
          placeholderEn: labels.textLabelPlaceholderEn,
          placeholderRu: labels.textLabelPlaceholderRu,
          copyFromOther: labels.copyFromOther,
        }}
      />

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
                {hasPlanText({ text: h.label, textHy: h.labelHy, textRu: h.labelRu })
                  ? ` · "${resolvePlanText({ text: h.label, textHy: h.labelHy, textRu: h.labelRu }, "hy")}"`
                  : ""}
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
