"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
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
import { FloorHotspotEditor } from "@/components/admin/FloorHotspotEditor";
import { AdminImageGrid, AdminImageThumb } from "@/components/admin/AdminImageThumb";
import { emptyApartment, emptyBuilding, emptyBuildingFloor, emptyProject, generateId } from "@/lib/store";
import { useProjects } from "@/lib/projects-context";
import { adminUploadFile } from "@/lib/api-client";
import { getStatusLabel } from "@/lib/i18n";
import { hyTranslations } from "@/content/hy";
import type { Apartment, ApartmentStatus, Building, BuildingFloor, Project, ProjectStatus } from "@/types";
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
  actions,
}: {
  title: string;
  icon: React.ElementType;
  children: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <section className={cn(adminCardCls, "overflow-hidden")}>
      <div className="flex flex-wrap items-center gap-2 border-b border-[#F0F1F3] px-5 py-3.5">
        <Icon size={16} className="text-[#c9a96e]" strokeWidth={1.75} />
        <h2 className="text-sm font-semibold text-[#0c1428]">{title}</h2>
        {actions ? <div className="ml-auto flex flex-wrap items-center gap-2">{actions}</div> : null}
      </div>
      <div className="space-y-4 p-5">{children}</div>
    </section>
  );
}

function AccordionItem({
  open,
  onToggle,
  title,
  meta,
  children,
}: {
  open: boolean;
  onToggle: () => void;
  title: string;
  meta?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[5px] border border-[#E8EAED] bg-[#FAFAFA]">
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-3 py-3 text-left transition-colors hover:bg-[#F3F0EA]"
      >
        <ChevronDown
          size={16}
          className={cn(
            "shrink-0 text-[#9CA3AF] transition-transform duration-200",
            open ? "rotate-0" : "-rotate-90",
          )}
        />
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-[#0c1428]">{title}</span>
        {meta ? <span className="shrink-0 text-xs tabular-nums text-[#9CA3AF]">{meta}</span> : null}
      </button>
      {open ? <div className="space-y-4 border-t border-[#E8EAED] p-3">{children}</div> : null}
    </div>
  );
}

function AdminModal({
  open,
  title,
  onClose,
  children,
  footer,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  if (!open) return null;
  return (
    <div
      className="fixed inset-0 z-[200] flex items-end justify-center bg-[#0c1428]/45 p-4 backdrop-blur-sm sm:items-center"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={cn(adminCardCls, "w-full max-w-lg p-5 sm:p-6")}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <h3 className="text-lg font-semibold text-[#0c1428]">{title}</h3>
          <button
            type="button"
            onClick={onClose}
            className="inline-flex h-8 w-8 items-center justify-center rounded-[5px] text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0c1428]"
            aria-label={a.cancel}
          >
            <X size={16} />
          </button>
        </div>
        <div className="space-y-4">{children}</div>
        <div className="mt-6 flex flex-wrap justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

type AptCreateDraft = {
  apartmentNumber: string;
  buildingId: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: ApartmentStatus;
};

function emptyAptCreateDraft(buildingId = ""): AptCreateDraft {
  return {
    apartmentNumber: "",
    buildingId,
    floor: 1,
    rooms: 2,
    area: 80,
    price: 150000,
    status: "Available",
  };
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
  const [uploadingFloorId, setUploadingFloorId] = useState<string | null>(null);
  const [uploadingAptPlanId, setUploadingAptPlanId] = useState<string | null>(null);
  const [uploadingAptGalleryId, setUploadingAptGalleryId] = useState<string | null>(null);
  const [amenityDraft, setAmenityDraft] = useState("");
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [openBuildingIds, setOpenBuildingIds] = useState<string[]>([]);
  const [openAptIds, setOpenAptIds] = useState<string[]>([]);
  const [openFloorIds, setOpenFloorIds] = useState<string[]>([]);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [buildingNameDraft, setBuildingNameDraft] = useState("");
  const [floorModalBuildingId, setFloorModalBuildingId] = useState<string | null>(null);
  const [floorLabelDraft, setFloorLabelDraft] = useState("");
  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [aptCreateDraft, setAptCreateDraft] = useState<AptCreateDraft>(() => emptyAptCreateDraft());
  const fileRef = useRef<HTMLInputElement>(null);
  const droneFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const floorImageRef = useRef<HTMLInputElement>(null);
  const aptPlanFileRef = useRef<HTMLInputElement>(null);
  const aptGalleryFileRef = useRef<HTMLInputElement>(null);
  const pdfTargetAptId = useRef<string | null>(null);
  const aptPlanTargetAptId = useRef<string | null>(null);
  const aptGalleryTargetAptId = useRef<string | null>(null);
  const floorImageTarget = useRef<{ buildingId: string; floorId: string } | null>(null);

  useEffect(() => {
    if (existing) {
      setForm({
        ...existing,
        buildings: (existing.buildings ?? []).map((b) => ({ ...b, floors: b.floors ?? [] })),
        apartments: existing.apartments ?? [],
      });
      setHydrated(true);
    } else if (!loading && isNew) {
      setHydrated(true);
    }
  }, [existing, loading, isNew]);

  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const apartmentProjectId = useMemo(() => form.id ?? generateId(), [form.id]);
  const buildings = form.buildings ?? [];
  const amenityPresets = [
    a.amenityPool,
    a.amenityGym,
    a.amenityParking,
    a.amenitySecurity,
    a.amenityGarden,
    a.amenityRestaurant,
    a.amenityWifi,
    a.amenitySmartHome,
  ];
  const customAmenities = form.amenities.filter((x) => !amenityPresets.includes(x.label));

  function toggleAmenity(label: string) {
    if (form.amenities.some((x) => x.label === label)) {
      set(
        "amenities",
        form.amenities.filter((x) => x.label !== label),
      );
    } else {
      set("amenities", [...form.amenities, { icon: "check", label }]);
    }
  }

  function addCustomAmenity() {
    const label = amenityDraft.trim();
    if (!label) return;
    if (form.amenities.some((x) => x.label.toLowerCase() === label.toLowerCase())) {
      setAmenityDraft("");
      return;
    }
    set("amenities", [...form.amenities, { icon: "check", label }]);
    setAmenityDraft("");
  }

  function removeAmenity(label: string) {
    set(
      "amenities",
      form.amenities.filter((x) => x.label !== label),
    );
  }

  function updateBuilding(id: string, patch: Partial<Building>) {
    set(
      "buildings",
      buildings.map((b) => (b.id === id ? { ...b, ...patch } : b)),
    );
  }

  function updateBuildingFloor(buildingId: string, floorId: string, patch: Partial<BuildingFloor>) {
    set(
      "buildings",
      buildings.map((b) =>
        b.id === buildingId
          ? {
              ...b,
              floors: (b.floors ?? []).map((f) => (f.id === floorId ? { ...f, ...patch } : f)),
            }
          : b,
      ),
    );
  }

  function removeBuilding(id: string) {
    set(
      "buildings",
      buildings.filter((b) => b.id !== id),
    );
    set(
      "apartments",
      form.apartments.map((apt) => (apt.buildingId === id ? { ...apt, buildingId: undefined } : apt)),
    );
    setOpenBuildingIds((ids) => ids.filter((x) => x !== id));
  }

  function toggleId(ids: string[], id: string) {
    return ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id];
  }

  function openCreateBuildingModal() {
    setBuildingNameDraft("");
    setBuildingModalOpen(true);
  }

  function createBuildingFromModal() {
    const building = emptyBuilding(apartmentProjectId, buildings.length);
    building.name = buildingNameDraft.trim();
    set("buildings", [...buildings, building]);
    setOpenBuildingIds((ids) => [...ids, building.id]);
    setBuildingModalOpen(false);
    setBuildingNameDraft("");
  }

  function openCreateFloorModal(buildingId: string) {
    const building = buildings.find((b) => b.id === buildingId);
    const nextIndex = building?.floors?.length ?? 0;
    setFloorLabelDraft(String(nextIndex + 1));
    setFloorModalBuildingId(buildingId);
  }

  function createFloorFromModal() {
    if (!floorModalBuildingId) return;
    const building = buildings.find((b) => b.id === floorModalBuildingId);
    const floors = building?.floors ?? [];
    const floor = emptyBuildingFloor(floorModalBuildingId, floors.length);
    floor.label = floorLabelDraft.trim() || floor.label;
    updateBuilding(floorModalBuildingId, { floors: [...floors, floor] });
    setOpenFloorIds((ids) => [...ids, floor.id]);
    setOpenBuildingIds((ids) => (ids.includes(floorModalBuildingId) ? ids : [...ids, floorModalBuildingId]));
    setFloorModalBuildingId(null);
    setFloorLabelDraft("");
  }

  function openCreateAptModal() {
    setAptCreateDraft(emptyAptCreateDraft(buildings[0]?.id ?? ""));
    setAptModalOpen(true);
  }

  function createAptFromModal() {
    const apt = emptyApartment(apartmentProjectId, aptCreateDraft.buildingId || undefined);
    apt.apartmentNumber = aptCreateDraft.apartmentNumber.trim();
    apt.floor = aptCreateDraft.floor;
    apt.rooms = aptCreateDraft.rooms;
    apt.area = aptCreateDraft.area;
    apt.price = aptCreateDraft.price;
    apt.status = aptCreateDraft.status;
    set("apartments", [...form.apartments, apt]);
    setOpenAptIds((ids) => [...ids, apt.id]);
    setAptModalOpen(false);
    setAptCreateDraft(emptyAptCreateDraft());
  }

  async function handleFloorImageUpload(file: File, buildingId: string, floorId: string) {
    setUploadingFloorId(floorId);
    try {
      const res = await adminUploadFile(file, form.id);
      const url = res.jpegUrl || res.url;
      if (url) updateBuildingFloor(buildingId, floorId, { imageUrl: url });
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploadingFloorId(null);
    }
  }

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
      const cleanedBuildings = (form.buildings ?? [])
        .map((b, i) => ({
          ...b,
          name: b.name.trim(),
          sortOrder: i,
          floors: (b.floors ?? []).map((f, fi) => ({
            ...f,
            label: f.label.trim() || String(fi + 1),
            sortOrder: fi,
            imageUrl: f.imageUrl.trim(),
            hotspots: f.hotspots ?? [],
          })),
        }))
        .filter((b) => b.name.length > 0);
      const buildingIds = new Set(cleanedBuildings.map((b) => b.id));
      const cleanedApartments = form.apartments.map((apt) => ({
        ...apt,
        buildingId: apt.buildingId && buildingIds.has(apt.buildingId) ? apt.buildingId : undefined,
      }));
      const payload = {
        ...form,
        buildings: cleanedBuildings,
        apartments: cleanedApartments,
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

  async function handleUpload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast("Միայն նկարներ՝ օգտագործեք թռչող տեսանյութերի բաժինը", "error");
      return;
    }
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const result = await adminUploadFile(file, projectId);
        const url = result.jpegUrl || result.url;
        if (url) urls.push(url);
      }
      if (urls.length) {
        set("images", [...form.images, ...urls]);
        toast(urls.length === 1 ? "Նկարը վերբեռնվեց" : `${urls.length} նկար վերբեռնվեց`);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploading(false);
    }
  }

  function addImageByUrl() {
    const url = imageUrlDraft.trim();
    if (!url) return;
    if (form.images.includes(url)) {
      setImageUrlDraft("");
      return;
    }
    set("images", [...form.images, url]);
    setImageUrlDraft("");
  }

  function removeImageAt(index: number) {
    set(
      "images",
      form.images.filter((_, i) => i !== index),
    );
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

  async function handleAptFloorPlanUpload(file: File, aptId: string) {
    if (!file.type.startsWith("image/")) {
      toast("Միայն նկար ֆայլ", "error");
      return;
    }
    setUploadingAptPlanId(aptId);
    try {
      const result = await adminUploadFile(file, projectId);
      const url = result.jpegUrl || result.url;
      if (url) {
        updateApt(aptId, { floorPlanImage: url });
        toast("Հատակագիծը վերբեռնվեց");
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploadingAptPlanId(null);
    }
  }

  async function handleAptGalleryUpload(files: FileList | File[], aptId: string) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast("Միայն նկար ֆայլ", "error");
      return;
    }
    setUploadingAptGalleryId(aptId);
    try {
      const urls: string[] = [];
      for (const file of list) {
        const result = await adminUploadFile(file, projectId);
        const url = result.jpegUrl || result.url;
        if (url) urls.push(url);
      }
      if (urls.length) {
        const apt = form.apartments.find((x) => x.id === aptId);
        const prev = apt?.gallery ?? [];
        updateApt(aptId, { gallery: [...prev, ...urls] });
        toast(urls.length === 1 ? "Լուսանկարը վերբեռնվեց" : `${urls.length} լուսանկար վերբեռնվեց`);
      }
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    } finally {
      setUploadingAptGalleryId(null);
    }
  }

  function removeAptGalleryImage(aptId: string, index: number) {
    const apt = form.apartments.find((x) => x.id === aptId);
    if (!apt) return;
    updateApt(aptId, {
      gallery: (apt.gallery ?? []).filter((_, i) => i !== index),
    });
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
          <AdminImageGrid
            urls={form.images}
            onRemove={removeImageAt}
            coverBadge={a.coverBadge}
            emptyLabel={a.imagesEmpty}
            removeLabel={a.removeImage}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                if (files?.length) void handleUpload(files);
                e.target.value = "";
              }}
            />
            <button
              type="button"
              disabled={uploading}
              className={adminBtnSecondary}
              onClick={() => fileRef.current?.click()}
            >
              <Plus size={15} />
              {uploading ? "Վերբեռնում…" : a.uploadImages}
            </button>
            <p className="text-xs text-[#9CA3AF]">
              {form.images.length > 0
                ? `${form.images.length} · ${a.projectImages}`
                : a.urlHintHttps}
            </p>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-[1fr_auto] sm:items-end">
            <Field label={a.addImageUrl}>
              <input
                className={adminInputCls}
                value={imageUrlDraft}
                placeholder={a.addImageUrlPlaceholder}
                onChange={(e) => setImageUrlDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addImageByUrl();
                  }
                }}
              />
            </Field>
            <button type="button" className={cn(adminBtnSecondary, "h-11")} onClick={addImageByUrl}>
              {a.addImageUrl}
            </button>
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
                    {video.thumbnail ? (
                      <div className="mt-2 max-w-[180px]">
                        <AdminImageThumb
                          src={video.thumbnail}
                          removeLabel={a.removeImage}
                          onRemove={() => updateDroneVideo(index, { thumbnail: undefined })}
                        />
                      </div>
                    ) : null}
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
            {amenityPresets.map((label) => {
              const active = form.amenities.some((x) => x.label === label);
              return (
                <button
                  key={label}
                  type="button"
                  onClick={() => toggleAmenity(label)}
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

          {customAmenities.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customAmenities.map((item) => (
                <span
                  key={item.label}
                  className="inline-flex items-center gap-1.5 rounded-[5px] border border-[#c9a96e] bg-[#c9a96e]/15 px-3 py-1.5 text-xs font-semibold text-[#0c1428]"
                >
                  {item.label}
                  <button
                    type="button"
                    aria-label={a.remove}
                    onClick={() => removeAmenity(item.label)}
                    className="rounded text-[#6B7280] transition-colors hover:text-[#0c1428]"
                  >
                    <X size={13} strokeWidth={2.25} />
                  </button>
                </span>
              ))}
            </div>
          )}

          {form.amenities.length === 0 && (
            <p className="text-sm text-[#9CA3AF]">{a.noAmenities}</p>
          )}

          <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="min-w-0 flex-1">
              <Field label={a.amenities}>
                <input
                  className={adminInputCls}
                  value={amenityDraft}
                  placeholder={a.amenityPlaceholder}
                  onChange={(e) => setAmenityDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomAmenity();
                    }
                  }}
                />
              </Field>
            </div>
            <button type="button" className={adminBtnSecondary} onClick={addCustomAmenity}>
              <Plus size={15} /> {a.addAmenity}
            </button>
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

        <Section
          title={a.sectionBuildings}
          icon={Building2}
          actions={
            <>
              {buildings.length > 0 ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#0c1428]"
                  onClick={() =>
                    setOpenBuildingIds((ids) =>
                      ids.length === buildings.length ? [] : buildings.map((b) => b.id),
                    )
                  }
                >
                  {openBuildingIds.length === buildings.length ? a.collapseAll : a.expandAll}
                </button>
              ) : null}
              <button type="button" className={cn(adminBtnSecondary, "h-8 px-3 text-xs")} onClick={openCreateBuildingModal}>
                <Plus size={14} /> {a.addBuilding}
              </button>
            </>
          }
        >
          <div className="rounded-[5px] border border-[#E8EAED] bg-[#F8F6F1] px-3 py-2.5 text-xs leading-relaxed text-[#57534E]">
            <p className="font-semibold text-[#0c1428]">{a.buildingsHint}</p>
            <ol className="mt-1.5 list-decimal space-y-0.5 pl-4">
              <li>{a.buildingsStep1}</li>
              <li>{a.buildingsStep2}</li>
              <li>{a.buildingsStep3}</li>
            </ol>
          </div>
          <div className="space-y-2">
            {buildings.map((building, index) => {
              const buildingApts = form.apartments.filter((apt) => apt.buildingId === building.id);
              const floors = building.floors ?? [];
              const isOpen = openBuildingIds.includes(building.id);
              return (
                <AccordionItem
                  key={building.id}
                  open={isOpen}
                  onToggle={() => setOpenBuildingIds((ids) => toggleId(ids, building.id))}
                  title={building.name.trim() || a.unnamedBuilding}
                  meta={
                    <>
                      {a.floorsCount.replace("{count}", String(floors.length))}
                      {" · "}
                      {buildingApts.length} {a.plansAttached}
                    </>
                  }
                >
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
                    <div className="min-w-0 flex-1">
                      <Field label={a.buildingName}>
                        <input
                          className={adminInputCls}
                          value={building.name}
                          placeholder={a.buildingNamePlaceholder}
                          onChange={(e) =>
                            updateBuilding(building.id, { name: e.target.value, sortOrder: index })
                          }
                        />
                      </Field>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeBuilding(building.id)}
                      className="inline-flex h-11 items-center justify-center gap-1 rounded-[5px] px-3 text-xs text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={14} /> {a.remove}
                    </button>
                  </div>

                  <div className="space-y-2 border-t border-[#E8EAED] pt-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                        {a.buildingFloorsTitle}
                      </p>
                      <button
                        type="button"
                        onClick={() => openCreateFloorModal(building.id)}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]"
                      >
                        <Plus size={15} /> {a.addFloorPlate}
                      </button>
                    </div>
                    {floors.length === 0 && (
                      <p className="text-xs text-[#9CA3AF]">{a.noFloorPlates}</p>
                    )}
                    {floors.map((floor, fi) => {
                      const floorOpen = openFloorIds.includes(floor.id);
                      return (
                        <AccordionItem
                          key={floor.id}
                          open={floorOpen}
                          onToggle={() => setOpenFloorIds((ids) => toggleId(ids, floor.id))}
                          title={`${a.floorLabelField}: ${floor.label.trim() || "—"}`}
                          meta={floor.imageUrl.trim() ? a.hasFloorImage : a.noFloorImage}
                        >
                          <div className="grid grid-cols-1 gap-3 md:grid-cols-[120px_1fr_auto] md:items-end">
                            <Field label={a.floorLabelField}>
                              <input
                                className={adminInputCls}
                                value={floor.label}
                                placeholder={a.floorLabelPlaceholder}
                                onChange={(e) =>
                                  updateBuildingFloor(building.id, floor.id, {
                                    label: e.target.value,
                                    sortOrder: fi,
                                  })
                                }
                              />
                            </Field>
                            <Field label={a.floorImageUrl}>
                              <input
                                className={adminInputCls}
                                value={floor.imageUrl}
                                placeholder={a.floorPlanUrlPlaceholder}
                                onChange={(e) =>
                                  updateBuildingFloor(building.id, floor.id, {
                                    imageUrl: e.target.value,
                                  })
                                }
                              />
                            </Field>
                            <div className="flex flex-wrap gap-2">
                              <button
                                type="button"
                                disabled={uploadingFloorId === floor.id}
                                className={cn(adminBtnSecondary, "h-11")}
                                onClick={() => {
                                  floorImageTarget.current = {
                                    buildingId: building.id,
                                    floorId: floor.id,
                                  };
                                  floorImageRef.current?.click();
                                }}
                              >
                                {uploadingFloorId === floor.id ? "…" : a.uploadFloorImage}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  updateBuilding(building.id, {
                                    floors: floors.filter((f) => f.id !== floor.id),
                                  });
                                  setOpenFloorIds((ids) => ids.filter((x) => x !== floor.id));
                                }}
                                className="inline-flex h-11 items-center gap-1 rounded-[5px] px-3 text-xs text-red-500 hover:bg-red-50"
                              >
                                <Trash2 size={14} /> {a.removeFloorPlate}
                              </button>
                            </div>
                          </div>
                          {floor.imageUrl.trim() ? (
                            <AdminImageThumb
                              src={floor.imageUrl}
                              className="h-40 w-full max-w-sm aspect-auto sm:aspect-[4/3]"
                              imgClassName="object-contain bg-[#FAFAF8]"
                              removeLabel={a.removeImage}
                              onRemove={() =>
                                updateBuildingFloor(building.id, floor.id, {
                                  imageUrl: "",
                                  hotspots: [],
                                })
                              }
                            />
                          ) : null}
                          <FloorHotspotEditor
                            floor={floor}
                            apartments={buildingApts}
                            onChange={(patch) => updateBuildingFloor(building.id, floor.id, patch)}
                            labels={{
                              selectApartment: a.hotspotSelectApartment,
                              drawHint: a.hotspotDrawHint,
                              finishPolygon: a.hotspotFinish,
                              undoPoint: a.hotspotUndo,
                              clearDraft: a.hotspotClear,
                              removeHotspot: a.hotspotRemove,
                              noApartments: a.hotspotNoApartments,
                              hotspotCount: a.hotspotCount,
                            }}
                          />
                        </AccordionItem>
                      );
                    })}
                  </div>
                </AccordionItem>
              );
            })}
            {buildings.length === 0 && (
              <p className="text-sm text-[#9CA3AF]">{a.noBuildings}</p>
            )}
          </div>
          <input
            ref={floorImageRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              const target = floorImageTarget.current;
              if (file && target) {
                void handleFloorImageUpload(file, target.buildingId, target.floorId);
              }
              e.target.value = "";
              floorImageTarget.current = null;
            }}
          />
        </Section>

        <Section
          title={a.sectionApartments}
          icon={Home}
          actions={
            <>
              {form.apartments.length > 0 ? (
                <button
                  type="button"
                  className="text-xs font-semibold text-[#6B7280] hover:text-[#0c1428]"
                  onClick={() =>
                    setOpenAptIds((ids) =>
                      ids.length === form.apartments.length ? [] : form.apartments.map((x) => x.id),
                    )
                  }
                >
                  {openAptIds.length === form.apartments.length ? a.collapseAll : a.expandAll}
                </button>
              ) : null}
              <button type="button" className={cn(adminBtnSecondary, "h-8 px-3 text-xs")} onClick={openCreateAptModal}>
                <Plus size={14} /> {a.addUnit}
              </button>
            </>
          }
        >
          <div className="space-y-2">
            {form.apartments.map((apt) => {
              const buildingName =
                buildings.find((b) => b.id === apt.buildingId)?.name.trim() || a.noBuildingAssigned;
              const isOpen = openAptIds.includes(apt.id);
              return (
                <AccordionItem
                  key={apt.id}
                  open={isOpen}
                  onToggle={() => setOpenAptIds((ids) => toggleId(ids, apt.id))}
                  title={
                    apt.apartmentNumber?.trim()
                      ? `${a.apartmentNumber} ${apt.apartmentNumber}`
                      : a.unnamedUnit
                  }
                  meta={
                    <>
                      {buildingName}
                      {" · "}
                      {a.floorLabel} {apt.floor}
                      {" · "}
                      {apt.rooms} {a.roomsShort}
                      {" · "}
                      {apt.area} մ²
                    </>
                  }
                >
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                    <Field label={a.apartmentNumber}>
                      <input
                        className={adminInputCls}
                        value={apt.apartmentNumber ?? ""}
                        placeholder={a.apartmentNumberPlaceholder}
                        onChange={(e) => updateApt(apt.id, { apartmentNumber: e.target.value })}
                      />
                    </Field>
                    <Field label={a.buildingLabel}>
                      <select
                        className={adminSelectCls}
                        value={apt.buildingId ?? ""}
                        onChange={(e) =>
                          updateApt(apt.id, { buildingId: e.target.value || undefined })
                        }
                      >
                        <option value="">{a.noBuildingAssigned}</option>
                        {buildings
                          .filter((b) => b.name.trim())
                          .map((b) => (
                            <option key={b.id} value={b.id}>
                              {b.name}
                            </option>
                          ))}
                      </select>
                    </Field>
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
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        set("apartments", form.apartments.filter((x) => x.id !== apt.id));
                        setOpenAptIds((ids) => ids.filter((x) => x !== apt.id));
                      }}
                      className="inline-flex items-center gap-1 text-xs text-red-500 hover:text-red-600"
                    >
                      <Trash2 size={14} /> {a.remove}
                    </button>
                  </div>
                  <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                    <Field label="Տեսարան">
                      <input
                        className={adminInputCls}
                        value={apt.viewType}
                        onChange={(e) => updateApt(apt.id, { viewType: e.target.value })}
                      />
                    </Field>
                    <div className="md:col-span-2">
                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
                        <Field label={a.floorPlanUrl}>
                          <input
                            className={adminInputCls}
                            value={apt.floorPlanImage}
                            placeholder={a.floorPlanUrlPlaceholder}
                            onChange={(e) => updateApt(apt.id, { floorPlanImage: e.target.value })}
                          />
                        </Field>
                        <button
                          type="button"
                          disabled={uploadingAptPlanId === apt.id}
                          className={cn(adminBtnSecondary, "h-11")}
                          onClick={() => {
                            aptPlanTargetAptId.current = apt.id;
                            aptPlanFileRef.current?.click();
                          }}
                        >
                          {uploadingAptPlanId === apt.id ? "Վերբեռնում…" : a.uploadFloorImage}
                        </button>
                      </div>
                      {apt.floorPlanImage.trim() ? (
                        <div className="mt-2 max-w-xs">
                          <AdminImageThumb
                            src={apt.floorPlanImage}
                            className="aspect-[4/3]"
                            imgClassName="object-contain bg-[#FAFAF8]"
                            removeLabel={a.removeImage}
                            onRemove={() => updateApt(apt.id, { floorPlanImage: "" })}
                          />
                        </div>
                      ) : null}
                    </div>
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
                  <div className="space-y-2 rounded-[5px] border border-[#E8EAED] bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0c1428]">{a.galleryImages}</p>
                      <button
                        type="button"
                        disabled={uploadingAptGalleryId === apt.id}
                        className={cn(adminBtnSecondary, "h-9 text-xs")}
                        onClick={() => {
                          aptGalleryTargetAptId.current = apt.id;
                          aptGalleryFileRef.current?.click();
                        }}
                      >
                        <Plus size={14} />
                        {uploadingAptGalleryId === apt.id ? "Վերբեռնում…" : a.uploadImages}
                      </button>
                    </div>
                    <AdminImageGrid
                      urls={apt.gallery ?? []}
                      onRemove={(index) => removeAptGalleryImage(apt.id, index)}
                      emptyLabel={a.aptGalleryEmpty}
                      removeLabel={a.removeImage}
                      className="sm:grid-cols-3 md:grid-cols-4"
                    />
                    <p className="text-[11px] text-[#9CA3AF]">{a.aptGalleryHint}</p>
                  </div>
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
                </AccordionItem>
              );
            })}
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
            <input
              ref={aptPlanFileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                const aptId = aptPlanTargetAptId.current;
                if (file && aptId) void handleAptFloorPlanUpload(file, aptId);
                e.target.value = "";
                aptPlanTargetAptId.current = null;
              }}
            />
            <input
              ref={aptGalleryFileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                const files = e.target.files;
                const aptId = aptGalleryTargetAptId.current;
                if (files?.length && aptId) void handleAptGalleryUpload(files, aptId);
                e.target.value = "";
                aptGalleryTargetAptId.current = null;
              }}
            />
            {form.apartments.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">{a.noApartments}</p>
            ) : null}
          </div>
        </Section>
      </div>

      <AdminModal
        open={buildingModalOpen}
        title={a.newBuildingTitle}
        onClose={() => setBuildingModalOpen(false)}
        footer={
          <>
            <button type="button" className={adminBtnSecondary} onClick={() => setBuildingModalOpen(false)}>
              {a.cancel}
            </button>
            <button type="button" className={adminBtnPrimary} onClick={createBuildingFromModal}>
              {a.createBuilding}
            </button>
          </>
        }
      >
        <Field label={a.buildingName}>
          <input
            className={adminInputCls}
            value={buildingNameDraft}
            placeholder={a.buildingNamePlaceholder}
            autoFocus
            onChange={(e) => setBuildingNameDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createBuildingFromModal();
              }
            }}
          />
        </Field>
      </AdminModal>

      <AdminModal
        open={floorModalBuildingId !== null}
        title={a.newFloorPlateTitle}
        onClose={() => setFloorModalBuildingId(null)}
        footer={
          <>
            <button type="button" className={adminBtnSecondary} onClick={() => setFloorModalBuildingId(null)}>
              {a.cancel}
            </button>
            <button type="button" className={adminBtnPrimary} onClick={createFloorFromModal}>
              {a.createFloorPlate}
            </button>
          </>
        }
      >
        <Field label={a.floorLabelField}>
          <input
            className={adminInputCls}
            value={floorLabelDraft}
            placeholder={a.floorLabelPlaceholder}
            autoFocus
            onChange={(e) => setFloorLabelDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                createFloorFromModal();
              }
            }}
          />
        </Field>
      </AdminModal>

      <AdminModal
        open={aptModalOpen}
        title={a.newUnitTitle}
        onClose={() => setAptModalOpen(false)}
        footer={
          <>
            <button type="button" className={adminBtnSecondary} onClick={() => setAptModalOpen(false)}>
              {a.cancel}
            </button>
            <button type="button" className={adminBtnPrimary} onClick={createAptFromModal}>
              {a.createUnit}
            </button>
          </>
        }
      >
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label={a.apartmentNumber}>
            <input
              className={adminInputCls}
              value={aptCreateDraft.apartmentNumber}
              placeholder={a.apartmentNumberPlaceholder}
              autoFocus
              onChange={(e) => setAptCreateDraft((d) => ({ ...d, apartmentNumber: e.target.value }))}
            />
          </Field>
          <Field label={a.buildingLabel}>
            <select
              className={adminSelectCls}
              value={aptCreateDraft.buildingId}
              onChange={(e) => setAptCreateDraft((d) => ({ ...d, buildingId: e.target.value }))}
            >
              <option value="">{a.noBuildingAssigned}</option>
              {buildings
                .filter((b) => b.name.trim())
                .map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
            </select>
          </Field>
          <Field label={a.floorLabel}>
            <input
              type="number"
              className={adminInputCls}
              value={aptCreateDraft.floor}
              onChange={(e) => setAptCreateDraft((d) => ({ ...d, floor: +e.target.value }))}
            />
          </Field>
          <Field label={a.roomsShort}>
            <input
              type="number"
              className={adminInputCls}
              value={aptCreateDraft.rooms}
              onChange={(e) => setAptCreateDraft((d) => ({ ...d, rooms: +e.target.value }))}
            />
          </Field>
          <Field label={a.areaSqm}>
            <input
              type="number"
              className={adminInputCls}
              value={aptCreateDraft.area}
              onChange={(e) => setAptCreateDraft((d) => ({ ...d, area: +e.target.value }))}
            />
          </Field>
          <Field label={a.priceAmd}>
            <input
              type="number"
              className={adminInputCls}
              value={aptCreateDraft.price}
              onChange={(e) => setAptCreateDraft((d) => ({ ...d, price: +e.target.value }))}
            />
          </Field>
          <Field label={hyTranslations.filter.status}>
            <select
              className={adminSelectCls}
              value={aptCreateDraft.status}
              onChange={(e) =>
                setAptCreateDraft((d) => ({ ...d, status: e.target.value as ApartmentStatus }))
              }
            >
              <option value="Available">{getStatusLabel(hyTranslations, "Available")}</option>
              <option value="Reserved">{getStatusLabel(hyTranslations, "Reserved")}</option>
              <option value="Sold">{getStatusLabel(hyTranslations, "Sold")}</option>
            </select>
          </Field>
        </div>
      </AdminModal>
    </div>
  );
}
