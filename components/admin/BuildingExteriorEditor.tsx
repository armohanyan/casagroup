"use client";

import { useEffect, useState } from "react";
import { AdminImageThumb } from "@/components/admin/AdminImageThumb";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";
import { useAdminImagePicker } from "@/components/admin/useAdminImagePicker";
import { adminBtnSecondary, adminInputCls, adminSelectCls } from "@/components/admin/admin-config";
import type { Building, BuildingFloor } from "@/types";
import { cn } from "@/lib/utils";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="mb-1.5 block text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
        {label}
      </label>
      {children}
    </div>
  );
}

type Labels = {
  exteriorImage: string;
  uploadImage: string;
  selectFloor: string;
  drawHint: string;
  finishPolygon: string;
  undoPoint: string;
  clearDraft: string;
  removeBand: string;
  noFloors: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  panMode: string;
  drawMode: string;
  editImage?: string;
  imageEditorTitle?: string;
  imageEditorZoom?: string;
  imageEditorRotate?: string;
  imageEditorFlipH?: string;
  imageEditorFlipV?: string;
  imageEditorApply?: string;
  imageEditorCancel?: string;
  imageEditorAspectFree?: string;
  imageEditorAspect1?: string;
  imageEditorAspect43?: string;
  imageEditorAspect169?: string;
  imageEditorAspect34?: string;
};

interface Props {
  projectId?: string;
  building: Building;
  onChange: (patch: Partial<Building>) => void;
  onChangeFloor: (floorId: string, patch: Partial<BuildingFloor>) => void;
  /** Persist project after a zone is committed. Return true when server kept the zone. */
  onPersistZone?: () => Promise<boolean>;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
  labels: Labels;
}

function draftFromFloor(floor: BuildingFloor | undefined): [number, number][] {
  const pts = floor?.exteriorHotspot;
  return pts && pts.length >= 3 ? pts.map((p) => [p[0], p[1]] as [number, number]) : [];
}

export function BuildingExteriorEditor({
  projectId,
  building,
  onChange,
  onChangeFloor,
  onPersistZone,
  onToast,
  labels,
}: Props) {
  const imagePicker = useAdminImagePicker(
    {
      title: labels.imageEditorTitle,
      zoom: labels.imageEditorZoom,
      rotate: labels.imageEditorRotate,
      flipH: labels.imageEditorFlipH,
      flipV: labels.imageEditorFlipV,
      apply: labels.imageEditorApply,
      cancel: labels.imageEditorCancel,
      aspectFree: labels.imageEditorAspectFree,
      aspect1: labels.imageEditorAspect1,
      aspect43: labels.imageEditorAspect43,
      aspect169: labels.imageEditorAspect169,
      aspect34: labels.imageEditorAspect34,
      edit: labels.editImage,
    },
    (msg) => onToast(msg, "error"),
  );

  const floors = [...(building.floors ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
  );
  const floorIdsKey = floors.map((f) => f.id).join(",");
  const [selectedFloorId, setSelectedFloorId] = useState(floors[0]?.id ?? "");
  const [draft, setDraft] = useState<[number, number][]>(() =>
    draftFromFloor(floors.find((f) => f.id === (floors[0]?.id ?? ""))),
  );
  const [persisting, setPersisting] = useState(false);

  const exteriorUrl = building.exteriorImageUrl ?? "";

  useEffect(() => {
    if (floors.length === 0) {
      if (selectedFloorId) setSelectedFloorId("");
      setDraft([]);
      return;
    }
    if (!floors.some((f) => f.id === selectedFloorId)) {
      const nextId = floors[0].id;
      setSelectedFloorId(nextId);
      setDraft(draftFromFloor(floors[0]));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [floorIdsKey, selectedFloorId]);

  function selectFloor(floorId: string) {
    setSelectedFloorId(floorId);
    setDraft(draftFromFloor(floors.find((f) => f.id === floorId)));
  }

  function uploadExterior() {
    imagePicker.pickAndUpload({
      projectId,
      onUploaded: ({ url, raw }) => {
        const finalUrl = raw.hasAlpha ? raw.url : raw.jpegUrl || raw.url || url;
        if (finalUrl) {
          onChange({ exteriorImageUrl: finalUrl });
          onToast("Նկարը վերբեռնվեց");
        }
      },
    });
  }

  function editExterior() {
    if (!exteriorUrl.trim()) return;
    void imagePicker.editExisting({
      src: exteriorUrl,
      projectId,
      onUploaded: ({ url, raw }) => {
        const finalUrl = raw.hasAlpha ? raw.url : raw.jpegUrl || raw.url || url;
        if (finalUrl) {
          onChange({ exteriorImageUrl: finalUrl });
          onToast("Նկարը թարմացվեց");
        }
      },
    });
  }

  async function finishBand() {
    if (!selectedFloorId || draft.length < 3) {
      onToast("Առնվազն 3 կետ է պետք գոտին ավարտելու համար", "error");
      return;
    }
    const points = draft.map((p) => [p[0], p[1]] as [number, number]);
    onChangeFloor(selectedFloorId, { exteriorHotspot: points });
    // Clear draft so the committed (red) polygon is visible immediately.
    setDraft([]);

    if (!onPersistZone) {
      onToast("Հարկի գոտին նշվեց — պահպանեք նախագիծը", "info");
      return;
    }
    setPersisting(true);
    try {
      const ok = await onPersistZone();
      if (!ok) {
        // Keep points in draft so the user can retry save without redrawing.
        setDraft(points);
      }
    } finally {
      setPersisting(false);
    }
  }

  if (!exteriorUrl.trim() && floors.length === 0) {
    return (
      <div className="space-y-3 rounded-[5px] border border-dashed border-[#E5E7EB] bg-[#FAFAF8] p-4">
        <Field label={labels.exteriorImage}>
          <div className="flex flex-wrap gap-2">
            <input
              className={cn(adminInputCls, "flex-1")}
              value={exteriorUrl}
              onChange={(e) => onChange({ exteriorImageUrl: e.target.value })}
              placeholder="https://…"
            />
            <button
              type="button"
              className={cn(adminBtnSecondary, "h-11")}
              disabled={imagePicker.busy}
              onClick={uploadExterior}
            >
              {imagePicker.busy ? "…" : labels.uploadImage}
            </button>
          </div>
        </Field>
        {imagePicker.ui}
      </div>
    );
  }

  return (
    <div className="space-y-3 rounded-[5px] border border-[#E8EAED] bg-[#FAFAF8] p-4">
      <Field label={labels.exteriorImage}>
        <div className="flex flex-wrap gap-2">
          <input
            className={cn(adminInputCls, "flex-1")}
            value={exteriorUrl}
            onChange={(e) => onChange({ exteriorImageUrl: e.target.value })}
            placeholder="https://…"
          />
          <button
            type="button"
            className={cn(adminBtnSecondary, "h-11")}
            disabled={imagePicker.busy}
            onClick={uploadExterior}
          >
            {imagePicker.busy ? "…" : labels.uploadImage}
          </button>
        </div>
      </Field>
      {exteriorUrl.trim() ? (
        <AdminImageThumb
          src={exteriorUrl}
          className="h-40 w-full max-w-sm aspect-auto sm:aspect-[4/3]"
          imgClassName="object-contain bg-white"
          removeLabel="×"
          editLabel={labels.editImage}
          onEdit={editExterior}
          onRemove={() => {
            onChange({ exteriorImageUrl: "" });
            for (const f of building.floors ?? []) {
              if ((f.exteriorHotspot?.length ?? 0) > 0) {
                onChangeFloor(f.id, { exteriorHotspot: [] });
              }
            }
            setDraft([]);
          }}
        />
      ) : null}

      {exteriorUrl.trim() ? (
        <>
          <Field label={labels.selectFloor}>
            <select
              className={adminSelectCls}
              value={selectedFloorId}
              onChange={(e) => selectFloor(e.target.value)}
              disabled={floors.length === 0}
            >
              {floors.length === 0 ? (
                <option value="">{labels.noFloors}</option>
              ) : (
                floors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.label}
                    {(f.exteriorHotspot?.length ?? 0) >= 3 ? " ✓" : ""}
                  </option>
                ))
              )}
            </select>
          </Field>
          <p className="text-xs text-[#6B7280]">{labels.drawHint}</p>
          <PlanHotspotCanvas
            imageUrl={exteriorUrl}
            polygons={floors
              .filter((f) => {
                if ((f.exteriorHotspot?.length ?? 0) < 3) return false;
                // Hide committed only while actively (re)drawing that floor.
                if (f.id === selectedFloorId && draft.length > 0) return false;
                return true;
              })
              .map((f) => ({
                id: f.id,
                points: f.exteriorHotspot as [number, number][],
                active: f.id === selectedFloorId,
              }))}
            draft={draft}
            drawing={Boolean(selectedFloorId)}
            onAddPoint={(pt) => setDraft((d) => [...d, pt])}
            onMovePoint={(index, pt) =>
              setDraft((d) => d.map((p, i) => (i === index ? pt : p)))
            }
            onSelectPolygon={(id) => selectFloor(id)}
            onFinishDraft={() => void finishBand()}
            labels={{
              zoomIn: labels.zoomIn,
              zoomOut: labels.zoomOut,
              zoomReset: labels.zoomReset,
              panMode: labels.panMode,
              drawMode: labels.drawMode,
            }}
          />
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              className={cn(adminBtnSecondary, "h-9 text-xs")}
              onClick={() => void finishBand()}
              disabled={draft.length < 3 || !selectedFloorId || persisting}
            >
              {persisting ? "…" : labels.finishPolygon}
            </button>
            <button
              type="button"
              className={cn(adminBtnSecondary, "h-9 text-xs")}
              onClick={() => setDraft((d) => d.slice(0, -1))}
              disabled={draft.length === 0 || persisting}
            >
              {labels.undoPoint}
            </button>
            <button
              type="button"
              className={cn(adminBtnSecondary, "h-9 text-xs")}
              onClick={() => setDraft([])}
              disabled={draft.length === 0 || persisting}
            >
              {labels.clearDraft}
            </button>
            {selectedFloorId ? (
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-[5px] px-3 text-xs text-red-500 hover:bg-red-50"
                disabled={persisting}
                onClick={() => {
                  onChangeFloor(selectedFloorId, { exteriorHotspot: [] });
                  setDraft([]);
                }}
              >
                {labels.removeBand}
              </button>
            ) : null}
          </div>
        </>
      ) : null}
      {imagePicker.ui}
    </div>
  );
}
