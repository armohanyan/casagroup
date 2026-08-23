"use client";

import { useRef, useState } from "react";
import { AdminImageThumb } from "@/components/admin/AdminImageThumb";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";
import { adminBtnSecondary, adminInputCls, adminSelectCls } from "@/components/admin/admin-config";
import { adminUploadFile } from "@/lib/api-client";
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
};

interface Props {
  projectId?: string;
  building: Building;
  onChange: (patch: Partial<Building>) => void;
  onToast: (message: string, type?: "success" | "error") => void;
  labels: Labels;
}

export function BuildingExteriorEditor({
  projectId,
  building,
  onChange,
  onToast,
  labels,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [selectedFloorId, setSelectedFloorId] = useState(building.floors[0]?.id ?? "");
  const [draft, setDraft] = useState<[number, number][]>([]);

  const exteriorUrl = building.exteriorImageUrl ?? "";
  const floors = [...(building.floors ?? [])].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label, undefined, { numeric: true }),
  );

  function updateFloor(floorId: string, patch: Partial<BuildingFloor>) {
    onChange({
      floors: building.floors.map((f) => (f.id === floorId ? { ...f, ...patch } : f)),
    });
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      onToast("Միայն նկար ֆայլ", "error");
      return;
    }
    setUploading(true);
    try {
      const result = await adminUploadFile(file, projectId);
      const url = result.jpegUrl || result.url;
      if (url) {
        onChange({ exteriorImageUrl: url });
        onToast("Նկարը վերբեռնվեց");
      }
    } catch (e) {
      onToast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploading(false);
    }
  }

  function finishBand() {
    if (!selectedFloorId || draft.length < 3) return;
    updateFloor(selectedFloorId, { exteriorHotspot: draft });
    setDraft([]);
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
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "…" : labels.uploadImage}
            </button>
          </div>
        </Field>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
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
            disabled={uploading}
            onClick={() => fileRef.current?.click()}
          >
            {uploading ? "…" : labels.uploadImage}
          </button>
        </div>
      </Field>
      {exteriorUrl.trim() ? (
        <AdminImageThumb
          src={exteriorUrl}
          className="h-40 w-full max-w-sm aspect-auto sm:aspect-[4/3]"
          imgClassName="object-contain bg-white"
          removeLabel="×"
          onRemove={() => {
            onChange({
              exteriorImageUrl: "",
              floors: building.floors.map((f) => ({ ...f, exteriorHotspot: [] })),
            });
          }}
        />
      ) : null}

      {exteriorUrl.trim() ? (
        <>
          <Field label={labels.selectFloor}>
            <select
              className={adminSelectCls}
              value={selectedFloorId}
              onChange={(e) => {
                setSelectedFloorId(e.target.value);
                setDraft([]);
              }}
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
              .filter((f) => (f.exteriorHotspot?.length ?? 0) >= 3)
              .map((f) => ({
                id: f.id,
                points: f.exteriorHotspot as [number, number][],
                active: f.id === selectedFloorId,
              }))}
            draft={draft}
            drawing={Boolean(selectedFloorId)}
            onAddPoint={(pt) => setDraft((d) => [...d, pt])}
            onSelectPolygon={(id) => {
              setSelectedFloorId(id);
              setDraft([]);
            }}
            onFinishDraft={finishBand}
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
              onClick={finishBand}
              disabled={draft.length < 3 || !selectedFloorId}
            >
              {labels.finishPolygon}
            </button>
            <button
              type="button"
              className={cn(adminBtnSecondary, "h-9 text-xs")}
              onClick={() => setDraft((d) => d.slice(0, -1))}
            >
              {labels.undoPoint}
            </button>
            <button
              type="button"
              className={cn(adminBtnSecondary, "h-9 text-xs")}
              onClick={() => setDraft([])}
            >
              {labels.clearDraft}
            </button>
            {selectedFloorId ? (
              <button
                type="button"
                className="inline-flex h-9 items-center rounded-[5px] px-3 text-xs text-red-500 hover:bg-red-50"
                onClick={() => updateFloor(selectedFloorId, { exteriorHotspot: [] })}
              >
                {labels.removeBand}
              </button>
            ) : null}
          </div>
        </>
      ) : null}

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
