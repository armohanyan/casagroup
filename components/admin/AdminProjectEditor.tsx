"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Building2,
  ChevronDown,
  Copy,
  DollarSign,
  Home,
  Image as ImageIcon,
  Languages,
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
import { BilingualField } from "@/components/admin/BilingualField";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  ADMIN_BASE,
  adminBtnPrimary,
  adminBtnSecondary,
  adminCardCls,
  adminInputCls,
  adminSelectCls,
} from "@/components/admin/admin-config";
import { FloorHotspotEditor } from "@/components/admin/FloorHotspotEditor";
import { AdminNeighborhoodSection } from "@/components/admin/AdminNeighborhoodSection";
import { AdminSalesMapSection } from "@/components/admin/AdminSalesMapSection";
import { BuildingExteriorEditor } from "@/components/admin/BuildingExteriorEditor";
import { AdminImageGrid, AdminImageThumb } from "@/components/admin/AdminImageThumb";
import { useAdminImagePicker } from "@/components/admin/useAdminImagePicker";
import { ProjectViewCount } from "@/components/site/ProjectViewCount";
import {
  cloneApartmentPlan,
  emptyApartment,
  emptyBuilding,
  emptyBuildingFloor,
  emptyProject,
  generateId,
} from "@/lib/store";
import { useProjects } from "@/lib/projects-context";
import { adminGetProject, adminUploadFile } from "@/lib/api-client";
import { getStatusLabel } from "@/lib/i18n";
import {
  effectiveProjectKind,
  hasBuildingFloorPlates,
  hasNeighborhoodSite,
  isNeighborhoodProject,
} from "@/lib/project-kind";
import { parseSalesMode, SALES_MODES, usesBuildingExterior, usesMapStages } from "@/lib/sales-mode";
import { en } from "@/lib/translations-en";
import { ru } from "@/lib/translations-ru";
import { hyTranslations } from "@/content/hy";
import type {
  Amenity,
  Apartment,
  ApartmentStatus,
  Building,
  BuildingFloor,
  Project,
  ProjectKind,
  ProjectStatus,
  SalesMode,
} from "@/types";
import { cn } from "@/lib/utils";

const a = hyTranslations.admin;

const imageEditorLabels = {
  title: a.imageEditorTitle,
  zoom: a.imageEditorZoom,
  rotate: a.imageEditorRotate,
  flipH: a.imageEditorFlipH,
  flipV: a.imageEditorFlipV,
  apply: a.imageEditorApply,
  cancel: a.imageEditorCancel,
  aspectFree: a.imageEditorAspectFree,
  aspect1: a.imageEditorAspect1,
  aspect43: a.imageEditorAspect43,
  aspect169: a.imageEditorAspect169,
  aspect34: a.imageEditorAspect34,
  edit: a.editImage,
};

type EditorForm = Omit<Project, "id" | "slug"> & { id?: string; slug?: string };

/** Normalize API project → editor form (floors + exterior bands always present). */
function projectToForm(project: Project): EditorForm {
  return {
    ...project,
    kind:
      project.kind === "neighborhood" &&
      (Boolean(project.sitePlanImage?.trim()) || (project.landPlots?.length ?? 0) > 0)
        ? "neighborhood"
        : "building",
    salesMode: parseSalesMode(project.salesMode),
    mapStages: project.mapStages ?? [],
    sitePlanImage: project.sitePlanImage ?? "",
    landPlots: project.landPlots ?? [],
    buildings: (project.buildings ?? []).map((b) => ({
      ...b,
      kind: "building" as const,
      exteriorImageUrl: b.exteriorImageUrl ?? "",
      textLabels: b.textLabels ?? [],
      floors: (b.floors ?? []).map((f) => ({
        ...f,
        hotspots: f.hotspots ?? [],
        exteriorHotspot: f.exteriorHotspot ?? [],
      })),
      images: b.images ?? [],
    })),
    apartments: project.apartments ?? [],
  };
}

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
  wide,
}: {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
  wide?: boolean;
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
        className={cn(
          adminCardCls,
          "flex max-h-[90vh] w-full flex-col p-5 sm:p-6",
          wide ? "max-w-xl" : "max-w-lg",
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex shrink-0 items-start justify-between gap-3">
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
        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto">{children}</div>
        <div className="mt-6 flex shrink-0 flex-wrap justify-end gap-2">{footer}</div>
      </div>
    </div>
  );
}

function PlanPicker({
  apartments,
  selectedIds,
  onChange,
  itemLabel,
}: {
  apartments: Apartment[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
  itemLabel: (apt: Apartment) => string;
}) {
  if (apartments.length === 0) {
    return <p className="text-xs text-[#9CA3AF]">{a.noPlansToClone}</p>;
  }
  const allSelected = apartments.every((apt) => selectedIds.includes(apt.id));
  return (
    <div className="space-y-2">
      <div className="flex justify-end">
        <button
          type="button"
          className="text-xs font-semibold text-[#c9a96e] hover:text-[#a88a52]"
          onClick={() => onChange(allSelected ? [] : apartments.map((apt) => apt.id))}
        >
          {allSelected ? a.deselectAllPlans : a.selectAllPlans}
        </button>
      </div>
      <div className="max-h-56 space-y-0.5 overflow-y-auto rounded-[5px] border border-[#E8EAED] bg-white p-1.5">
        {apartments.map((apt) => {
          const checked = selectedIds.includes(apt.id);
          return (
            <label
              key={apt.id}
              className="flex cursor-pointer items-start gap-2 rounded-[5px] px-2 py-1.5 text-sm text-[#0c1428] hover:bg-[#F8F6F1]"
            >
              <input
                type="checkbox"
                className="mt-0.5 accent-[#c9a96e]"
                checked={checked}
                onChange={() =>
                  onChange(checked ? selectedIds.filter((id) => id !== apt.id) : [...selectedIds, apt.id])
                }
              />
              <span>{itemLabel(apt)}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}

function PlanTypeToggle({
  value,
  onChange,
  buildingLabel,
  neighborhoodLabel,
}: {
  value: ProjectKind;
  onChange: (kind: ProjectKind) => void;
  buildingLabel: string;
  neighborhoodLabel: string;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {(["building", "neighborhood"] as const).map((kind) => {
        const active = value === kind;
        return (
          <button
            key={kind}
            type="button"
            onClick={() => onChange(kind)}
            className={cn(
              "h-11 rounded-[5px] border text-sm font-semibold transition-colors",
              active
                ? "border-[#c9a96e] bg-[#F8F6F1] text-[#0c1428]"
                : "border-[#E8EAED] bg-white text-[#6B7280] hover:border-[#c9a96e]/60",
            )}
          >
            {kind === "building" ? buildingLabel : neighborhoodLabel}
          </button>
        );
      })}
    </div>
  );
}

function SalesModeToggle({
  value,
  onChange,
  labels,
}: {
  value: SalesMode;
  onChange: (mode: SalesMode) => void;
  labels: Record<SalesMode, string>;
}) {
  return (
    <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
      {SALES_MODES.map((mode) => {
        const active = value === mode;
        return (
          <button
            key={mode}
            type="button"
            onClick={() => onChange(mode)}
            className={cn(
              "min-h-11 rounded-[5px] border px-3 py-2 text-left text-sm font-semibold transition-colors",
              active
                ? "border-[#c9a96e] bg-[#F8F6F1] text-[#0c1428]"
                : "border-[#E8EAED] bg-white text-[#6B7280] hover:border-[#c9a96e]/60",
            )}
          >
            {labels[mode]}
          </button>
        );
      })}
    </div>
  );
}

type AptCreateDraft = {
  apartmentNumber: string;
  buildingId: string;
  floor: number;
  rooms: number;
  area: number;
  landArea: number;
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
    landArea: 0,
    price: 150000,
    status: "Available",
  };
}

interface Props {
  projectId?: string;
}

export function AdminProjectEditor({ projectId }: Props) {
  const { projects, addProject, updateProject, upsertProject, loading } = useProjects();
  const { toast } = useAdminToast();
  const router = useRouter();
  const isNew = !projectId;
  const existing = projectId ? projects.find((p) => p.id === projectId) : undefined;
  const imagePicker = useAdminImagePicker(imageEditorLabels, (msg) => toast(msg, "error"));

  const [form, setForm] = useState<EditorForm>(() =>
    existing ? projectToForm(existing) : { ...emptyProject() },
  );
  const [saving, setSaving] = useState(false);
  const [priceTo, setPriceTo] = useState("");
  const [seoTitle, setSeoTitle] = useState("");
  const [seoDesc, setSeoDesc] = useState("");
  const [hydrated, setHydrated] = useState(isNew);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [uploadingDrone, setUploadingDrone] = useState(false);
  const [uploadingPdfId, setUploadingPdfId] = useState<string | null>(null);
  const [amenityDraftHy, setAmenityDraftHy] = useState("");
  const [amenityDraftEn, setAmenityDraftEn] = useState("");
  const [amenityDraftRu, setAmenityDraftRu] = useState("");
  const [imageUrlDraft, setImageUrlDraft] = useState("");
  const [openBuildingIds, setOpenBuildingIds] = useState<string[]>([]);
  const [openAptIds, setOpenAptIds] = useState<string[]>([]);
  const [openFloorIds, setOpenFloorIds] = useState<string[]>([]);
  const [buildingModalOpen, setBuildingModalOpen] = useState(false);
  const [buildingNameDraft, setBuildingNameDraft] = useState("");
  const [floorModalBuildingId, setFloorModalBuildingId] = useState<string | null>(null);
  const [floorModalMode, setFloorModalMode] = useState<"create" | "duplicate">("create");
  const [floorLabelDraft, setFloorLabelDraft] = useState("");
  const [floorCloneSourceId, setFloorCloneSourceId] = useState("");
  const [floorCloneAptIds, setFloorCloneAptIds] = useState<string[]>([]);
  const [aptModalOpen, setAptModalOpen] = useState(false);
  const [aptCreateDraft, setAptCreateDraft] = useState<AptCreateDraft>(() => emptyAptCreateDraft());
  const [aptCloneModalOpen, setAptCloneModalOpen] = useState(false);
  const [aptCloneSelectedIds, setAptCloneSelectedIds] = useState<string[]>([]);
  const droneFileRef = useRef<HTMLInputElement>(null);
  const pdfFileRef = useRef<HTMLInputElement>(null);
  const pdfTargetAptId = useRef<string | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  /** Keep formRef in sync inside the updater so Save / zone persist never read a stale snapshot. */
  function commitForm(updater: (f: EditorForm) => EditorForm) {
    setForm((f) => {
      const next = updater(f);
      formRef.current = next;
      return next;
    });
  }

  useEffect(() => {
    if (isNew) {
      setHydrated(true);
      setLoadError(null);
      return;
    }
    if (!projectId) return;

    let cancelled = false;
    setHydrated(false);
    setLoadError(null);

    void (async () => {
      try {
        // List endpoint omits floors / hotspots / map stages - always load full project for editing.
        const full = await adminGetProject(projectId);
        if (cancelled) return;
        upsertProject(full);
        const next = projectToForm(full);
        formRef.current = next;
        setForm(next);
        setHydrated(true);
      } catch (e) {
        if (cancelled) return;
        setLoadError(e instanceof Error ? e.message : String(e));
        setHydrated(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [projectId, isNew, upsertProject]);

  const set = (key: string, value: unknown) => commitForm((f) => ({ ...f, [key]: value }));
  const apartmentProjectId = useMemo(() => form.id ?? generateId(), [form.id]);
  const buildings = form.buildings ?? [];
  const amenityPresets: Amenity[] = [
    { icon: "check", label: en.admin.amenityPool, labelHy: a.amenityPool, labelRu: ru.admin.amenityPool },
    { icon: "check", label: en.admin.amenityGym, labelHy: a.amenityGym, labelRu: ru.admin.amenityGym },
    { icon: "check", label: en.admin.amenityParking, labelHy: a.amenityParking, labelRu: ru.admin.amenityParking },
    { icon: "check", label: en.admin.amenitySecurity, labelHy: a.amenitySecurity, labelRu: ru.admin.amenitySecurity },
    { icon: "check", label: en.admin.amenityGarden, labelHy: a.amenityGarden, labelRu: ru.admin.amenityGarden },
    { icon: "check", label: en.admin.amenityRestaurant, labelHy: a.amenityRestaurant, labelRu: ru.admin.amenityRestaurant },
    { icon: "check", label: en.admin.amenityWifi, labelHy: a.amenityWifi, labelRu: ru.admin.amenityWifi },
    { icon: "check", label: en.admin.amenitySmartHome, labelHy: a.amenitySmartHome, labelRu: ru.admin.amenitySmartHome },
  ];

  function amenityMatches(item: Amenity, preset: Amenity) {
    const keys = [item.label, item.labelHy, item.labelRu].filter(Boolean).map((x) => x!.toLowerCase());
    return [preset.label, preset.labelHy, preset.labelRu].some((x) => x && keys.includes(x.toLowerCase()));
  }

  const customAmenities = form.amenities.filter((item) => !amenityPresets.some((preset) => amenityMatches(item, preset)));

  function toggleAmenity(preset: Amenity) {
    if (form.amenities.some((x) => amenityMatches(x, preset))) {
      set(
        "amenities",
        form.amenities.filter((x) => !amenityMatches(x, preset)),
      );
    } else {
      set("amenities", [...form.amenities, { icon: "check", label: preset.label, labelHy: preset.labelHy, labelRu: preset.labelRu }]);
    }
  }

  function addCustomAmenity() {
    const labelHy = amenityDraftHy.trim();
    const label = amenityDraftEn.trim();
    const labelRu = amenityDraftRu.trim();
    if (!labelHy && !label && !labelRu) return;
    const exists = form.amenities.some((x) => {
      const keys = [x.label, x.labelHy, x.labelRu].filter(Boolean).map((v) => v!.toLowerCase());
      return (
        (label && keys.includes(label.toLowerCase())) ||
        (labelHy && keys.includes(labelHy.toLowerCase())) ||
        (labelRu && keys.includes(labelRu.toLowerCase()))
      );
    });
    if (exists) {
      setAmenityDraftHy("");
      setAmenityDraftEn("");
      setAmenityDraftRu("");
      return;
    }
    set("amenities", [
      ...form.amenities,
      { icon: "check", label: label || labelHy || labelRu, labelHy: labelHy || label, labelRu: labelRu || label },
    ]);
    setAmenityDraftHy("");
    setAmenityDraftEn("");
    setAmenityDraftRu("");
  }

  function updateCustomAmenity(item: Amenity, patch: Partial<Amenity>) {
    set(
      "amenities",
      form.amenities.map((x) => (x === item ? { ...x, ...patch } : x)),
    );
  }

  function removeAmenity(item: Amenity) {
    set(
      "amenities",
      form.amenities.filter((x) => x !== item),
    );
  }

  function fillEmptyFrom(source: "en" | "hy" | "ru") {
    const keep = (current: string | undefined | null, from: string | undefined | null) => {
      const cur = current?.trim();
      if (cur) return current ?? undefined;
      const next = from?.trim();
      return next || undefined;
    };
    setForm((f) => {
      const src = {
        title: source === "en" ? f.title : source === "hy" ? f.titleHy : f.titleRu,
        location: source === "en" ? f.location : source === "hy" ? f.locationHy : f.locationRu,
        city: source === "en" ? f.city : source === "hy" ? f.cityHy : f.cityRu,
        description: source === "en" ? f.description : source === "hy" ? f.descriptionHy : f.descriptionRu,
        longDescription:
          source === "en" ? f.longDescription : source === "hy" ? f.longDescriptionHy : f.longDescriptionRu,
      };
      return {
        ...f,
        title: keep(f.title, src.title) ?? "",
        titleHy: keep(f.titleHy, src.title),
        titleRu: keep(f.titleRu, src.title),
        location: keep(f.location, src.location) ?? "",
        locationHy: keep(f.locationHy, src.location),
        locationRu: keep(f.locationRu, src.location),
        city: keep(f.city, src.city) ?? "",
        cityHy: keep(f.cityHy, src.city),
        cityRu: keep(f.cityRu, src.city),
        description: keep(f.description, src.description) ?? "",
        descriptionHy: keep(f.descriptionHy, src.description),
        descriptionRu: keep(f.descriptionRu, src.description),
        longDescription: keep(f.longDescription, src.longDescription) ?? "",
        longDescriptionHy: keep(f.longDescriptionHy, src.longDescription),
        longDescriptionRu: keep(f.longDescriptionRu, src.longDescription),
        amenities: f.amenities.map((item) => {
          const from = source === "en" ? item.label : source === "hy" ? item.labelHy : item.labelRu;
          return {
            ...item,
            label: keep(item.label, from) ?? "",
            labelHy: keep(item.labelHy, from),
            labelRu: keep(item.labelRu, from),
          };
        }),
        droneVideos: (f.droneVideos ?? []).map((video) => {
          const from = source === "en" ? video.title : source === "hy" ? video.titleHy : video.titleRu;
          return {
            ...video,
            title: keep(video.title, from) ?? "",
            titleHy: keep(video.titleHy, from),
            titleRu: keep(video.titleRu, from),
          };
        }),
        apartments: f.apartments.map((apt) => {
          const fromDesc =
            source === "en" ? apt.description : source === "hy" ? apt.descriptionHy : apt.descriptionRu;
          const fromView = source === "en" ? apt.viewType : source === "hy" ? apt.viewTypeHy : apt.viewTypeRu;
          return {
            ...apt,
            description: keep(apt.description, fromDesc),
            descriptionHy: keep(apt.descriptionHy, fromDesc),
            descriptionRu: keep(apt.descriptionRu, fromDesc),
            viewType: keep(apt.viewType, fromView) ?? "",
            viewTypeHy: keep(apt.viewTypeHy, fromView),
            viewTypeRu: keep(apt.viewTypeRu, fromView),
          };
        }),
      };
    });
  }

  function updateBuilding(id: string, patch: Partial<Building>) {
    commitForm((f) => ({
      ...f,
      buildings: (f.buildings ?? []).map((b) => (b.id === id ? { ...b, ...patch } : b)),
    }));
  }

  function updateBuildingFloor(
    buildingId: string,
    floorId: string,
    patch: Partial<BuildingFloor> | ((floor: BuildingFloor) => Partial<BuildingFloor>),
  ) {
    commitForm((f) => ({
      ...f,
      buildings: (f.buildings ?? []).map((b) =>
        b.id === buildingId
          ? {
              ...b,
              floors: (b.floors ?? []).map((fl) => {
                if (fl.id !== floorId) return fl;
                const next = typeof patch === "function" ? patch(fl) : patch;
                return { ...fl, ...next };
              }),
            }
          : b,
      ),
    }));
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
    const building = emptyBuilding(apartmentProjectId, buildings.length, "building");
    building.name = buildingNameDraft.trim();
    set("buildings", [...buildings, building]);
    setOpenBuildingIds((ids) => [...ids, building.id]);
    setBuildingModalOpen(false);
    setBuildingNameDraft("");
  }

  function aptPlanLabel(apt: Apartment) {
    const num = apt.apartmentNumber?.trim();
    const house = Boolean(apt.landPlotId);
    const title = num
      ? `${house ? a.houseNumber : a.apartmentNumber} ${num}`
      : house
        ? a.unnamedHouse
        : a.unnamedUnit;
    if (house) {
      const land = apt.landArea && apt.landArea > 0 ? ` · ${a.landAreaSqm} ${apt.landArea}` : "";
      return `${title} · ${apt.rooms} ${a.roomsShort} · ${apt.area} մ²${land}`;
    }
    return `${title} · ${apt.rooms} ${a.roomsShort} · ${apt.area} մ² · ${a.floorLabel} ${apt.floor}`;
  }

  function apartmentsForFloorPlate(buildingId: string, floor: BuildingFloor) {
    const hotspotIds = new Set((floor.hotspots ?? []).map((h) => h.apartmentId));
    const trimmed = floor.label.trim();
    const labelNum = Number(trimmed);
    const numeric = trimmed !== "" && Number.isFinite(labelNum);
    return form.apartments.filter((apt) => {
      if (apt.buildingId !== buildingId) return false;
      return hotspotIds.has(apt.id) || (numeric && apt.floor === labelNum);
    });
  }

  /** All units that can be drawn on this building's floor plan (same building or unassigned). */
  function apartmentsForHotspotPicker(buildingId: string, floor: BuildingFloor) {
    const trimmed = floor.label.trim();
    const labelNum = Number(trimmed);
    const numeric = trimmed !== "" && Number.isFinite(labelNum);
    const eligible = form.apartments.filter(
      (apt) => !apt.landPlotId && (apt.buildingId === buildingId || !apt.buildingId),
    );
    return [...eligible].sort((a, b) => {
      const aFloor = numeric && a.floor === labelNum ? 0 : 1;
      const bFloor = numeric && b.floor === labelNum ? 0 : 1;
      if (aFloor !== bFloor) return aFloor - bFloor;
      const aB = a.buildingId === buildingId ? 0 : 1;
      const bB = b.buildingId === buildingId ? 0 : 1;
      if (aB !== bB) return aB - bB;
      const aHot = (floor.hotspots ?? []).some((h) => h.apartmentId === a.id) ? 0 : 1;
      const bHot = (floor.hotspots ?? []).some((h) => h.apartmentId === b.id) ? 0 : 1;
      if (aHot !== bHot) return aHot - bHot;
      return (a.apartmentNumber || "").localeCompare(b.apartmentNumber || "", undefined, {
        numeric: true,
      });
    });
  }

  function closeFloorModal() {
    setFloorModalBuildingId(null);
    setFloorModalMode("create");
    setFloorLabelDraft("");
    setFloorCloneSourceId("");
    setFloorCloneAptIds([]);
  }

  function openCreateFloorModal(buildingId: string) {
    const building = buildings.find((b) => b.id === buildingId);
    const nextIndex = building?.floors?.length ?? 0;
    setFloorModalMode("create");
    setFloorLabelDraft(String(nextIndex + 1));
    setFloorCloneSourceId("");
    setFloorCloneAptIds([]);
    setFloorModalBuildingId(buildingId);
  }

  function openDuplicateFloorModal(buildingId: string, floorId: string) {
    const building = buildings.find((b) => b.id === buildingId);
    const source = (building?.floors ?? []).find((f) => f.id === floorId);
    if (!source) return;
    const nextIndex = building?.floors?.length ?? 0;
    setFloorModalMode("duplicate");
    setFloorLabelDraft(String(nextIndex + 1));
    setFloorCloneSourceId(floorId);
    setFloorCloneAptIds(apartmentsForFloorPlate(buildingId, source).map((apt) => apt.id));
    setFloorModalBuildingId(buildingId);
    setOpenBuildingIds((ids) => (ids.includes(buildingId) ? ids : [...ids, buildingId]));
  }

  function selectFloorCloneSource(sourceId: string) {
    setFloorCloneSourceId(sourceId);
    if (!floorModalBuildingId || !sourceId) {
      setFloorCloneAptIds([]);
      return;
    }
    const building = buildings.find((b) => b.id === floorModalBuildingId);
    const source = (building?.floors ?? []).find((f) => f.id === sourceId);
    setFloorCloneAptIds(source ? apartmentsForFloorPlate(floorModalBuildingId, source).map((apt) => apt.id) : []);
  }

  function createFloorFromModal() {
    if (!floorModalBuildingId) return;
    const building = buildings.find((b) => b.id === floorModalBuildingId);
    if (!building) return;
    const floors = building.floors ?? [];
    const source = floors.find((f) => f.id === floorCloneSourceId);
    const floor = emptyBuildingFloor(floorModalBuildingId, floors.length);
    floor.label = floorLabelDraft.trim() || floor.label;

    const idMap = new Map<string, string>();
    const clonedApts: Apartment[] = [];
    if (source) {
      floor.imageUrl = source.imageUrl;
      const trimmed = floor.label.trim();
      const floorNum = Number(trimmed);
      const numeric = trimmed !== "" && Number.isFinite(floorNum);
      for (const aptId of floorCloneAptIds) {
        const src = form.apartments.find((x) => x.id === aptId);
        if (!src) continue;
        const clone = cloneApartmentPlan(src, {
          buildingId: floorModalBuildingId,
          floor: numeric ? floorNum : src.floor,
        });
        idMap.set(src.id, clone.id);
        clonedApts.push(clone);
      }
      floor.hotspots = (source.hotspots ?? [])
        .filter((h) => idMap.has(h.apartmentId))
        .map((h) => ({
          apartmentId: idMap.get(h.apartmentId)!,
          points: h.points.map(([x, y]) => [x, y] as [number, number]),
        }));
    }

    setForm((f) => {
      const next = {
        ...f,
        buildings: (f.buildings ?? []).map((b) =>
          b.id === floorModalBuildingId ? { ...b, floors: [...(b.floors ?? []), floor] } : b,
        ),
        apartments: clonedApts.length ? [...(f.apartments ?? []), ...clonedApts] : f.apartments,
      };
      formRef.current = next;
      return next;
    });
    setOpenFloorIds((ids) => [...ids, floor.id]);
    if (clonedApts.length) {
      setOpenAptIds((ids) => [...ids, ...clonedApts.map((x) => x.id)]);
    }
    setOpenBuildingIds((ids) => (ids.includes(floorModalBuildingId) ? ids : [...ids, floorModalBuildingId]));
    if (clonedApts.length) {
      toast(a.toastPlansCloned.replace("{count}", String(clonedApts.length)));
    } else if (source) {
      toast(a.toastFloorDuplicated);
    }
    closeFloorModal();
  }

  function duplicateApartment(aptId: string) {
    const source = form.apartments.find((x) => x.id === aptId);
    if (!source) return;
    const clone = cloneApartmentPlan(source);
    set("apartments", [...form.apartments, clone]);
    setOpenAptIds((ids) => [...ids, clone.id]);
    toast(a.toastPlansCloned.replace("{count}", "1"));
  }

  function openClonePlansModal() {
    setAptCloneSelectedIds([]);
    setAptCloneModalOpen(true);
  }

  function cloneSelectedApartmentPlans() {
    const sources = form.apartments.filter((apt) => aptCloneSelectedIds.includes(apt.id));
    if (sources.length === 0) return;
    const clones = sources.map((src) => cloneApartmentPlan(src));
    set("apartments", [...form.apartments, ...clones]);
    setOpenAptIds((ids) => [...ids, ...clones.map((x) => x.id)]);
    setAptCloneModalOpen(false);
    setAptCloneSelectedIds([]);
    toast(a.toastPlansCloned.replace("{count}", String(clones.length)));
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
    apt.landArea = undefined;
    apt.price = aptCreateDraft.price;
    apt.status = aptCreateDraft.status;
    if (apt.status === "Sold") apt.price = 0;
    set("apartments", [...form.apartments, apt]);
    setOpenAptIds((ids) => [...ids, apt.id]);
    if (apt.buildingId) {
      setOpenBuildingIds((ids) => (ids.includes(apt.buildingId!) ? ids : [...ids, apt.buildingId!]));
    }
    setAptModalOpen(false);
    setAptCreateDraft(emptyAptCreateDraft());
  }

  async function handleFloorImageUpload(buildingId: string, floorId: string) {
    imagePicker.pickAndUpload({
      projectId: form.id,
      onUploaded: ({ url, raw }) => {
        const finalUrl = raw.hasAlpha ? raw.url : raw.jpegUrl || raw.url || url;
        if (finalUrl) {
          updateBuildingFloor(buildingId, floorId, { imageUrl: finalUrl });
          toast("Նկարը վերբեռնվեց");
        }
      },
    });
  }

  function editFloorImage(buildingId: string, floorId: string, src: string) {
    void imagePicker.editExisting({
      src,
      projectId: form.id,
      onUploaded: ({ url, raw }) => {
        const finalUrl = raw.hasAlpha ? raw.url : raw.jpegUrl || raw.url || url;
        if (finalUrl) {
          updateBuildingFloor(buildingId, floorId, { imageUrl: finalUrl });
          toast("Նկարը թարմացվեց");
        }
      },
    });
  }

  if (!isNew && hydrated && (loadError || (!loading && !existing && !form.id))) {
    return (
      <div className={`${adminCardCls} p-8 text-center`}>
        <p className="text-[#6B7280]">{loadError || hyTranslations.projectNotFound}</p>
        <button type="button" className={cn(adminBtnSecondary, "mt-4")} onClick={() => router.push(`${ADMIN_BASE}/projects`)}>
          ← {a.cancel}
        </button>
      </div>
    );
  }

  if (!hydrated || (loading && !isNew && !form.id && !loadError)) {
    return <p className="text-sm text-[#9CA3AF]">Բեռնվում է…</p>;
  }

  async function persistProject(asDraft = false): Promise<Project | null> {
    // Flush any pending zone/form updates so we never PATCH a stale snapshot.
    flushSync(() => {
      setForm((f) => {
        formRef.current = f;
        return f;
      });
    });
    const latest = formRef.current;
    if (!latest.title.trim() && !latest.titleHy?.trim() && !latest.titleRu?.trim()) {
      toast(a.titleRequired, "error");
      return null;
    }
    const kind = effectiveProjectKind(latest);
    // Persist the kind that matches the UI so building floors are never wiped
    // while the buildings section is still shown (e.g. kind toggled to neighborhood by mistake).
    const cleanedBuildings = (latest.buildings ?? [])
      .map((b, i) => ({
        ...b,
        name: b.name.trim(),
        sortOrder: i,
        kind: "building" as const,
        exteriorImageUrl: (b.exteriorImageUrl ?? "").trim(),
        textLabels: b.textLabels ?? [],
        landArea: undefined,
        price: undefined,
        images: [],
        floors: (b.floors ?? []).map((f, fi) => ({
          ...f,
          label: f.label.trim() || String(fi + 1),
          sortOrder: fi,
          imageUrl: f.imageUrl.trim(),
          hotspots: f.hotspots ?? [],
          exteriorHotspot: f.exteriorHotspot ?? [],
          textLabels: f.textLabels ?? [],
        })),
      }))
      .filter((b) => b.name.length > 0);
    const savedBuildings = kind === "neighborhood" ? [] : cleanedBuildings;
    const buildingIds = new Set(savedBuildings.map((b) => b.id));
    const cleanedPlots = (latest.landPlots ?? [])
      .map((p, i) => ({
        ...p,
        label: p.label.trim(),
        sortOrder: i,
        points: p.points ?? [],
      }))
      .filter((p) => p.label.length > 0);
    const savedPlots = kind === "neighborhood" ? cleanedPlots : [];
    const plotIds = new Set(savedPlots.map((p) => p.id));
    const cleanedStages = (latest.mapStages ?? [])
      .map((s, i) => ({
        ...s,
        label: s.label.trim() || String(i + 1),
        sortOrder: i,
        imageUrl: (s.imageUrl ?? "").trim(),
        hotspots: s.hotspots ?? [],
        textLabels: s.textLabels ?? [],
      }))
      .filter((s) => s.label.length > 0 || s.imageUrl.length > 0 || (s.hotspots?.length ?? 0) > 0);
    const salesMode = kind === "neighborhood" ? "plans" : parseSalesMode(latest.salesMode);
    const cleanedApartments = latest.apartments.map((apt) => ({
      ...apt,
      buildingId:
        kind === "neighborhood"
          ? undefined
          : apt.buildingId && buildingIds.has(apt.buildingId)
            ? apt.buildingId
            : undefined,
      landPlotId:
        kind === "building"
          ? undefined
          : apt.landPlotId && plotIds.has(apt.landPlotId)
            ? apt.landPlotId
            : undefined,
    }));
    const payload = {
      ...latest,
      kind,
      salesMode,
      mapStages: kind === "neighborhood" ? [] : cleanedStages,
      sitePlanImage: latest.sitePlanImage ?? "",
      landPlots: savedPlots,
      buildings: savedBuildings,
      apartments: cleanedApartments,
      featured: asDraft ? false : latest.featured,
      droneVideos: (latest.droneVideos ?? []).filter((v) => v.url.trim()),
    };
    if (isNew) {
      const created = await addProject(payload as Omit<Project, "id" | "slug">);
      return created;
    }
    if (!projectId) return null;
    const updated = await updateProject(projectId, payload as Partial<Project>);
    // Re-fetch full graph so floors / hotspots match what the server actually stored.
    const full = await adminGetProject(projectId);
    const next = projectToForm(full);
    formRef.current = next;
    setForm(next);
    upsertProject(full);
    return full ?? updated;
  }

  /** Called after finishing a zone in exterior / floor / sales-map editors. */
  async function persistZoneAfterCommit(): Promise<boolean> {
    if (isNew || !projectId) {
      toast(a.toastZoneMarkedSaveProject, "info");
      // Local form already has the zone; keep draft cleared so the committed polygon shows.
      return true;
    }
    setSaving(true);
    try {
      const saved = await persistProject(false);
      if (!saved) return false;
      toast(a.toastZoneSaved);
      return true;
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
      return false;
    } finally {
      setSaving(false);
    }
  }

  async function handleSave(asDraft = false) {
    setSaving(true);
    try {
      const saved = await persistProject(asDraft);
      if (!saved) return;
      if (isNew) {
        toast(a.toastPublished);
        router.replace(`${ADMIN_BASE}/projects/${saved.id}`);
      } else {
        toast(a.toastUpdated);
      }
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

  function handleGalleryUpload() {
    imagePicker.pickAndUpload({
      projectId,
      multiple: true,
      onUploaded: ({ url }) => {
        if (!url) return;
        setForm((f) => ({ ...f, images: [...f.images, url] }));
        toast("Նկարը վերբեռնվեց");
      },
    });
  }

  function editGalleryImage(index: number) {
    const src = form.images[index];
    if (!src) return;
    void imagePicker.editExisting({
      src,
      projectId,
      onUploaded: ({ url }) => {
        if (!url) return;
        setForm((f) => ({
          ...f,
          images: f.images.map((u, i) => (i === index ? url : u)),
        }));
        toast("Նկարը թարմացվեց");
      },
    });
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
          titleHy: "",
          titleRu: "",
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

  function handleAptFloorPlanUpload(aptId: string) {
    imagePicker.pickAndUpload({
      projectId,
      onUploaded: ({ url, raw }) => {
        const finalUrl = raw.hasAlpha ? raw.url : raw.jpegUrl || raw.url || url;
        if (finalUrl) {
          updateApt(aptId, { floorPlanImage: finalUrl });
          toast("Հատակագիծը վերբեռնվեց");
        }
      },
    });
  }

  function editAptFloorPlan(aptId: string, src: string) {
    void imagePicker.editExisting({
      src,
      projectId,
      onUploaded: ({ url, raw }) => {
        const finalUrl = raw.hasAlpha ? raw.url : raw.jpegUrl || raw.url || url;
        if (finalUrl) {
          updateApt(aptId, { floorPlanImage: finalUrl });
          toast("Հատակագիծը թարմացվեց");
        }
      },
    });
  }

  function handleAptGalleryUpload(aptId: string) {
    imagePicker.pickAndUpload({
      projectId,
      multiple: true,
      onUploaded: ({ url }) => {
        if (!url) return;
        setForm((f) => ({
          ...f,
          apartments: f.apartments.map((apt) =>
            apt.id === aptId ? { ...apt, gallery: [...(apt.gallery ?? []), url] } : apt,
          ),
        }));
        toast("Լուսանկարը վերբեռնվեց");
      },
    });
  }

  function editAptGalleryImage(aptId: string, index: number) {
    const apt = form.apartments.find((x) => x.id === aptId);
    const src = apt?.gallery?.[index];
    if (!src) return;
    void imagePicker.editExisting({
      src,
      projectId,
      onUploaded: ({ url }) => {
        if (!url) return;
        setForm((f) => ({
          ...f,
          apartments: f.apartments.map((row) =>
            row.id === aptId
              ? {
                  ...row,
                  gallery: (row.gallery ?? []).map((u, i) => (i === index ? url : u)),
                }
              : row,
          ),
        }));
        toast("Լուսանկարը թարմացվեց");
      },
    });
  }

  function removeAptGalleryImage(aptId: string, index: number) {
    const apt = form.apartments.find((x) => x.id === aptId);
    if (!apt) return;
    updateApt(aptId, {
      gallery: (apt.gallery ?? []).filter((_, i) => i !== index),
    });
  }

  function updateDroneVideo(index: number, patch: Partial<{ title: string; titleHy?: string; titleRu?: string; url: string; thumbnail?: string }>) {
    const videos = [...(form.droneVideos ?? [])];
    const current = videos[index];
    if (!current) return;
    videos[index] = { ...current, ...patch };
    set("droneVideos", videos);
  }

  const floorModalBuilding = buildings.find((b) => b.id === floorModalBuildingId);
  const floorModalSourceFloors = floorModalBuilding?.floors ?? [];
  const floorCloneSource = floorModalSourceFloors.find((f) => f.id === floorCloneSourceId);
  const floorCloneCandidates =
    floorCloneSource && floorModalBuildingId
      ? apartmentsForFloorPlate(floorModalBuildingId, floorCloneSource)
      : [];

  const actionButtons = (
    <div className="flex flex-wrap items-center justify-end gap-2">
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
  );

  return (
    <div className="pb-24">
      <AdminPageHeader
        title={isNew ? a.seoNew : `${a.saveChanges}: ${form.titleHy?.trim() || form.title || "…"}`}
        breadcrumbs={[
          { label: "Վահանակ", href: ADMIN_BASE },
          { label: "Նախագծեր", href: `${ADMIN_BASE}/projects` },
          { label: isNew ? "Նոր" : "Խմբագրել" },
        ]}
        actions={
          !isNew && form.id ? (
            <ProjectViewCount
              projectId={form.id}
              count={existing?.viewCount}
              label="Դիտումներ"
              className="rounded-[5px] border border-[#E5E7EB] bg-white px-2.5 py-1.5"
            />
          ) : null
        }
      />

      <div className="space-y-4">
        <section className={cn(adminCardCls, "overflow-hidden")}>
          <div className="flex flex-wrap items-center gap-2 border-b border-[#F0F1F3] px-5 py-3.5">
            <Languages size={16} className="text-[#c9a96e]" strokeWidth={1.75} />
            <h2 className="text-sm font-semibold text-[#0c1428]">{a.langHy} / {a.langRu} / {a.langEn}</h2>
          </div>
          <div className="space-y-3 p-5">
            <p className="text-sm leading-relaxed text-[#6B7280]">{a.bilingualHint}</p>
            <div className="flex flex-wrap gap-2">
              <button type="button" className={cn(adminBtnSecondary, "h-9 text-xs")} onClick={() => fillEmptyFrom("hy")}>
                {a.fillEmptyFromHy}
              </button>
              <button type="button" className={cn(adminBtnSecondary, "h-9 text-xs")} onClick={() => fillEmptyFrom("ru")}>
                {a.fillEmptyFromRu}
              </button>
              <button type="button" className={cn(adminBtnSecondary, "h-9 text-xs")} onClick={() => fillEmptyFrom("en")}>
                {a.fillEmptyFromEn}
              </button>
            </div>
          </div>
        </section>

        <Section title={a.sectionCore} icon={Building2}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label={a.projectKind}>
              <PlanTypeToggle
                value={effectiveProjectKind(form)}
                onChange={(kind) => {
                  if (kind === "neighborhood") {
                    if (hasBuildingFloorPlates(form)) {
                      if (!window.confirm(a.switchToNeighborhoodConfirm)) return;
                      setForm((f) => ({
                        ...f,
                        kind: "neighborhood",
                        salesMode: "plans",
                        mapStages: [],
                        buildings: [],
                        apartments: (f.apartments ?? []).map((apt) => ({
                          ...apt,
                          buildingId: undefined,
                        })),
                      }));
                      return;
                    }
                    setForm((f) => ({
                      ...f,
                      kind: "neighborhood",
                      salesMode: "plans",
                      mapStages: [],
                      buildings: [],
                    }));
                    return;
                  }
                  if (hasNeighborhoodSite(form)) {
                    if (!window.confirm(a.switchToBuildingConfirm)) return;
                    setForm((f) => ({
                      ...f,
                      kind: "building",
                      salesMode: f.salesMode ?? "plans",
                      sitePlanImage: "",
                      landPlots: [],
                      apartments: (f.apartments ?? []).map((apt) => ({
                        ...apt,
                        landPlotId: undefined,
                      })),
                    }));
                    return;
                  }
                  setForm((f) => ({ ...f, kind: "building" }));
                }}
                buildingLabel={a.projectKindBuilding}
                neighborhoodLabel={a.projectKindNeighborhood}
              />
            </Field>
            {!isNeighborhoodProject(form) ? (
              <div className="md:col-span-2">
                <Field label={a.salesMode}>
                  <SalesModeToggle
                    value={parseSalesMode(form.salesMode)}
                    onChange={(mode) => set("salesMode", mode)}
                    labels={{
                      buildings: a.salesModeBuildings,
                      floors: a.salesModeFloors,
                      plans: a.salesModePlans,
                    }}
                  />
                  <p className="mt-2 text-xs text-[#9CA3AF]">{a.salesModeHint}</p>
                </Field>
              </div>
            ) : null}
            <BilingualField
              label={a.projectTitle}
              hy={form.titleHy ?? ""}
              ru={form.titleRu ?? ""}
              en={form.title}
              onHy={(v) => set("titleHy", v)}
              onRu={(v) => set("titleRu", v)}
              onEn={(v) => set("title", v)}
              placeholderHy={a.projectTitlePlaceholder}
              placeholderRu={ru.admin.projectTitlePlaceholder}
              placeholderEn={en.admin.projectTitlePlaceholder}
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
              className="md:col-span-2"
            />
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
            <BilingualField
              label={a.city}
              hy={form.cityHy ?? ""}
              ru={form.cityRu ?? ""}
              en={form.city}
              onHy={(v) => set("cityHy", v)}
              onRu={(v) => set("cityRu", v)}
              onEn={(v) => set("city", v)}
              placeholderHy="Երևան"
              placeholderRu="Ереван"
              placeholderEn="Yerevan"
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
              className="md:col-span-2"
            />
            <p className="md:col-span-2 -mt-2 text-xs text-[#9CA3AF]">{a.cityFilterHint}</p>
            <BilingualField
              label={a.fullAddress}
              hy={form.locationHy ?? ""}
              ru={form.locationRu ?? ""}
              en={form.location}
              onHy={(v) => set("locationHy", v)}
              onRu={(v) => set("locationRu", v)}
              onEn={(v) => set("location", v)}
              placeholderHy={a.addressPlaceholder}
              placeholderRu={ru.admin.addressPlaceholder}
              placeholderEn={en.admin.addressPlaceholder}
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
              className="md:col-span-2"
            />
            <BilingualField
              label={a.shortDescription}
              hy={form.descriptionHy ?? ""}
              ru={form.descriptionRu ?? ""}
              en={form.description}
              onHy={(v) => set("descriptionHy", v)}
              onRu={(v) => set("descriptionRu", v)}
              onEn={(v) => set("description", v)}
              placeholderHy={a.shortDescPlaceholder}
              placeholderRu={ru.admin.shortDescPlaceholder}
              placeholderEn={en.admin.shortDescPlaceholder}
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
              multiline
            />
            <BilingualField
              label={a.longDescription}
              hy={form.longDescriptionHy ?? ""}
              ru={form.longDescriptionRu ?? ""}
              en={form.longDescription}
              onHy={(v) => set("longDescriptionHy", v)}
              onRu={(v) => set("longDescriptionRu", v)}
              onEn={(v) => set("longDescription", v)}
              placeholderHy={a.longDescPlaceholder}
              placeholderRu={ru.admin.longDescPlaceholder}
              placeholderEn={en.admin.longDescPlaceholder}
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
              richText
            />
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
            <BilingualField
              className="col-span-2 md:col-span-3"
              label={a.constructionStart}
              hy={form.constructionStartHy ?? ""}
              ru={form.constructionStartRu ?? ""}
              en={form.constructionStart ?? ""}
              onHy={(v) => set("constructionStartHy", v)}
              onRu={(v) => set("constructionStartRu", v)}
              onEn={(v) => set("constructionStart", v)}
              placeholderHy={a.constructionStartPlaceholder}
              placeholderRu={ru.admin.constructionStartPlaceholder}
              placeholderEn={en.admin.constructionStartPlaceholder}
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
            />
            <BilingualField
              className="col-span-2 md:col-span-3"
              label={a.completionDate}
              hy={form.completionDateHy ?? ""}
              ru={form.completionDateRu ?? ""}
              en={form.completionDate}
              onHy={(v) => set("completionDateHy", v)}
              onRu={(v) => set("completionDateRu", v)}
              onEn={(v) => set("completionDate", v)}
              placeholderHy={a.completionPlaceholder}
              placeholderRu={ru.admin.completionPlaceholder}
              placeholderEn={en.admin.completionPlaceholder}
              copyHyLabel={a.copyFromOther}
              copyRuLabel={a.copyFromOther}
              copyEnLabel={a.copyFromOther}
            />
            <Field label={a.totalFloors}>
              <input
                type="number"
                className={adminInputCls}
                value={form.floors || ""}
                onChange={(e) => set("floors", +e.target.value)}
              />
            </Field>
            <Field label={a.totalApartments}>
              <input
                type="number"
                className={adminInputCls}
                value={form.totalApartments || ""}
                onChange={(e) => set("totalApartments", +e.target.value)}
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
            onEdit={editGalleryImage}
            coverBadge={a.coverBadge}
            emptyLabel={a.imagesEmpty}
            removeLabel={a.removeImage}
            editLabel={a.editImage}
          />
          <div className="mt-3 flex flex-wrap items-center gap-3">
            <button
              type="button"
              disabled={imagePicker.busy}
              className={adminBtnSecondary}
              onClick={handleGalleryUpload}
            >
              <Plus size={15} />
              {imagePicker.busy ? "Վերբեռնում…" : a.uploadImages}
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
                  <BilingualField
                    label={a.videoTitle}
                    hy={video.titleHy ?? ""}
                    ru={video.titleRu ?? ""}
                    en={video.title}
                    onHy={(v) => updateDroneVideo(index, { titleHy: v })}
                    onRu={(v) => updateDroneVideo(index, { titleRu: v })}
                    onEn={(v) => updateDroneVideo(index, { title: v })}
                    placeholderHy={a.aerialOverview}
                    placeholderRu={ru.admin.aerialOverview}
                    placeholderEn={en.admin.aerialOverview}
                    copyHyLabel={a.copyFromOther}
                    copyRuLabel={a.copyFromOther}
                    copyEnLabel={a.copyFromOther}
                    className="md:col-span-2"
                  />
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
                  { title: en.admin.aerialOverview, titleHy: a.aerialOverview, titleRu: ru.admin.aerialOverview, url: "", thumbnail: undefined },
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
            {amenityPresets.map((preset) => {
              const active = form.amenities.some((x) => amenityMatches(x, preset));
              return (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => toggleAmenity(preset)}
                  className={cn(
                    "rounded-[5px] border px-3 py-1.5 text-xs font-semibold transition-all",
                    active
                      ? "border-[#c9a96e] bg-[#c9a96e]/15 text-[#0c1428]"
                      : "border-[#E5E7EB] text-[#6B7280] hover:border-[#0c1428]",
                  )}
                >
                  {preset.labelHy}
                  <span className="ml-1.5 font-normal text-[#9CA3AF]">{preset.label}</span>
                </button>
              );
            })}
          </div>

          {customAmenities.length > 0 && (
            <div className="space-y-2">
              {customAmenities.map((item) => (
                <div
                  key={`${item.label}-${item.labelHy ?? ""}-${item.labelRu ?? ""}`}
                  className="grid grid-cols-1 gap-2 rounded-[5px] border border-[#E8EAED] bg-[#FAFAFA] p-3 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end"
                >
                  <Field label={a.customAmenityHy}>
                    <input
                      className={adminInputCls}
                      value={item.labelHy ?? ""}
                      onChange={(e) => updateCustomAmenity(item, { labelHy: e.target.value })}
                    />
                  </Field>
                  <Field label={a.customAmenityRu}>
                    <input
                      className={adminInputCls}
                      value={item.labelRu ?? ""}
                      onChange={(e) => updateCustomAmenity(item, { labelRu: e.target.value })}
                    />
                  </Field>
                  <Field label={a.customAmenityEn}>
                    <input
                      className={adminInputCls}
                      value={item.label}
                      onChange={(e) => updateCustomAmenity(item, { label: e.target.value })}
                    />
                  </Field>
                  <button
                    type="button"
                    aria-label={a.remove}
                    onClick={() => removeAmenity(item)}
                    className="inline-flex h-11 items-center justify-center gap-1 rounded-[5px] px-3 text-xs text-red-500 hover:bg-red-50"
                  >
                    <X size={13} strokeWidth={2.25} /> {a.remove}
                  </button>
                </div>
              ))}
            </div>
          )}

          {form.amenities.length === 0 && (
            <p className="text-sm text-[#9CA3AF]">{a.noAmenities}</p>
          )}

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-[1fr_1fr_1fr_auto] sm:items-end">
            <Field label={a.customAmenityHy}>
              <input
                className={adminInputCls}
                value={amenityDraftHy}
                placeholder={a.amenityPlaceholder}
                onChange={(e) => setAmenityDraftHy(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
              />
            </Field>
            <Field label={a.customAmenityRu}>
              <input
                className={adminInputCls}
                value={amenityDraftRu}
                placeholder={ru.admin.amenityPlaceholder}
                onChange={(e) => setAmenityDraftRu(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
              />
            </Field>
            <Field label={a.customAmenityEn}>
              <input
                className={adminInputCls}
                value={amenityDraftEn}
                placeholder={en.admin.amenityPlaceholder}
                onChange={(e) => setAmenityDraftEn(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addCustomAmenity();
                  }
                }}
              />
            </Field>
            <button type="button" className={adminBtnSecondary} onClick={addCustomAmenity}>
              <Plus size={15} /> {a.addAmenity}
            </button>
          </div>
        </Section>

        <Section title="SEO" icon={MapPin}>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="SEO Title">
              <input className={adminInputCls} value={seoTitle} onChange={(e) => setSeoTitle(e.target.value)} placeholder={form.titleHy || form.title} />
            </Field>
            <Field label="SEO Description">
              <input className={adminInputCls} value={seoDesc} onChange={(e) => setSeoDesc(e.target.value)} placeholder={form.descriptionHy || form.description} />
            </Field>
          </div>
        </Section>

        {isNeighborhoodProject(form) ? (
          <Section title={a.sectionNeighborhood} icon={Home}>
            <AdminNeighborhoodSection
              projectId={form.id}
              sitePlanImage={form.sitePlanImage ?? ""}
              landPlots={form.landPlots ?? []}
              apartments={form.apartments}
              onSitePlanImage={(url) => set("sitePlanImage", url)}
              onLandPlots={(plots) => set("landPlots", plots)}
              onApartments={(apts) => set("apartments", apts)}
              onToast={toast}
            />
          </Section>
        ) : (
        <>
        {usesMapStages(parseSalesMode(form.salesMode)) ? (
          <Section title={a.sectionSalesMaps} icon={Layers}>
            <p className="mb-4 text-sm text-[#6B7280]">{a.salesMapsHint}</p>
            <AdminSalesMapSection
              projectId={form.id}
              mapStages={form.mapStages ?? []}
              buildings={buildings}
              onChange={(stages) =>
                commitForm((f) => ({
                  ...f,
                  mapStages: typeof stages === "function" ? stages(f.mapStages ?? []) : stages,
                }))
              }
              onPersistZone={persistZoneAfterCommit}
              onToast={toast}
              labels={{
                sectionTitle: a.salesMapsHint,
                addRootStage: a.salesMapAddRoot,
                addChildStage: a.salesMapAddChild,
                stageLabel: a.salesMapStageLabel,
                stageImage: a.salesMapStageImage,
                uploadImage: a.salesMapUploadImage,
                removeStage: a.salesMapRemoveStage,
                hotspots: a.salesMapHotspots,
                hotspotLabel: a.salesMapHotspotLabel,
                targetType: a.salesMapTargetType,
                targetStage: a.salesMapTargetStage,
                targetBuilding: a.salesMapTargetBuilding,
                selectTarget: a.salesMapSelectTarget,
                finishPolygon: a.hotspotFinish,
                undoPoint: a.hotspotUndo,
                clearDraft: a.hotspotClear,
                removeHotspot: a.hotspotRemove,
                drawHint: a.hotspotDrawHint,
                noStages: a.salesMapNoStages,
                noBuildings: a.noBuildings,
                multiRootWarning: a.salesMapMultiRootWarning,
                zoomIn: a.hotspotZoomIn,
                zoomOut: a.hotspotZoomOut,
                zoomReset: a.hotspotZoomReset,
                panMode: a.hotspotPanMode,
                drawMode: a.hotspotDrawMode,
                textLabels: {
                  title: a.mapTextLabelsTitle,
                  add: a.textLabelAdd,
                  text: a.textLabelText,
                  color: a.textLabelColor,
                  bgColor: a.textLabelBgColor,
                  size: a.textLabelSize,
                  rotation: a.textLabelRotation,
                  place: a.textLabelPlace,
                  remove: a.textLabelRemove,
                  duplicate: a.textLabelDuplicate,
                  count: a.textLabelCount,
                  hint: a.mapTextLabelHint,
                  placeholderHy: a.textLabelPlaceholderHy,
                  placeholderEn: a.textLabelPlaceholderEn,
                  placeholderRu: a.textLabelPlaceholderRu,
                  copyFromOther: a.copyFromOther,
                },
              }}
            />
          </Section>
        ) : null}
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
              <li>{a.buildingsStep4}</li>
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

                  {usesBuildingExterior(parseSalesMode(form.salesMode)) ? (
                    <div className="border-t border-[#E8EAED] pt-3">
                      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
                        {a.buildingExterior}
                      </p>
                      <BuildingExteriorEditor
                        key={building.id}
                        projectId={form.id}
                        building={building}
                        onChange={(patch) => updateBuilding(building.id, patch)}
                        onChangeFloor={(floorId, patch) =>
                          updateBuildingFloor(building.id, floorId, patch)
                        }
                        onPersistZone={persistZoneAfterCommit}
                        onToast={toast}
                        labels={{
                          exteriorImage: a.buildingExterior,
                          uploadImage: a.buildingExteriorUpload,
                          selectFloor: a.exteriorSelectFloor,
                          drawHint: a.exteriorDrawHint,
                          finishPolygon: a.hotspotFinish,
                          undoPoint: a.hotspotUndo,
                          clearDraft: a.hotspotClear,
                          removeBand: a.exteriorRemoveBand,
                          noFloors: a.noFloorPlates,
                          zoomIn: a.hotspotZoomIn,
                          zoomOut: a.hotspotZoomOut,
                          zoomReset: a.hotspotZoomReset,
                          panMode: a.hotspotPanMode,
                          drawMode: a.hotspotDrawMode,
                          editImage: a.editImage,
                          imageEditor: imageEditorLabels,
                          textLabelsTitle: a.buildingTextLabelsTitle,
                          textLabelAdd: a.textLabelAdd,
                          textLabelText: a.textLabelText,
                          textLabelColor: a.textLabelColor,
                          textLabelBgColor: a.textLabelBgColor,
                          textLabelSize: a.textLabelSize,
                          textLabelRotation: a.textLabelRotation,
                          textLabelPlace: a.textLabelPlace,
                          textLabelRemove: a.textLabelRemove,
                          textLabelDuplicate: a.textLabelDuplicate,
                          textLabelPlaceholderHy: a.textLabelPlaceholderHy,
                          textLabelPlaceholderEn: a.textLabelPlaceholderEn,
                          textLabelPlaceholderRu: a.textLabelPlaceholderRu,
                          copyFromOther: a.copyFromOther,
                          textLabelCount: a.textLabelCount,
                          textLabelHint: a.buildingTextLabelHint,
                        }}
                      />
                    </div>
                  ) : null}

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
                      const floorApts = apartmentsForFloorPlate(building.id, floor);
                      const hotspotPickerApts = apartmentsForHotspotPicker(building.id, floor);
                      return (
                        <AccordionItem
                          key={floor.id}
                          open={floorOpen}
                          onToggle={() => setOpenFloorIds((ids) => toggleId(ids, floor.id))}
                          title={`${a.floorLabelField}: ${floor.label.trim() || "-"}`}
                          meta={
                            <>
                              {floor.imageUrl.trim() ? a.hasFloorImage : a.noFloorImage}
                              {" · "}
                              {floorApts.length} {a.plansAttached}
                            </>
                          }
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
                                disabled={imagePicker.busy}
                                className={cn(adminBtnSecondary, "h-11")}
                                onClick={() => handleFloorImageUpload(building.id, floor.id)}
                              >
                                {a.uploadFloorImage}
                              </button>
                              <button
                                type="button"
                                className={cn(adminBtnSecondary, "h-11")}
                                onClick={() => openDuplicateFloorModal(building.id, floor.id)}
                              >
                                <Copy size={14} /> {a.duplicateFloor}
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
                              editLabel={a.editImage}
                              onEdit={() => editFloorImage(building.id, floor.id, floor.imageUrl)}
                              onRemove={() =>
                                updateBuildingFloor(building.id, floor.id, {
                                  imageUrl: "",
                                  hotspots: [],
                                  textLabels: [],
                                })
                              }
                            />
                          ) : null}
                          <FloorHotspotEditor
                            key={`${building.id}:${floor.id}`}
                            floor={floor}
                            apartments={hotspotPickerApts}
                            onPersistZone={persistZoneAfterCommit}
                            onToast={toast}
                            onChange={(patch) => {
                              commitForm((f) => {
                                let hotspotIds = new Set<string>();
                                const buildings = (f.buildings ?? []).map((b) => {
                                  if (b.id !== building.id) return b;
                                  return {
                                    ...b,
                                    floors: (b.floors ?? []).map((fl) => {
                                      if (fl.id !== floor.id) return fl;
                                      const resolved = typeof patch === "function" ? patch(fl) : patch;
                                      if (resolved.hotspots) {
                                        hotspotIds = new Set(resolved.hotspots.map((h) => h.apartmentId));
                                      }
                                      return { ...fl, ...resolved };
                                    }),
                                  };
                                });
                                return {
                                  ...f,
                                  buildings,
                                  apartments: f.apartments.map((apt) =>
                                    hotspotIds.has(apt.id) && !apt.buildingId
                                      ? { ...apt, buildingId: building.id }
                                      : apt,
                                  ),
                                };
                              });
                            }}
                            onAddApartment={(options) => {
                              const trimmed = floor.label.trim();
                              const floorNum = Number(trimmed);
                              const apt = emptyApartment(apartmentProjectId, building.id);
                              apt.floor = Number.isFinite(floorNum) ? floorNum : 1;
                              if (options?.sold) {
                                apt.status = "Sold";
                                apt.price = 0;
                              }
                              set("apartments", [...form.apartments, apt]);
                              setOpenAptIds((ids) => [...ids, apt.id]);
                              setOpenBuildingIds((ids) =>
                                ids.includes(building.id) ? ids : [...ids, building.id],
                              );
                              setOpenFloorIds((ids) =>
                                ids.includes(floor.id) ? ids : [...ids, floor.id],
                              );
                            }}
                            onApartmentStatusChange={(aptId, status) =>
                              updateApt(aptId, {
                                status,
                                ...(status === "Sold"
                                  ? { price: 0, floorPlanImage: "", planPdfUrl: "", gallery: [] }
                                  : {}),
                              })
                            }
                            labels={{
                              selectApartment: a.hotspotSelectApartment,
                              drawHint: a.hotspotDrawHint,
                              finishPolygon: a.hotspotFinish,
                              undoPoint: a.hotspotUndo,
                              clearDraft: a.hotspotClear,
                              removeHotspot: a.hotspotRemove,
                              noApartments: a.hotspotNoApartments,
                              hotspotCount: a.hotspotCount,
                              zoomIn: a.hotspotZoomIn,
                              zoomOut: a.hotspotZoomOut,
                              zoomReset: a.hotspotZoomReset,
                              panMode: a.hotspotPanMode,
                              drawMode: a.hotspotDrawMode,
                              addApartmentOnFloor: a.addApartmentOnFloor,
                              markAsSold: a.markAsSold,
                              soldZoneHint: a.soldZoneHint,
                              textLabelsTitle: a.textLabelsTitle,
                              textLabelAdd: a.textLabelAdd,
                              textLabelText: a.textLabelText,
                              textLabelColor: a.textLabelColor,
                              textLabelBgColor: a.textLabelBgColor,
                              textLabelSize: a.textLabelSize,
                              textLabelRotation: a.textLabelRotation,
                              textLabelPlace: a.textLabelPlace,
                              textLabelRemove: a.textLabelRemove,
                              textLabelDuplicate: a.textLabelDuplicate,
                              textLabelPlaceholderHy: a.textLabelPlaceholderHy,
                              textLabelPlaceholderEn: a.textLabelPlaceholderEn,
                              textLabelPlaceholderRu: a.textLabelPlaceholderRu,
                              copyFromOther: a.copyFromOther,
                              textLabelCount: a.textLabelCount,
                              textLabelHint: a.textLabelHint,
                              hotspotLabelText: a.hotspotLabelText,
                              hotspotLabelColor: a.hotspotLabelColor,
                              hotspotLabelBgColor: a.hotspotLabelBgColor,
                              hotspotLabelSize: a.hotspotLabelSize,
                              hotspotLabelRotation: a.hotspotLabelRotation,
                              hotspotLabelPlace: a.hotspotLabelPlace,
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
              {form.apartments.length > 0 ? (
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-8 px-3 text-xs")}
                  onClick={openClonePlansModal}
                >
                  <Copy size={14} /> {a.clonePlans}
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
              const parentBuilding = buildings.find((b) => b.id === apt.buildingId);
              const house = Boolean(apt.landPlotId);
              const buildingName = parentBuilding?.name.trim() || a.noBuildingAssigned;
              const isOpen = openAptIds.includes(apt.id);
              return (
                <div key={apt.id} id={`admin-unit-${apt.id}`}>
                <AccordionItem
                  open={isOpen}
                  onToggle={() => setOpenAptIds((ids) => toggleId(ids, apt.id))}
                  title={
                    apt.apartmentNumber?.trim()
                      ? `${house ? a.houseNumber : a.apartmentNumber} ${apt.apartmentNumber}`
                      : house
                        ? a.unnamedHouse
                        : a.unnamedUnit
                  }
                  meta={
                    <>
                      {buildingName}
                      {house ? null : (
                        <>
                          {" · "}
                          {a.floorLabel} {apt.floor}
                        </>
                      )}
                      {" · "}
                      {apt.rooms} {a.roomsShort}
                      {" · "}
                      {apt.area} մ²
                      {house && apt.landArea ? ` · ${apt.landArea} մ²` : ""}
                    </>
                  }
                >
                  <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-7">
                    <Field label={house ? a.houseNumber : a.apartmentNumber}>
                      <input
                        className={adminInputCls}
                        value={apt.apartmentNumber ?? ""}
                        placeholder={house ? a.houseNumberPlaceholder : a.apartmentNumberPlaceholder}
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
                    {house ? (
                      <Field label={a.landAreaSqm}>
                        <input
                          type="number"
                          className={adminInputCls}
                          value={apt.landArea ?? 0}
                          onChange={(e) => updateApt(apt.id, { landArea: +e.target.value })}
                        />
                      </Field>
                    ) : (
                      <Field label={a.floorLabel}>
                        <input
                          type="number"
                          className={adminInputCls}
                          value={apt.floor}
                          onChange={(e) => updateApt(apt.id, { floor: +e.target.value })}
                        />
                      </Field>
                    )}
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
                        disabled={apt.status === "Sold"}
                        onChange={(e) => updateApt(apt.id, { price: +e.target.value })}
                      />
                    </Field>
                    <Field label={hyTranslations.filter.status}>
                      <select
                        className={adminSelectCls}
                        value={apt.status}
                        onChange={(e) => {
                          const status = e.target.value as ApartmentStatus;
                          updateApt(apt.id, {
                            status,
                            ...(status === "Sold"
                              ? { price: 0, floorPlanImage: "", planPdfUrl: "", gallery: [] }
                              : {}),
                          });
                        }}
                      >
                        <option value="Available">{getStatusLabel(hyTranslations, "Available")}</option>
                        <option value="Reserved">{getStatusLabel(hyTranslations, "Reserved")}</option>
                        <option value="Sold">{getStatusLabel(hyTranslations, "Sold")}</option>
                      </select>
                    </Field>
                  </div>
                  <div className="flex justify-end gap-3">
                    <button
                      type="button"
                      onClick={() => duplicateApartment(apt.id)}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#c9a96e] hover:text-[#a88a52]"
                    >
                      <Copy size={14} /> {a.duplicateUnit}
                    </button>
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
                    {apt.status !== "Sold" ? (
                    <BilingualField
                      label={a.viewType}
                      hy={apt.viewTypeHy ?? ""}
                      ru={apt.viewTypeRu ?? ""}
                      en={apt.viewType}
                      onHy={(v) => updateApt(apt.id, { viewTypeHy: v })}
                      onRu={(v) => updateApt(apt.id, { viewTypeRu: v })}
                      onEn={(v) => updateApt(apt.id, { viewType: v })}
                      placeholderHy={a.viewTypePlaceholder}
                      placeholderRu={ru.admin.viewTypePlaceholder}
                      placeholderEn={en.admin.viewTypePlaceholder}
                      copyHyLabel={a.copyFromOther}
                      copyRuLabel={a.copyFromOther}
                      copyEnLabel={a.copyFromOther}
                      className="md:col-span-3"
                    />
                    ) : null}
                    {apt.status === "Sold" ? (
                      <p className="md:col-span-3 text-xs leading-relaxed text-[#6B7280]">
                        {a.soldZoneOnlyHint}
                      </p>
                    ) : (
                      <>
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
                          disabled={imagePicker.busy}
                          className={cn(adminBtnSecondary, "h-11")}
                          onClick={() => handleAptFloorPlanUpload(apt.id)}
                        >
                          {a.uploadFloorImage}
                        </button>
                      </div>
                      {apt.floorPlanImage.trim() ? (
                        <div className="mt-2 max-w-xs">
                          <AdminImageThumb
                            src={apt.floorPlanImage}
                            className="aspect-[4/3]"
                            imgClassName="object-contain bg-[#FAFAF8]"
                            removeLabel={a.removeImage}
                            editLabel={a.editImage}
                            onEdit={() => editAptFloorPlan(apt.id, apt.floorPlanImage)}
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
                      </>
                    )}
                  </div>
                  {apt.status === "Sold" ? null : (
                  <>
                  <BilingualField
                    label={a.unitDescription}
                    hy={apt.descriptionHy ?? ""}
                    ru={apt.descriptionRu ?? ""}
                    en={apt.description ?? ""}
                    onHy={(v) => updateApt(apt.id, { descriptionHy: v })}
                    onRu={(v) => updateApt(apt.id, { descriptionRu: v })}
                    onEn={(v) => updateApt(apt.id, { description: v })}
                    placeholderHy={a.unitDescriptionPlaceholder}
                    placeholderRu={ru.admin.unitDescriptionPlaceholder}
                    placeholderEn={en.admin.unitDescriptionPlaceholder}
                    copyHyLabel={a.copyFromOther}
                    copyRuLabel={a.copyFromOther}
                    copyEnLabel={a.copyFromOther}
                    multiline
                  />
                  <div className="space-y-2 rounded-[5px] border border-[#E8EAED] bg-white p-3">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-[#0c1428]">{a.galleryImages}</p>
                      <button
                        type="button"
                        disabled={imagePicker.busy}
                        className={cn(adminBtnSecondary, "h-9 text-xs")}
                        onClick={() => handleAptGalleryUpload(apt.id)}
                      >
                        <Plus size={14} />
                        {a.uploadImages}
                      </button>
                    </div>
                    <AdminImageGrid
                      urls={apt.gallery ?? []}
                      onRemove={(index) => removeAptGalleryImage(apt.id, index)}
                      onEdit={(index) => editAptGalleryImage(apt.id, index)}
                      emptyLabel={a.aptGalleryEmpty}
                      removeLabel={a.removeImage}
                      editLabel={a.editImage}
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
                      PDF կցված է-{" "}
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
                  </>
                  )}
                </AccordionItem>
                </div>
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
            {form.apartments.length === 0 ? (
              <p className="text-sm text-[#9CA3AF]">{a.noApartments}</p>
            ) : null}
          </div>
        </Section>
        </>
        )}
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
        title={floorModalMode === "duplicate" ? a.duplicateFloorTitle : a.newFloorPlateTitle}
        onClose={closeFloorModal}
        wide
        footer={
          <>
            <button type="button" className={adminBtnSecondary} onClick={closeFloorModal}>
              {a.cancel}
            </button>
            <button type="button" className={adminBtnPrimary} onClick={createFloorFromModal}>
              {floorModalMode === "duplicate" ? a.duplicateFloor : a.createFloorPlate}
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
        {floorModalSourceFloors.length > 0 ? (
          <>
            <Field label={a.copyFromFloor}>
              <select
                className={adminSelectCls}
                value={floorCloneSourceId}
                onChange={(e) => selectFloorCloneSource(e.target.value)}
              >
                <option value="">{a.copyFromFloorNone}</option>
                {floorModalSourceFloors.map((f) => (
                  <option key={f.id} value={f.id}>
                    {a.floorLabelField}: {f.label.trim() || "-"}
                    {f.imageUrl.trim() ? ` · ${a.hasFloorImage}` : ` · ${a.noFloorImage}`}
                  </option>
                ))}
              </select>
            </Field>
            {floorCloneSource ? (
              <>
                <p className="text-xs leading-relaxed text-[#6B7280]">{a.duplicateFloorHint}</p>
                <Field label={a.selectPlansToClone}>
                  <PlanPicker
                    apartments={floorCloneCandidates}
                    selectedIds={floorCloneAptIds}
                    onChange={setFloorCloneAptIds}
                    itemLabel={aptPlanLabel}
                  />
                </Field>
              </>
            ) : null}
          </>
        ) : null}
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
                setAptCreateDraft((d) => ({
                  ...d,
                  status: e.target.value as ApartmentStatus,
                  ...(e.target.value === "Sold" ? { price: 0 } : {}),
                }))
              }
            >
              <option value="Available">{getStatusLabel(hyTranslations, "Available")}</option>
              <option value="Reserved">{getStatusLabel(hyTranslations, "Reserved")}</option>
              <option value="Sold">{getStatusLabel(hyTranslations, "Sold")}</option>
            </select>
          </Field>
        </div>
      </AdminModal>

      <AdminModal
        open={aptCloneModalOpen}
        title={a.clonePlansTitle}
        onClose={() => setAptCloneModalOpen(false)}
        wide
        footer={
          <>
            <button type="button" className={adminBtnSecondary} onClick={() => setAptCloneModalOpen(false)}>
              {a.cancel}
            </button>
            <button
              type="button"
              className={adminBtnPrimary}
              disabled={aptCloneSelectedIds.length === 0}
              onClick={cloneSelectedApartmentPlans}
            >
              {a.cloneSelected}
            </button>
          </>
        }
      >
        <p className="text-xs leading-relaxed text-[#6B7280]">{a.clonePlansHint}</p>
        <Field label={a.selectPlansToClone}>
          <PlanPicker
            apartments={form.apartments}
            selectedIds={aptCloneSelectedIds}
            onChange={setAptCloneSelectedIds}
            itemLabel={aptPlanLabel}
          />
        </Field>
      </AdminModal>

      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-[#E8EAED] bg-white/95 pl-0 backdrop-blur-md lg:pl-[var(--admin-sidebar-w,260px)]">
        <div className="px-4 py-3 sm:px-6 lg:px-8">{actionButtons}</div>
      </div>
      {imagePicker.ui}
    </div>
  );
}
