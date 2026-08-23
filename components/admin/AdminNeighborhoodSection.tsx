"use client";

import { useRef, useState } from "react";
import { ChevronDown, Plus, Trash2 } from "lucide-react";
import { AdminImageGrid, AdminImageThumb } from "@/components/admin/AdminImageThumb";
import { BilingualField } from "@/components/admin/BilingualField";
import { SitePlanHotspotEditor } from "@/components/admin/SitePlanHotspotEditor";
import {
  adminBtnSecondary,
  adminInputCls,
  adminSelectCls,
} from "@/components/admin/admin-config";
import { adminUploadFile } from "@/lib/api-client";
import { getStatusLabel } from "@/lib/i18n";
import { emptyApartment, emptyLandPlot } from "@/lib/store";
import { hyTranslations } from "@/content/hy";
import { en } from "@/lib/translations-en";
import { ru } from "@/lib/translations-ru";
import type { Apartment, ApartmentStatus, LandPlot } from "@/types";
import { cn } from "@/lib/utils";

const a = hyTranslations.admin;

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

interface Props {
  projectId?: string;
  sitePlanImage: string;
  landPlots: LandPlot[];
  apartments: Apartment[];
  onSitePlanImage: (url: string) => void;
  onLandPlots: (plots: LandPlot[]) => void;
  onApartments: (apts: Apartment[]) => void;
  onToast: (message: string, type?: "success" | "error") => void;
}

export function AdminNeighborhoodSection({
  projectId,
  sitePlanImage,
  landPlots,
  apartments,
  onSitePlanImage,
  onLandPlots,
  onApartments,
  onToast,
}: Props) {
  const fileRef = useRef<HTMLInputElement>(null);
  const planFileRef = useRef<HTMLInputElement>(null);
  const galleryFileRef = useRef<HTMLInputElement>(null);
  const planTargetId = useRef<string | null>(null);
  const galleryTargetId = useRef<string | null>(null);
  const [uploadingSite, setUploadingSite] = useState(false);
  const [uploadingPlanId, setUploadingPlanId] = useState<string | null>(null);
  const [uploadingGalleryId, setUploadingGalleryId] = useState<string | null>(null);
  const [openPlotIds, setOpenPlotIds] = useState<string[]>([]);
  const [openPlanIds, setOpenPlanIds] = useState<string[]>([]);
  const [imageUrlDraft, setImageUrlDraft] = useState("");

  const projectKey = projectId ?? "new";

  function updatePlot(id: string, patch: Partial<LandPlot>) {
    onLandPlots(landPlots.map((p) => (p.id === id ? { ...p, ...patch } : p)));
  }

  function updatePlan(id: string, patch: Partial<Apartment>) {
    onApartments(apartments.map((apt) => (apt.id === id ? { ...apt, ...patch } : apt)));
  }

  function addPlot() {
    const plot = emptyLandPlot(projectKey, landPlots.length);
    onLandPlots([...landPlots, plot]);
    setOpenPlotIds((ids) => [...ids, plot.id]);
  }

  function removePlot(id: string) {
    onLandPlots(landPlots.filter((p) => p.id !== id));
    onApartments(
      apartments.map((apt) => (apt.landPlotId === id ? { ...apt, landPlotId: undefined } : apt)),
    );
  }

  function addPlan(plotId: string) {
    const plan = emptyApartment(projectKey, undefined, plotId);
    onApartments([...apartments, plan]);
    setOpenPlanIds((ids) => [...ids, plan.id]);
    setOpenPlotIds((ids) => (ids.includes(plotId) ? ids : [...ids, plotId]));
  }

  async function handleSiteUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      onToast("Միայն նկար ֆայլ", "error");
      return;
    }
    setUploadingSite(true);
    try {
      const res = await adminUploadFile(file, projectId);
      const url = res.hasAlpha ? res.url : res.jpegUrl || res.url;
      if (url) onSitePlanImage(url);
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploadingSite(false);
    }
  }

  async function handlePlanImage(file: File, aptId: string) {
    setUploadingPlanId(aptId);
    try {
      const res = await adminUploadFile(file, projectId);
      const url = res.hasAlpha ? res.url : res.jpegUrl || res.url;
      if (url) updatePlan(aptId, { floorPlanImage: url });
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploadingPlanId(null);
    }
  }

  async function handleGallery(files: FileList, aptId: string) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploadingGalleryId(aptId);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const res = await adminUploadFile(file, projectId);
        const url = res.jpegUrl || res.url;
        if (url) urls.push(url);
      }
      if (urls.length) {
        const apt = apartments.find((x) => x.id === aptId);
        updatePlan(aptId, { gallery: [...(apt?.gallery ?? []), ...urls] });
      }
    } catch (e) {
      onToast(e instanceof Error ? e.message : "Upload failed", "error");
    } finally {
      setUploadingGalleryId(null);
    }
  }

  function addSiteUrl() {
    const url = imageUrlDraft.trim();
    if (!url) return;
    onSitePlanImage(url);
    setImageUrlDraft("");
  }

  return (
    <div className="space-y-4">
      <p className="text-xs leading-relaxed text-[#57534E]">{a.neighborhoodHint}</p>

      <div className="space-y-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
          {a.sitePlanImage}
        </p>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            className={cn(adminInputCls, "flex-1")}
            value={imageUrlDraft}
            placeholder={a.addImageUrlPlaceholder}
            onChange={(e) => setImageUrlDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addSiteUrl();
              }
            }}
          />
          <div className="flex gap-2">
            <button type="button" className={adminBtnSecondary} onClick={addSiteUrl}>
              {a.addImageUrl}
            </button>
            <button
              type="button"
              disabled={uploadingSite}
              className={adminBtnSecondary}
              onClick={() => fileRef.current?.click()}
            >
              {uploadingSite ? "…" : a.uploadSitePlan}
            </button>
          </div>
        </div>
        {sitePlanImage.trim() ? (
          <AdminImageThumb
            src={sitePlanImage}
            className="h-48 w-full max-w-xl aspect-auto sm:aspect-[16/9]"
            imgClassName="object-contain bg-[#FAFAF8]"
            removeLabel={a.removeImage}
            onRemove={() => onSitePlanImage("")}
          />
        ) : null}
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleSiteUpload(file);
            e.target.value = "";
          }}
        />
      </div>

      <SitePlanHotspotEditor
        imageUrl={sitePlanImage}
        plots={landPlots}
        onChangePlot={updatePlot}
        labels={{
          selectPlot: a.selectLandPlot,
          drawHint: a.drawLandPlotHint,
          finishPolygon: a.hotspotFinish,
          undoPoint: a.hotspotUndo,
          clearDraft: a.hotspotClear,
          removeHotspot: a.hotspotRemove,
          noPlots: a.noLandPlots,
          hotspotCount: a.hotspotCount,
          emptyImage: a.sitePlanEmpty,
          zoomIn: a.hotspotZoomIn,
          zoomOut: a.hotspotZoomOut,
          zoomReset: a.hotspotZoomReset,
          panMode: a.hotspotPanMode,
          drawMode: a.hotspotDrawMode,
        }}
      />

      <div className="flex items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
          {a.landPlotsTitle}
        </p>
        <button
          type="button"
          onClick={addPlot}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]"
        >
          <Plus size={15} /> {a.addLandPlot}
        </button>
      </div>

      {landPlots.length === 0 ? (
        <p className="text-sm text-[#9CA3AF]">{a.noLandPlots}</p>
      ) : null}

      <div className="space-y-2">
        {landPlots.map((plot, index) => {
          const plans = apartments.filter((apt) => apt.landPlotId === plot.id);
          const open = openPlotIds.includes(plot.id);
          return (
            <div key={plot.id} className="overflow-hidden rounded-[5px] border border-[#E8EAED] bg-[#FAFAFA]">
              <button
                type="button"
                onClick={() =>
                  setOpenPlotIds((ids) =>
                    ids.includes(plot.id) ? ids.filter((x) => x !== plot.id) : [...ids, plot.id],
                  )
                }
                className="flex w-full items-center gap-3 px-3 py-3 text-left hover:bg-[#F3F0EA]"
              >
                <ChevronDown
                  size={16}
                  className={cn(
                    "shrink-0 text-[#9CA3AF] transition-transform",
                    open ? "rotate-0" : "-rotate-90",
                  )}
                />
                <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0c1428]">
                  {plot.label.trim() || a.unnamedLandPlot}
                </span>
                <span className="text-xs tabular-nums text-[#9CA3AF]">
                  {a.plotPlansCount.replace("{count}", String(plans.length))}
                  {plot.points.length >= 3 ? ` · ${a.plotMarked}` : ` · ${a.plotUnmarked}`}
                </span>
              </button>
              {open ? (
                <div className="space-y-4 border-t border-[#E8EAED] p-3">
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                    <Field label={a.landPlotLabel}>
                      <input
                        className={adminInputCls}
                        value={plot.label}
                        placeholder={a.landPlotLabelPlaceholder}
                        onChange={(e) => updatePlot(plot.id, { label: e.target.value, sortOrder: index })}
                      />
                    </Field>
                    <Field label={a.landAreaSqm}>
                      <input
                        type="number"
                        className={adminInputCls}
                        value={plot.area ?? 0}
                        onChange={(e) => updatePlot(plot.id, { area: +e.target.value })}
                      />
                    </Field>
                    <Field label={a.neighborhoodPrice}>
                      <input
                        type="number"
                        className={adminInputCls}
                        value={plot.price ?? 0}
                        onChange={(e) => updatePlot(plot.id, { price: +e.target.value })}
                      />
                    </Field>
                    <Field label={hyTranslations.filter.status}>
                      <select
                        className={adminSelectCls}
                        value={plot.status}
                        onChange={(e) =>
                          updatePlot(plot.id, { status: e.target.value as ApartmentStatus })
                        }
                      >
                        <option value="Available">{getStatusLabel(hyTranslations, "Available")}</option>
                        <option value="Reserved">{getStatusLabel(hyTranslations, "Reserved")}</option>
                        <option value="Sold">{getStatusLabel(hyTranslations, "Sold")}</option>
                      </select>
                    </Field>
                  </div>
                  <button
                    type="button"
                    onClick={() => removePlot(plot.id)}
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:bg-red-50"
                  >
                    <Trash2 size={14} /> {a.removeLandPlot}
                  </button>

                  <div className="space-y-2 border-t border-[#E8EAED] pt-3">
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                        {a.plotPlansTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => addPlan(plot.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]"
                      >
                        <Plus size={15} /> {a.addPlotPlan}
                      </button>
                    </div>
                    {plans.length === 0 ? (
                      <p className="text-xs text-[#9CA3AF]">{a.noPlotPlans}</p>
                    ) : null}
                    {plans.map((plan) => {
                      const planOpen = openPlanIds.includes(plan.id);
                      return (
                        <div key={plan.id} className="overflow-hidden rounded-[5px] border border-[#E8EAED] bg-white">
                          <button
                            type="button"
                            onClick={() =>
                              setOpenPlanIds((ids) =>
                                ids.includes(plan.id)
                                  ? ids.filter((x) => x !== plan.id)
                                  : [...ids, plan.id],
                              )
                            }
                            className="flex w-full items-center gap-3 px-3 py-2.5 text-left hover:bg-[#F8F6F1]"
                          >
                            <ChevronDown
                              size={14}
                              className={cn(
                                "shrink-0 text-[#9CA3AF] transition-transform",
                                planOpen ? "rotate-0" : "-rotate-90",
                              )}
                            />
                            <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0c1428]">
                              {plan.apartmentNumber?.trim() || a.unnamedHouse}
                            </span>
                          </button>
                          {planOpen ? (
                            <div className="space-y-3 border-t border-[#E8EAED] p-3">
                              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                                <Field label={a.plotPlanName}>
                                  <input
                                    className={adminInputCls}
                                    value={plan.apartmentNumber ?? ""}
                                    placeholder={a.plotPlanNamePlaceholder}
                                    onChange={(e) =>
                                      updatePlan(plan.id, { apartmentNumber: e.target.value })
                                    }
                                  />
                                </Field>
                                <Field label={a.roomsShort}>
                                  <input
                                    type="number"
                                    className={adminInputCls}
                                    value={plan.rooms}
                                    onChange={(e) => updatePlan(plan.id, { rooms: +e.target.value })}
                                  />
                                </Field>
                                <Field label={a.areaSqm}>
                                  <input
                                    type="number"
                                    className={adminInputCls}
                                    value={plan.area}
                                    onChange={(e) => updatePlan(plan.id, { area: +e.target.value })}
                                  />
                                </Field>
                                <Field label={a.priceAmd}>
                                  <input
                                    type="number"
                                    className={adminInputCls}
                                    value={plan.price}
                                    onChange={(e) => updatePlan(plan.id, { price: +e.target.value })}
                                  />
                                </Field>
                              </div>
                              <BilingualField
                                label={a.unitDescription}
                                hy={plan.descriptionHy ?? ""}
                                ru={plan.descriptionRu ?? ""}
                                en={plan.description ?? ""}
                                onHy={(v) => updatePlan(plan.id, { descriptionHy: v })}
                                onRu={(v) => updatePlan(plan.id, { descriptionRu: v })}
                                onEn={(v) => updatePlan(plan.id, { description: v })}
                                placeholderHy={a.plotPlanDescPlaceholder}
                                placeholderRu={ru.admin.plotPlanDescPlaceholder}
                                placeholderEn={en.admin.plotPlanDescPlaceholder}
                                copyHyLabel={a.copyFromOther}
                                copyRuLabel={a.copyFromOther}
                                copyEnLabel={a.copyFromOther}
                                multiline
                              />
                              <Field label={a.floorPlanUrl}>
                                <div className="flex gap-2">
                                  <input
                                    className={cn(adminInputCls, "flex-1")}
                                    value={plan.floorPlanImage}
                                    placeholder={a.floorPlanUrlPlaceholder}
                                    onChange={(e) =>
                                      updatePlan(plan.id, { floorPlanImage: e.target.value })
                                    }
                                  />
                                  <button
                                    type="button"
                                    disabled={uploadingPlanId === plan.id}
                                    className={adminBtnSecondary}
                                    onClick={() => {
                                      planTargetId.current = plan.id;
                                      planFileRef.current?.click();
                                    }}
                                  >
                                    {uploadingPlanId === plan.id ? "…" : a.uploadImages}
                                  </button>
                                </div>
                              </Field>
                              {plan.floorPlanImage.trim() ? (
                                <AdminImageThumb
                                  src={plan.floorPlanImage}
                                  className="aspect-[4/3] max-w-xs"
                                  imgClassName="object-contain bg-[#FAFAF8]"
                                  removeLabel={a.removeImage}
                                  onRemove={() => updatePlan(plan.id, { floorPlanImage: "" })}
                                />
                              ) : null}
                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <p className="text-sm font-semibold text-[#0c1428]">
                                    {a.galleryImages}
                                  </p>
                                  <button
                                    type="button"
                                    disabled={uploadingGalleryId === plan.id}
                                    className={cn(adminBtnSecondary, "h-9 text-xs")}
                                    onClick={() => {
                                      galleryTargetId.current = plan.id;
                                      galleryFileRef.current?.click();
                                    }}
                                  >
                                    <Plus size={14} />
                                    {uploadingGalleryId === plan.id ? "…" : a.uploadImages}
                                  </button>
                                </div>
                                <AdminImageGrid
                                  urls={plan.gallery ?? []}
                                  onRemove={(i) =>
                                    updatePlan(plan.id, {
                                      gallery: (plan.gallery ?? []).filter((_, idx) => idx !== i),
                                    })
                                  }
                                  emptyLabel={a.aptGalleryEmpty}
                                  removeLabel={a.removeImage}
                                  className="sm:grid-cols-3"
                                />
                              </div>
                              <button
                                type="button"
                                onClick={() =>
                                  onApartments(apartments.filter((x) => x.id !== plan.id))
                                }
                                className="inline-flex items-center gap-1 text-xs text-red-500"
                              >
                                <Trash2 size={14} /> {a.remove}
                              </button>
                            </div>
                          ) : null}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <input
        ref={planFileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          const id = planTargetId.current;
          if (file && id) void handlePlanImage(file, id);
          e.target.value = "";
          planTargetId.current = null;
        }}
      />
      <input
        ref={galleryFileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => {
          const files = e.target.files;
          const id = galleryTargetId.current;
          if (files?.length && id) void handleGallery(files, id);
          e.target.value = "";
          galleryTargetId.current = null;
        }}
      />
    </div>
  );
}
