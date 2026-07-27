"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  DollarSign,
  Home,
  Image as ImageIcon,
  Layers,
  MapPin,
  Plus,
  Save,
  Star,
  Trash2,
  Video,
  X,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  ADMIN_BASE,
  adminBtnPrimary,
  adminBtnSecondary,
  adminCardCls,
  adminInputCls,
  adminSelectCls,
  adminTextareaCls,
} from "@/components/admin/admin-config";
import { emptyApartment, emptyProject, generateId } from "@/lib/store";
import { useProjects } from "@/lib/projects-context";
import { adminUploadFile } from "@/lib/api-client";
import { getStatusLabel } from "@/lib/i18n";
import { hyTranslations } from "@/content/hy";
import type { Apartment, ApartmentStatus, Project, ProjectStatus } from "@/types";
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

function Section({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
}) {
  return (
    <section className={cn(adminCardCls, "overflow-hidden")}>
      <div className="flex items-center gap-2 border-b border-[#F0F1F3] px-5 py-3.5">
        <Icon size={16} className="text-[#c9a96e]" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold text-[#0c1428]">{title}</h2>
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

interface Props {
  projectId?: string;
}

export function AdminProjectEditor({ projectId }: Props) {
  const { projects, addProject, updateProject, loading } = useProjects();
  const { toast } = useAdminToast();
  const router = useRouter();
  const isNew = !projectId;
  const existing = projectId ? projects.find((p) => p.id === projectId) : undefined;

  const [form, setForm] = useState<Omit<Project, "id" | "slug"> & { id?: string; slug?: string }>(() =>
    existing ? { ...existing } : { ...emptyProject() },
  );
  const [saving, setSaving] = useState(false);
  const [priceTo, setPriceTo] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [hydrated, setHydrated] = useState(isNew);
  const [uploading, setUploading] = useState(false);
  const [uploadingDrone, setUploadingDrone] = useState(false);
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const droneFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const pdfTargetAptId = useRef<string | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({ ...existing });
      setHydrated(true);
    } else if (!loading && isNew) {
      setHydrated(true);
    }
  }, [existing, loading, isNew]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const apartmentProjectId = useMemo(() => form.id ?? generateId(), [form.id]);

  if (!isNew && !loading && !existing) {
    return (
      <div className={`${adminCardCls} p-8 text-center`}>
        <p className="text-[#6B7280]">{hyTranslations.projectNotFound}</p>
        <button type="button" className={cn(adminBtnSecondary, "mt-4")} onClick={() => router.push(`${ADMIN_BASE}/projects`)}>
          ← {a.cancel}
        </button>
      </div>
    );
  }

  if (!hydrated || (loading && !isNew && !existing)) {
    return <p className="text-sm text-[#9CA3AF]">Բեռնվում է…</p>;
  }

  async function handleSave(asDraft = false) {
    setSaving(true);
    try {
      const payload = {
        ...form,
        featured: asDraft ? false : form.featured,
        droneVideos: (form.droneVideos ?? []).filter((v) => v.url.trim()),
      };
      if (isNew) {
        await addProject(payload as Omit<Project, "id" | "slug">);
        toast(a.toastPublished);
      } else if (projectId) {
        await updateProject(projectId, payload as Partial<Project>);
        toast(a.toastUpdated);
      }
      router.push(`${ADMIN_BASE}/projects`);
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setSaving(false);
    }
  }

  function updateApt(id: string, patch: Partial<Apartment>) {
    set(
      "apartments",
      form.apartments.map((apt) => (apt.id === id ? { ...apt, ...patch } : apt)),
    );
  }

  async function handleUpload(file: File) {
    if (!file.type.startsWith("image/")) {
      toast("Միայն նկարներ՝ օգտագործեք թռչող տեսանյութերի բաժինը", "error");
      return;
    }
    setUploading(true);
    try {
      const result = await adminUploadFile(file, projectId);
      set("images", [...form.images, result.url]);
      toast("Նկարը վերբեռնվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploading(false);
    }
  }

  async function handleDroneUpload(file: File) {
    if (!file.type.startsWith("video/")) {
      toast("Միայն տեսանյութեր (mp4, webm, mov)", "error");
      return;
    }
    setUploadingDrone(true);
    try {
      const result = await adminUploadFile(file, projectId);
      const videos = form.droneVideos ?? [];
      set("droneVideos", [
        ...videos,
        {
          title: file.name.replace(/\.[^.]+$/, "") || a.aerialOverview,
          url: result.url,
          thumbnail: result.posterUrl ?? undefined,
        },
      ]);
      toast("Տեսանյութը վերբեռնվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploadingDrone(false);
    }
  }

  async function handlePlanPdfUpload(file: File, aptId: string) {
    const isPdf = file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
    if (!isPdf) {
      toast("Միայն PDF ֆայլ", "error");
      return;
    }
    setUploadingPdfId(aptId);
    try {
      const result = await adminUploadFile(file, projectId);
      updateApt(aptId, { planPdfUrl: result.url });
      toast("PDF-ը վերբեռնվեց");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploadingPdfId(null);
    }
  }

  function updateDroneVideo(index: number, patch: Partial<{ title: string; url: string; thumbnail?: string }>) {
    const videos = [...(form.droneVideos ?? [])];
    const current = videos[index];
    if (!current) return;
    videos[index] = { ...current, ...patch };
    set("droneVideos", videos);
  }

  return (
    <div>
      <AdminPageHeader
        title={isNew ? a.seoNew : `${a.saveChanges}: ${form.title || "…"}`}
        breadcrumbs={[
          { label: "Վահանակ", href: ADMIN_BASE },
          { label: "Նախագծեր", href: `${ADMIN_BASE}/projects` },
          { label: isNew ? "Նոր" : "Խմբագրել" },
        ]}
        actions={
          <div className="flex flex-wrap gap-2">
            <button type="button" className={adminBtnSecondary} onClick={() => router.push(`${ADMIN_BASE}/projects`)}>
              <X size={15} /> {a.cancel}
            </button>
            <button type="button" disabled={saving} className={adminBtnSecondary} onClick={() => handleSave(true)}>
              Draft
            </button>
            <button type="button" disabled={saving} className={adminBtnPrimary} onClick={() => handleSave(false)}>
              <Save size={15} /> {isNew ? a.publishProject : a.saveChanges}
            </button>
          </div>
        }
      />

      <div className="space-y-4">
        <Section title={a.sectionCore} icon={Building2}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={a.projectTitle}>
              <input
                required
                className={adminInputCls}
                value={form.title}
                placeholder={a.projectTitlePlaceholder}
                onChange={(e) => set("title", e.target.value)}
              />
            </Field>
            <Field label="Slug">
              <input
                className={adminInputCls}
                value={form.slug ?? ""}
                placeholder="auto-from-title"
                onChange={(e) => set("slug", e.target.value)}
              />
            </Field>
            <Field label={a.developer}>
              <input className={adminInputCls} value={form.developer} onChange={(e) => set("developer", e.target.value)} />
            </Field>
            <Field label={a.city}>
              <input className={adminInputCls} value={form.city} onChange={(e) => set("city", e.target.value)} />
            </Field>
            <div className="md:col-span-2">
              <Field label={a.fullAddress}>
                <input
                  className={adminInputCls}
                  value={form.location}
                  placeholder={a.addressPlaceholder}
                  onChange={(e) => set("location", e.target.value)}
                />
              </Field>
            </div>
            <Field label={a.shortDescription}>
              <textarea
                className={adminTextareaCls}
                value={form.description}
                placeholder={a.shortDescPlaceholder}
                onChange={(e) => set("description", e.target.value)}
              />
            </Field>
            <Field label={a.longDescription}>
              <textarea
                className={adminTextareaCls}
                value={form.longDescription}
                placeholder={a.longDescPlaceholder}
                onChange={(e) => set("longDescription", e.target.value)}
              />
            </Field>
          </div>
        </Section>

        <Section title={a.sectionPricing} icon={DollarSign}>
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            <Field label={a.startingPrice}>
              <input
                type="number"
                className={adminInputCls}
                value={form.startingPrice || ""}
                onChange={(e) => set("startingPrice", +e.target.value)}
              />
            </Field>
            <Field label="Price To (AMD)">
              <input
                type="number"
                className={adminInputCls}
                value={priceTo}
                placeholder="optional"
                onChange={(e) => setPriceTo(e.target.value)}
              />
            </Field>
            <Field label={hyTranslations.filter.status}>
              <select
                className={adminSelectCls}
                value={form.status}
                onChange={(e) => set("status", e.target.value as ProjectStatus)}
              >
                <option value="Under Construction">{getStatusLabel(hyTranslations, "Under Construction")}</option>
                <option value="Ready">{getStatusLabel(hyTranslations, "Ready")}</option>
                <option value="Sold Out">{getStatusLabel(hyTranslations, "Sold Out")}</option>
              </select>
            </Field>
            <Field label={a.completionDate}>
              <input
                className={adminInputCls}
                value={form.completionDate}
                placeholder={a.completionPlaceholder}
                onChange={(e) => set("completionDate", e.target.value)}
              />
            </Field>
            <Field label={a.totalFloors}>
              <input
                type="number"
                className={adminInputCls}
                value={form.floors || ""}
                onChange={(e) => set("floors", +e.target.value)}
              />
            </Field>
            <Field label={a.availableUnits}>
              <input
                type="number"
                className={adminInputCls}
                value={form.availableApartmentsCount || ""}
                onChange={(e) => set("availableApartmentsCount", +e.target.value)}
              />
            </Field>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Google Maps Lat">
              <input
                type="number"
                step="any"
                className={adminInputCls}
                value={form.coordinates.lat}
                onChange={(e) => set("coordinates", { ...form.coordinates, lat: +e.target.value })}
              />
            </Field>
            <Field label="Google Maps Lng">
              <input
                type="number"
                step="any"
                className={adminInputCls}
                value={form.coordinates.lng}
                onChange={(e) => set("coordinates", { ...form.coordinates, lng: +e.target.value })}
              />
            </Field>
          </div>
          <label className="flex cursor-pointer items-start gap-3 rounded-[5px] border border-[#c9a96e]/40 bg-[#c9a96e]/10 px-4 py-3">
            <input
              type="checkbox"
              checked={Boolean(form.featured)}
              onChange={(e) => set("featured", e.target.checked)}
              className="mt-0.5 h-4 w-4 accent-[#c9a96e]"
            />
            <span>
              <span className="flex items-center gap-2 text-sm font-semibold text-[#0c1428]">
                <Star size={15} className="text-[#c9a96e]" />
                {a.featuredHomepage}
              </span>
              <span className="mt-1 block text-xs text-[#6B7280]">
                Միացրեք՝ նախագիծը գլխավոր էջում ցուցադրելու համար
              </span>
            </span>
          </label>
        </Section>

        <Section title={a.sectionImages} icon={ImageIcon}>
          <Field label={`${a.projectImages} (HTTPS URLs, first = cover)`}>
            <textarea
              className={adminTextareaCls}
              value={form.images.join("\n")}
              placeholder={"https://…\nhttps://…"}
              onChange={(e) =>
                set(
                  "images",
                  e.target.value
                    .split("\n")
                    .map((s) => s.trim())
                    .filter(Boolean),
                )
              }
            />
          </Field>
          <div className="flex flex-wrap items-center gap-3">
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
            <button
              type="button"
              disabled={uploading}
              className={adminBtnSecondary}
              onClick={() => fileRef.current?.click()}
            >
              {uploading ? "Վերբեռնում…" : "Վերբեռնել նկար"}
            </button>
            <p className="text-xs text-[#9CA3AF]">{a.urlHintHttps}</p>
          </div>
        </Section>

        <Section title={a.sectionDrone} icon={Video}>
          <p className="text-xs text-[#9CA3AF]">{a.droneVideosHint}</p>
          <div className="space-y-3">
            {(form.droneVideos ?? []).map((video, index) => (
              <div key={`drone-${index}`} className="space-y-3 rounded-[5px] border border-[#E8EAED] bg-[#FAFAFA] p-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                    {a.videoN.replace("{n}", String(index + 1))}
                  </p>
                  <button
                    type="button"
                    onClick={() =>
                      set(
                        "droneVideos",
                        (form.droneVideos ?? []).filter((_, i) => i !== index),
                      )
                    }
                    className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                  >
                    <Trash2 size={13} /> {a.remove}
                  </button>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                  <Field label={a.videoTitle}>
                    <input
                      className={adminInputCls}
                      value={video.title}
                      placeholder={a.aerialOverview}
                      onChange={(e) => updateDroneVideo(index, { title: e.target.value })}
                    />
                  </Field>
                  <Field label={a.youtubeEmbed}>
                    <input
                      className={adminInputCls}
                      value={video.url}
                      placeholder="https://… կամ վերբեռնված ֆայլ"
                      onChange={(e) => updateDroneVideo(index, { url: e.target.value })}
                    />
                  </Field>
                  <div className="md:col-span-2">
                    <Field label={a.thumbnailOptional}>
                      <input
                        className={adminInputCls}
                        value={video.thumbnail ?? ""}
                        placeholder="https://…"
                        onChange={(e) => updateDroneVideo(index, { thumbnail: e.target.value || undefined })}
                      />
                    </Field>
                  </div>
                </div>
              </div>
            ))}
            {(form.droneVideos ?? []).length === 0 && (
              <p className="text-sm text-[#9CA3AF]">{a.noDroneVideos}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <input
              ref={droneFileRef}
              type="file"
              accept="video/mp4,video/webm,video/quicktime"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void handleDroneUpload(file);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={() =>
                set("droneVideos", [
                  ...(form.droneVideos ?? []),
                  { title: a.aerialOverview, url: "", thumbnail: undefined },
                ])
              }
            >
              <Plus size={15} /> {a.addVideo}
            </button>
            <button
              type="button"
              disabled={uploadingDrone}
              className={adminBtnSecondary}
              onClick={() => droneFileRef.current?.click()}
            >
              {uploadingDrone ? "Վերբեռնում…" : "Վերբեռնել տեսանյութ"}
            </button>
          </div>
        </Section>

        <Section title={a.sectionAmenities} icon={Layers}>
          <div className="flex flex-wrap gap-2">
            {[
              a.amenityPool,
              a.amenityGym,
              a.amenityParking,
              a.amenitySecurity,
              a.amenityGarden,
              a.amenityRestaurant,
              a.amenityWifi,
              a.amenitySmartHome,
            ].map((label) => {
              const active = form.amenities.some((x) => x.label === label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    if (active) {
                      set(
                        "amenities",
                        form.amenities.filter((x) => x.label !== label),
                      );
                    } else {
                      set("amenities", [...form.amenities, { icon: "check", label }]);
                    }
                  }}
                  className={cn(
                    "rounded-[5px] border px-3 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "border-[#c9a96e] bg-[#c9a96e]/15 text-[#0c1428]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#0c1428]",
                  )}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="SEO" icon={MapPin}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="SEO Title">
              <input className={adminInputCls} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={form.title} />
            </Field>
            <Field label="SEO Description">
              <input className={adminInputCls} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder={form.description} />
            </Field>
          </div>
        </Section>

        <Section title={a.sectionApartments} icon={Home}>
          <div className="space-y-3">
            {form.apartments.map((apt) => (
              <div key={apt.id} className="space-y-3 rounded-[5px] border border-[#E8EAED] bg-[#FAFAFA] p-3">
                <div className="grid grid-cols-2 gap-3 md:grid-cols-6">
                  <Field label={a.floorLabel}>
                    <input
                      type="number"
                      className={adminInputCls}
                      value={apt.floor}
                      onChange={(e) => updateApt(apt.id, { floor: +e.target.value })}
                    />
                  </Field>
                  <Field label={a.roomsShort}>
                    <input
                      type="number"
                      className={adminInputCls}
                      value={apt.rooms}
                      onChange={(e) => updateApt(apt.id, { rooms: +e.target.value })}
                    />
                  </Field>
                  <Field label={a.areaSqm}>
                    <input
                      type="number"
                      className={adminInputCls}
                      value={apt.area}
                      onChange={(e) => updateApt(apt.id, { area: +e.target.value })}
                    />
                  </Field>
                  <Field label={a.priceAmd}>
                    <input
                      type="number"
                      className={adminInputCls}
                      value={apt.price}
                      onChange={(e) => updateApt(apt.id, { price: +e.target.value })}
                    />
                  </Field>
                  <Field label={hyTranslations.filter.status}>
                    <select
                      className={adminSelectCls}
                      value={apt.status}
                      onChange={(e) => updateApt(apt.id, { status: e.target.value as ApartmentStatus })}
                    >
                      <option value="Available">{getStatusLabel(hyTranslations, "Available")}</option>
                      <option value="Reserved">{getStatusLabel(hyTranslations, "Reserved")}</option>
                      <option value="Sold">{getStatusLabel(hyTranslations, "Sold")}</option>
                    </select>
                  </Field>
                  <div className="flex items-end">
                    <button
                      type="button"
                      onClick={() => set("apartments", form.apartments.filter((x) => x.id !== apt.id))}
                      className="flex h-11 w-full items-center justify-center gap-1 rounded-[5px] text-xs text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> {a.remove}
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                  <Field label="Տեսարան">
                    <input
                      className={adminInputCls}
                      value={apt.viewType}
                      onChange={(e) => updateApt(apt.id, { viewType: e.target.value })}
                    />
                  </Field>
                  <Field label="Հատակագիծ (URL)">
                    <input
                      className={adminInputCls}
                      value={apt.floorPlanImage}
                      onChange={(e) => updateApt(apt.id, { floorPlanImage: e.target.value })}
                    />
                  </Field>
                  <Field label="Պատշգամբ">
                    <label className="flex h-11 items-center gap-2 text-sm text-[#0c1428]">
                      <input
                        type="checkbox"
                        checked={Boolean(apt.balcony)}
                        onChange={(e) => updateApt(apt.id, { balcony: e.target.checked })}
                      />
                      Այո
                    </label>
                  </Field>
                </div>
                <Field label={a.unitDescription}>
                  <textarea
                    className={adminTextareaCls}
                    value={apt.description ?? ""}
                    placeholder={a.unitDescriptionPlaceholder}
                    onChange={(e) => updateApt(apt.id, { description: e.target.value })}
                  />
                </Field>
                <div className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_auto] md:items-end">
                  <Field label={a.planPdf}>
                    <input
                      className={adminInputCls}
                      value={apt.planPdfUrl ?? ""}
                      placeholder="https://… կամ վերբեռնեք PDF"
                      onChange={(e) => updateApt(apt.id, { planPdfUrl: e.target.value })}
                    />
                  </Field>
                  <button
                    type="button"
                    disabled={uploadingPdfId === apt.id}
                    className={cn(adminBtnSecondary, "h-11")}
                    onClick={() => {
                      pdfTargetAptId.current = apt.id;
                      pdfFileRef.current?.click();
                    }}
                  >
                    {uploadingPdfId === apt.id ? "Վերբեռնում…" : a.uploadPdf}
                  </button>
                </div>
                {apt.planPdfUrl ? (
                  <p className="text-xs text-[#6B7280]">
                    PDF կցված է —{" "}
                    <a href={apt.planPdfUrl} target="_blank" rel="noopener noreferrer" className="text-[#c9a96e] hover:underline">
                      բացել
                    </a>
                    {" · "}
                    <button
                      type="button"
                      className="text-red-500 hover:underline"
                      onClick={() => updateApt(apt.id, { planPdfUrl: "" })}
                    >
                      հեռացնել
                    </button>
                  </p>
                ) : null}
              </div>
            ))}
            <input
              ref={pdfFileRef}
              type="file"
              accept="application/pdf,.pdf"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const aptId = pdfTargetAptId.current;
                if (file && aptId) void handlePlanPdfUpload(file, aptId);
                e.target.value = "";
                pdfTargetAptId.current = null;
              }}
            />
            <button
              type="button"
              onClick={() => set("apartments", [...form.apartments, emptyApartment(apartmentProjectId)])}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]"
            >
              <Plus size={15} /> {a.addUnit}
            </button>
          </div>
        </Section>
      </div>
    </div>
  );
}
