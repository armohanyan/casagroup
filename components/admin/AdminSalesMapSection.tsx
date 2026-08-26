"use client";

import { useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { AdminImageThumb } from "@/components/admin/AdminImageThumb";
import { BilingualField } from "@/components/admin/BilingualField";
import { PlanHotspotCanvas } from "@/components/admin/PlanHotspotCanvas";
import { useAdminImagePicker } from "@/components/admin/useAdminImagePicker";
import {
  adminBtnSecondary,
  adminInputCls,
  adminSelectCls,
} from "@/components/admin/admin-config";
import { emptyMapStage, generateId } from "@/lib/store";
import type { Building, MapStageHotspot, ProjectMapStage } from "@/types";
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

export type SalesMapLabels = {
  sectionTitle: string;
  addRootStage: string;
  addChildStage: string;
  stageLabel: string;
  stageImage: string;
  uploadImage: string;
  removeStage: string;
  hotspots: string;
  hotspotLabel: string;
  targetType: string;
  targetStage: string;
  targetBuilding: string;
  selectTarget: string;
  finishPolygon: string;
  undoPoint: string;
  clearDraft: string;
  removeHotspot: string;
  drawHint: string;
  noStages: string;
  noBuildings: string;
  multiRootWarning: string;
  zoomIn: string;
  zoomOut: string;
  zoomReset: string;
  panMode: string;
  drawMode: string;
};

type HotspotMeta = { label: string; targetType: "stage" | "building"; targetId: string };

interface Props {
  projectId?: string;
  mapStages: ProjectMapStage[];
  buildings: Building[];
  onChange: (
    stages: ProjectMapStage[] | ((prev: ProjectMapStage[]) => ProjectMapStage[]),
  ) => void;
  onPersistZone?: () => Promise<boolean>;
  onToast: (message: string, type?: "success" | "error" | "info") => void;
  labels: SalesMapLabels;
}

function centroid(points: [number, number][]): { x: number; y: number } {
  if (!points.length) return { x: 50, y: 50 };
  const sx = points.reduce((s, p) => s + p[0], 0);
  const sy = points.reduce((s, p) => s + p[1], 0);
  return { x: sx / points.length, y: sy / points.length };
}

function StageCard({
  stage,
  depth,
  mapStages,
  buildings,
  open,
  draft,
  meta,
  uploading,
  labels,
  onToggle,
  onUpdate,
  onRemove,
  onAddChild,
  onDraftChange,
  onMetaChange,
  onFinishHotspot,
  onRemoveHotspot,
  onUploadClick,
  onEditClick,
  persisting,
}: {
  stage: ProjectMapStage;
  depth: number;
  mapStages: ProjectMapStage[];
  buildings: Building[];
  open: boolean;
  draft: [number, number][];
  meta: HotspotMeta;
  uploading: boolean;
  labels: SalesMapLabels;
  onToggle: () => void;
  onUpdate: (patch: Partial<ProjectMapStage>) => void;
  onRemove: () => void;
  onAddChild: () => void;
  onDraftChange: (draft: [number, number][]) => void;
  onMetaChange: (meta: HotspotMeta) => void;
  onFinishHotspot: () => void;
  onRemoveHotspot: (id: string) => void;
  onUploadClick: () => void;
  onEditClick?: () => void;
  persisting?: boolean;
}) {
  const childStages = mapStages
    .filter((s) => s.parentId === stage.id)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

  return (
    <div
      className={cn(
        "rounded-[5px] border border-[#E8EAED] bg-white",
        depth > 0 && "ml-3 border-l-2 border-l-[#c9a96e]/40",
      )}
    >
      <button
        type="button"
        className="flex w-full items-center gap-2 px-4 py-3 text-left"
        onClick={onToggle}
      >
        <ChevronDown
          size={16}
          className={cn("shrink-0 text-[#9CA3AF] transition-transform", open && "rotate-180")}
        />
        <span className="flex-1 text-sm font-semibold text-[#0c1428]">
          {stage.label.trim() || `Stage ${stage.sortOrder + 1}`}
        </span>
        <span className="text-[11px] text-[#9CA3AF]">{stage.hotspots.length} HS</span>
      </button>
      {open ? (
        <div className="space-y-4 border-t border-[#F0F1F3] p-4">
          <BilingualField
            label={labels.stageLabel}
            hy={stage.labelHy ?? ""}
            ru={stage.labelRu ?? ""}
            en={stage.label}
            onHy={(v) => onUpdate({ labelHy: v })}
            onRu={(v) => onUpdate({ labelRu: v })}
            onEn={(v) => onUpdate({ label: v })}
            placeholderHy=""
            placeholderRu=""
            placeholderEn=""
            copyHyLabel="←"
            copyRuLabel="←"
            copyEnLabel="←"
          />
          <Field label={labels.stageImage}>
            <div className="flex flex-wrap gap-2">
              <input
                className={cn(adminInputCls, "flex-1")}
                value={stage.imageUrl}
                onChange={(e) => onUpdate({ imageUrl: e.target.value })}
              />
              <button
                type="button"
                className={cn(adminBtnSecondary, "h-11")}
                disabled={uploading}
                onClick={onUploadClick}
              >
                {uploading ? "…" : labels.uploadImage}
              </button>
            </div>
          </Field>
          {stage.imageUrl.trim() ? (
            <AdminImageThumb
              src={stage.imageUrl}
              className="h-40 w-full max-w-sm aspect-auto sm:aspect-[4/3]"
              imgClassName="object-contain bg-[#FAFAF8]"
              removeLabel="×"
              editLabel="Խմբագրել"
              onEdit={onEditClick}
              onRemove={() => onUpdate({ imageUrl: "", hotspots: [] })}
            />
          ) : null}

          {stage.imageUrl.trim() ? (
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#9CA3AF]">
                {labels.hotspots}
              </p>
              <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                <Field label={labels.hotspotLabel}>
                  <input
                    className={adminInputCls}
                    value={meta.label}
                    onChange={(e) => onMetaChange({ ...meta, label: e.target.value })}
                  />
                </Field>
                <Field label={labels.targetType}>
                  <select
                    className={adminSelectCls}
                    value={meta.targetType}
                    onChange={(e) => {
                      const targetType = e.target.value as "stage" | "building";
                      onMetaChange({
                        ...meta,
                        targetType,
                        targetId:
                          targetType === "building"
                            ? buildings[0]?.id ?? ""
                            : childStages[0]?.id ??
                              mapStages.find((s) => s.id !== stage.id)?.id ??
                              "",
                      });
                    }}
                  >
                    <option value="building">{labels.targetBuilding}</option>
                    <option value="stage">{labels.targetStage}</option>
                  </select>
                </Field>
                <Field label={labels.selectTarget}>
                  <select
                    className={adminSelectCls}
                    value={meta.targetId}
                    onChange={(e) => onMetaChange({ ...meta, targetId: e.target.value })}
                  >
                    {meta.targetType === "building" ? (
                      buildings.filter((b) => b.name.trim()).length === 0 ? (
                        <option value="">{labels.noBuildings}</option>
                      ) : (
                        buildings
                          .filter((b) => b.name.trim())
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))
                      )
                    ) : mapStages.filter((s) => s.id !== stage.id).length === 0 ? (
                      <option value="">{labels.noStages}</option>
                    ) : (
                      mapStages
                        .filter((s) => s.id !== stage.id)
                        .map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.label || s.id}
                          </option>
                        ))
                    )}
                  </select>
                </Field>
              </div>
              <p className="text-xs text-[#6B7280]">{labels.drawHint}</p>
              <PlanHotspotCanvas
                imageUrl={stage.imageUrl}
                polygons={stage.hotspots.map((h) => ({
                  id: h.id,
                  points: h.points,
                  active: false,
                }))}
                draft={draft}
                drawing
                onAddPoint={(pt) => onDraftChange([...draft, pt])}
                onMovePoint={(index, pt) =>
                  onDraftChange(draft.map((p, i) => (i === index ? pt : p)))
                }
                onSelectPolygon={onRemoveHotspot}
                onFinishDraft={onFinishHotspot}
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
                  onClick={onFinishHotspot}
                  disabled={draft.length < 3 || !meta.targetId || persisting}
                >
                  {persisting ? "…" : labels.finishPolygon}
                </button>
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-9 text-xs")}
                  onClick={() => onDraftChange(draft.slice(0, -1))}
                >
                  {labels.undoPoint}
                </button>
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-9 text-xs")}
                  onClick={() => onDraftChange([])}
                >
                  {labels.clearDraft}
                </button>
              </div>
              {stage.hotspots.length > 0 ? (
                <ul className="space-y-1 text-xs text-[#6B7280]">
                  {stage.hotspots.map((h) => (
                    <li key={h.id} className="flex items-center justify-between gap-2">
                      <span>
                        {h.label || "—"} → {h.targetType}:{h.targetId.slice(0, 8)}
                      </span>
                      <button
                        type="button"
                        className="text-red-500 hover:underline"
                        onClick={() => onRemoveHotspot(h.id)}
                      >
                        {labels.removeHotspot}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : null}
            </div>
          ) : null}

          <div className="flex flex-wrap gap-2">
            <button type="button" className={cn(adminBtnSecondary, "h-9 text-xs")} onClick={onAddChild}>
              <Plus size={14} /> {labels.addChildStage}
            </button>
            <button
              type="button"
              className="inline-flex h-9 items-center gap-1 rounded-[5px] px-3 text-xs text-red-500 hover:bg-red-50"
              onClick={onRemove}
            >
              <Trash2 size={14} /> {labels.removeStage}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function AdminSalesMapSection({
  projectId,
  mapStages,
  buildings,
  onChange,
  onPersistZone,
  onToast,
  labels,
}: Props) {
  const imagePicker = useAdminImagePicker(undefined, (msg) => onToast(msg, "error"));
  const [openIds, setOpenIds] = useState<string[]>([]);
  const [draftByStage, setDraftByStage] = useState<Record<string, [number, number][]>>({});
  const [hotspotDraft, setHotspotDraft] = useState<Record<string, HotspotMeta>>({});
  const [persistingStageId, setPersistingStageId] = useState<string | null>(null);

  const projectKey = projectId ?? "new";
  const roots = [...mapStages]
    .filter((s) => !s.parentId)
    .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

  function updateStage(id: string, patch: Partial<ProjectMapStage>) {
    onChange((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addRoot() {
    const stage = emptyMapStage(projectKey, null, mapStages.length);
    onChange((prev) => [...prev, { ...stage, sortOrder: prev.length }]);
    setOpenIds((ids) => [...ids, stage.id]);
  }

  function addChild(parentId: string) {
    const stage = emptyMapStage(projectKey, parentId, mapStages.length);
    onChange((prev) => [...prev, { ...stage, sortOrder: prev.length }]);
    setOpenIds((ids) => [...ids, stage.id, parentId]);
  }

  function removeStage(id: string) {
    onChange((prev) => {
      const removeIds = new Set<string>();
      const walk = (sid: string) => {
        removeIds.add(sid);
        prev.filter((s) => s.parentId === sid).forEach((c) => walk(c.id));
      };
      walk(id);
      return prev
        .filter((s) => !removeIds.has(s.id))
        .map((s) => ({
          ...s,
          hotspots: s.hotspots.filter(
            (h) => !(h.targetType === "stage" && removeIds.has(h.targetId)),
          ),
        }));
    });
  }

  function uploadStageImage(stageId: string) {
    imagePicker.pickAndUpload({
      projectId,
      onUploaded: ({ url }) => {
        if (!url) return;
        updateStage(stageId, { imageUrl: url });
        onToast("Նկարը վերբեռնվեց");
      },
    });
  }

  function editStageImage(stageId: string, src: string) {
    void imagePicker.editExisting({
      src,
      projectId,
      onUploaded: ({ url }) => {
        if (!url) return;
        updateStage(stageId, { imageUrl: url });
        onToast("Նկարը թարմացվեց");
      },
    });
  }

  async function finishHotspot(stageId: string) {
    const draft = draftByStage[stageId] ?? [];
    const meta = hotspotDraft[stageId] ?? {
      label: "",
      targetType: "building" as const,
      targetId: buildings[0]?.id ?? "",
    };
    if (draft.length < 3) {
      onToast("Առնվազն 3 կետ է պետք գոտին ավարտելու համար", "error");
      return;
    }
    if (!meta.targetId) {
      onToast("Ընտրեք թիրախ շենքը կամ փուլը", "error");
      return;
    }
    const c = centroid(draft);
    const buildingName =
      meta.targetType === "building"
        ? buildings.find((b) => b.id === meta.targetId)?.name.trim()
        : "";
    const stageName =
      meta.targetType === "stage"
        ? mapStages.find((s) => s.id === meta.targetId)?.label.trim()
        : "";
    const hotspot: MapStageHotspot = {
      id: generateId(),
      label: meta.label.trim() || buildingName || stageName || meta.targetId.slice(0, 4),
      points: draft,
      markerX: c.x,
      markerY: c.y,
      targetType: meta.targetType,
      targetId: meta.targetId,
    };
    // Remarking the same target replaces the previous zone instead of stacking duplicates.
    onChange((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? {
              ...s,
              hotspots: [
                ...s.hotspots.filter(
                  (h) => !(h.targetType === meta.targetType && h.targetId === meta.targetId),
                ),
                hotspot,
              ],
            }
          : s,
      ),
    );
    setDraftByStage((d) => ({ ...d, [stageId]: [] }));

    if (!onPersistZone) {
      onToast("Գոտին նշվեց — պահպանեք նախագիծը", "info");
      return;
    }
    setPersistingStageId(stageId);
    try {
      const ok = await onPersistZone();
      if (!ok) setDraftByStage((d) => ({ ...d, [stageId]: draft }));
    } finally {
      setPersistingStageId(null);
    }
  }

  function removeHotspot(stageId: string, hotspotId: string) {
    onChange((prev) =>
      prev.map((s) =>
        s.id === stageId
          ? { ...s, hotspots: s.hotspots.filter((h) => h.id !== hotspotId) }
          : s,
      ),
    );
  }

  function renderStage(stage: ProjectMapStage, depth: number): React.ReactNode {
    const open = openIds.includes(stage.id);
    const draft = draftByStage[stage.id] ?? [];
    const meta = hotspotDraft[stage.id] ?? {
      label: "",
      targetType: "building" as const,
      targetId: buildings[0]?.id ?? "",
    };
    const childStages = mapStages
      .filter((s) => s.parentId === stage.id)
      .sort((a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label));

    return (
      <div key={stage.id} className="space-y-3">
        <StageCard
          stage={stage}
          depth={depth}
          mapStages={mapStages}
          buildings={buildings}
          open={open}
          draft={draft}
          meta={meta}
          uploading={imagePicker.busy}
          labels={labels}
          onToggle={() =>
            setOpenIds((ids) =>
              ids.includes(stage.id) ? ids.filter((x) => x !== stage.id) : [...ids, stage.id],
            )
          }
          onUpdate={(patch) => updateStage(stage.id, patch)}
          onRemove={() => removeStage(stage.id)}
          onAddChild={() => addChild(stage.id)}
          onDraftChange={(d) => setDraftByStage((prev) => ({ ...prev, [stage.id]: d }))}
          onMetaChange={(m) => setHotspotDraft((prev) => ({ ...prev, [stage.id]: m }))}
          onFinishHotspot={() => void finishHotspot(stage.id)}
          onRemoveHotspot={(id) => removeHotspot(stage.id, id)}
          onUploadClick={() => uploadStageImage(stage.id)}
          persisting={persistingStageId === stage.id}
          onEditClick={
            stage.imageUrl.trim()
              ? () => editStageImage(stage.id, stage.imageUrl)
              : undefined
          }
        />
        {open ? childStages.map((child) => renderStage(child, depth + 1)) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-[#6B7280]">{labels.sectionTitle}</p>
        {roots.length === 0 ? (
          <button type="button" className={cn(adminBtnSecondary, "h-9 text-xs")} onClick={addRoot}>
            <Plus size={14} /> {labels.addRootStage}
          </button>
        ) : null}
      </div>
      {roots.length > 1 ? (
        <p className="rounded-[5px] border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
          {labels.multiRootWarning}
        </p>
      ) : null}
      {roots.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">{labels.noStages}</p>
      ) : (
        roots.map((stage) => renderStage(stage, 0))
      )}
      {imagePicker.ui}
    </div>
  );
}
