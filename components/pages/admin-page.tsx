import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Image as ImageIcon, Video, Building2, Home, MapPin,
  DollarSign, Layers, Star, ArrowLeft, Eye,
  GripVertical, AlertTriangle, CheckCircle, Link as LinkIcon, Database,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Seo } from "@/components/seo/Seo";
import { useProjects } from "@/lib/projects-context";
import { runAirtableSetupFromAdmin } from "@/app/admin-lx9k2m/actions";
import { formatPrice } from "@/lib/format-price";
import { emptyProject, emptyApartment, generateId } from "@/lib/store";
import type { Project, Apartment, ProjectStatus, ApartmentStatus } from "@/types";
import { hyTranslations } from "@/content/hy";
import { getStatusLabel } from "@/lib/i18n";

/** Admin UI is always Armenian — independent of public site language. */
const a = hyTranslations.admin;
const hy = hyTranslations;

function fmt(template: string, vars: Record<string, string | number>): string {
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v)),
    template,
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminView = "list" | "edit" | "new";

interface Toast { id: string; msg: string; type: "success" | "error" }

function RemotePreviewImage({ src, sizes }: { src: string; sizes: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#060d1a] px-1 text-center text-[9px] text-[#5a6a7e]">
        {a.invalidUrl}
      </div>
    );
  }
  return (
    <Image
      src={src}
      alt=""
      fill
      unoptimized
      sizes={sizes}
      className="object-cover"
      onError={() => setVisible(false)}
    />
  );
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const INPUT_CLS = "w-full bg-[#060d1a] border border-[#1e2d45] rounded-lg px-4 py-3 text-sm text-[#f0ece4] placeholder-[#3a4d63] outline-none focus:border-[#c9a96e] transition-colors";
const LABEL_CLS = "text-xs tracking-[0.15em] uppercase text-[#5a6a7e] mb-2 block font-medium";
const SELECT_CLS = INPUT_CLS + " appearance-none cursor-pointer";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {children}
    </div>
  );
}

function Section({ title, children, icon: Icon }: { title: string; children: React.ReactNode; icon?: React.ElementType }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="bg-[#0a1628] border border-[#1e2d45] rounded-xl overflow-hidden mb-4">
      <button
        type="button"
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#0d1a30] transition-colors"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center gap-3">
          {Icon && <Icon size={16} className="text-[#c9a96e]" />}
          <span className="text-sm font-medium text-[#f0ece4] tracking-wide">{title}</span>
        </div>
        {open ? <ChevronUp size={16} className="text-[#5a6a7e]" /> : <ChevronDown size={16} className="text-[#5a6a7e]" />}
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-6 pb-6 pt-2 border-t border-[#1e2d45] grid gap-4">
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Image/URL list editor ────────────────────────────────────────────────────

function UrlList({ label, values, onChange, placeholder, hint }: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
  hint?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val) { onChange([...values, val]); setInput(""); }
  };
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      {hint ? <p className="text-[10px] text-[#5a6a7e] mt-1 mb-2 leading-relaxed">{hint}</p> : null}
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          inputMode="url"
          autoComplete="off"
          className={INPUT_CLS}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? "https://…"}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
        />
        <button type="button" onClick={add} className="px-4 py-2 bg-[#c9a96e] text-[#0C1428] rounded-lg hover:bg-[#e8d5b0] transition-colors shrink-0">
          <Plus size={16} />
        </button>
      </div>
      <div className="space-y-2">
        {values.map((url, i) => (
          <div key={i} className="flex items-center gap-2 bg-[#060d1a] border border-[#1e2d45] rounded-lg px-3 py-2">
            <LinkIcon size={12} className="text-[#5a6a7e] shrink-0" />
            <span className="text-xs text-[#9a9085] flex-1 truncate">{url}</span>
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-[#3a4d63] hover:text-red-400 transition-colors">
              <X size={14} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Tags editor ──────────────────────────────────────────────────────────────

function TagsEditor({ values, onChange }: { values: string[]; onChange: (v: string[]) => void }) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim().toLowerCase();
    if (val && !values.includes(val)) { onChange([...values, val]); setInput(""); }
  };
  return (
    <div>
      <label className={LABEL_CLS}>{a.tags}</label>
      <div className="flex gap-2 mb-3">
        <input className={INPUT_CLS} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder={a.tagsPlaceholder} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
        <button type="button" onClick={add} className="px-4 py-2 bg-[#c9a96e] text-[#0C1428] rounded-lg hover:bg-[#e8d5b0] transition-colors shrink-0">
          <Plus size={16} />
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {values.map((tag, i) => (
          <span key={i} className="flex items-center gap-1.5 px-3 py-1 bg-[#162035] border border-[#1e2d45] rounded-full text-xs text-[#9a9085]">
            {tag}
            <button type="button" onClick={() => onChange(values.filter((_, j) => j !== i))} className="text-[#3a4d63] hover:text-red-400">
              <X size={12} />
            </button>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── Apartments editor ────────────────────────────────────────────────────────

function ApartmentsEditor({ projectId, apartments, onChange }: {
  projectId: string;
  apartments: Apartment[];
  onChange: (a: Apartment[]) => void;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);

  const add = () => {
    const apt = emptyApartment(projectId);
    onChange([...apartments, apt]);
    setExpanded(apt.id);
  };

  const update = (id: string, data: Partial<Apartment>) => {
    onChange(apartments.map((a) => (a.id === id ? { ...a, ...data } : a)));
  };

  const remove = (id: string) => {
    onChange(apartments.filter((a) => a.id !== id));
    if (expanded === id) setExpanded(null);
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <label className={LABEL_CLS + " mb-0"}>{fmt(a.apartmentsCount, { count: apartments.length })}</label>
        <button type="button" onClick={add}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#c9a96e] text-[#0C1428] rounded-lg text-xs font-medium hover:bg-[#e8d5b0] transition-colors">
          <Plus size={13} /> {a.addUnit}
        </button>
      </div>

      <div className="space-y-2">
        {apartments.map((apt) => (
          <div key={apt.id} className="border border-[#1e2d45] rounded-xl overflow-hidden">
            <button
              type="button"
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#0a1628] transition-colors text-left"
              onClick={() => setExpanded(expanded === apt.id ? null : apt.id)}
            >
              <GripVertical size={14} className="text-[#3a4d63]" />
              <Home size={14} className="text-[#c9a96e]" />
              <span className="text-sm text-[#f0ece4] flex-1">
                {apt.rooms} {a.roomsShort} · {a.floorLabel} {apt.floor} · {apt.area}m² · {formatPrice(apt.price)}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                apt.status === "Available" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
                : apt.status === "Reserved" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/5"
                : "text-red-400 border-red-400/30 bg-red-400/5"
              }`}>{getStatusLabel(hy, apt.status)}</span>
              <button type="button" onClick={(e) => { e.stopPropagation(); remove(apt.id); }} className="text-[#3a4d63] hover:text-red-400 transition-colors ml-1">
                <Trash2 size={14} />
              </button>
              {expanded === apt.id ? <ChevronUp size={14} className="text-[#5a6a7e]" /> : <ChevronDown size={14} className="text-[#5a6a7e]" />}
            </button>

            <AnimatePresence initial={false}>
              {expanded === apt.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="border-t border-[#1e2d45] px-4 py-4 grid grid-cols-2 md:grid-cols-3 gap-4">
                    <Field label={a.rooms}>
                      <input type="number" className={INPUT_CLS} value={apt.rooms} min={1} max={10}
                        onChange={(e) => update(apt.id, { rooms: +e.target.value })} />
                    </Field>
                    <Field label={a.floorLabel}>
                      <input type="number" className={INPUT_CLS} value={apt.floor} min={1}
                        onChange={(e) => update(apt.id, { floor: +e.target.value })} />
                    </Field>
                    <Field label={a.areaSqm}>
                      <input type="number" className={INPUT_CLS} value={apt.area}
                        onChange={(e) => update(apt.id, { area: +e.target.value })} />
                    </Field>
                    <Field label={a.priceAmd}>
                      <input type="number" className={INPUT_CLS} value={apt.price}
                        onChange={(e) => update(apt.id, { price: +e.target.value })} />
                    </Field>
                    <Field label={hy.filter.status}>
                      <select className={SELECT_CLS} value={apt.status}
                        onChange={(e) => update(apt.id, { status: e.target.value as ApartmentStatus })}>
                        <option value="Available">{getStatusLabel(hy, "Available")}</option>
                        <option value="Reserved">{getStatusLabel(hy, "Reserved")}</option>
                        <option value="Sold">{getStatusLabel(hy, "Sold")}</option>
                      </select>
                    </Field>
                    <Field label={a.viewType}>
                      <input className={INPUT_CLS} value={apt.viewType} placeholder={a.viewTypePlaceholder}
                        onChange={(e) => update(apt.id, { viewType: e.target.value })} />
                    </Field>
                    <div className="col-span-2 md:col-span-3">
                      <UrlList label={a.galleryImages} values={apt.gallery}
                        onChange={(v) => update(apt.id, { gallery: v })}
                        placeholder="https://images.unsplash.com/…"
                        hint={a.urlHintHttps}
                      />
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <Field label={a.floorPlanUrl}>
                        <input type="text" inputMode="url" autoComplete="off" className={INPUT_CLS} value={apt.floorPlanImage} placeholder="https://…"
                          onChange={(e) => update(apt.id, { floorPlanImage: e.target.value })} />
                      </Field>
                    </div>
                    <Field label={a.balcony}>
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <div
                          className={`w-10 h-6 rounded-full transition-colors ${apt.balcony ? "bg-[#c9a96e]" : "bg-[#1e2d45]"}`}
                          onClick={() => update(apt.id, { balcony: !apt.balcony })}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${apt.balcony ? "translate-x-5" : "translate-x-1"}`} />
                        </div>
                        <span className="text-xs text-[#9a9085]">{apt.balcony ? a.yes : a.no}</span>
                      </label>
                    </Field>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
        {apartments.length === 0 && (
          <p className="text-center text-[#3a4d63] text-xs py-6 border border-dashed border-[#1e2d45] rounded-xl">
            {a.noApartments}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Drone Videos editor ──────────────────────────────────────────────────────

function DroneVideosEditor({ values, onChange }: {
  values: { title: string; url: string; thumbnail?: string }[];
  onChange: (v: { title: string; url: string; thumbnail?: string }[]) => void;
}) {
  const add = () => onChange([...values, { title: "", url: "", thumbnail: "" }]);
  const update = (i: number, data: Partial<{ title: string; url: string; thumbnail: string }>) =>
    onChange(values.map((v, j) => (j === i ? { ...v, ...data } : v)));
  const remove = (i: number) => onChange(values.filter((_, j) => j !== i));

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div>
          <label className={LABEL_CLS + " mb-0"}>{a.droneVideos}</label>
          <p className="text-[10px] text-[#5a6a7e] mt-1 leading-relaxed max-w-xl">
            {a.droneVideosHint}
          </p>
        </div>
        <button type="button" onClick={add}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#c9a96e] text-[#0C1428] rounded-lg text-xs font-medium hover:bg-[#e8d5b0] transition-colors">
          <Plus size={13} /> {a.addVideo}
        </button>
      </div>
      <div className="space-y-3">
        {values.map((v, i) => (
          <div key={i} className="bg-[#060d1a] border border-[#1e2d45] rounded-xl p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={14} className="text-[#c9a96e]" />
                <span className="text-xs text-[#9a9085]">{fmt(a.videoN, { n: i + 1 })}</span>
              </div>
              <button type="button" onClick={() => remove(i)} className="text-[#3a4d63] hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <Field label={a.videoTitle}>
              <input className={INPUT_CLS} value={v.title} placeholder={a.aerialOverview}
                onChange={(e) => update(i, { title: e.target.value })} />
            </Field>
            <Field label={a.youtubeEmbed}>
              <input type="text" inputMode="url" autoComplete="off" className={INPUT_CLS} value={v.url} placeholder="https://www.youtube.com/embed/…"
                onChange={(e) => update(i, { url: e.target.value })} />
            </Field>
            <Field label={a.thumbnailOptional}>
              <input type="text" inputMode="url" autoComplete="off" className={INPUT_CLS} value={v.thumbnail ?? ""} placeholder="https://…"
                onChange={(e) => update(i, { thumbnail: e.target.value })} />
            </Field>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-center text-[#3a4d63] text-xs py-4 border border-dashed border-[#1e2d45] rounded-xl">
            {a.noDroneVideos}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Amenities editor ─────────────────────────────────────────────────────────

const AMENITY_OPTIONS = [
  { icon: "Waves", label: a.amenityPool },
  { icon: "Dumbbell", label: a.amenityGym },
  { icon: "Car", label: a.amenityParking },
  { icon: "Shield", label: a.amenitySecurity },
  { icon: "Leaf", label: a.amenityGarden },
  { icon: "UtensilsCrossed", label: a.amenityRestaurant },
  { icon: "Wifi", label: a.amenityWifi },
  { icon: "Zap", label: a.amenitySmartHome },
];

function AmenitiesEditor({ values, onChange }: {
  values: { icon: string; label: string }[];
  onChange: (v: { icon: string; label: string }[]) => void;
}) {
  const toggle = (opt: { icon: string; label: string }) => {
    const exists = values.some((v) => v.icon === opt.icon);
    onChange(exists ? values.filter((v) => v.icon !== opt.icon) : [...values, opt]);
  };
  return (
    <div>
      <label className={LABEL_CLS}>{a.amenities}</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
        {AMENITY_OPTIONS.map((opt) => {
          const active = values.some((v) => v.icon === opt.icon);
          return (
            <button
              key={opt.icon}
              type="button"
              onClick={() => toggle(opt)}
              className={`px-3 py-2 rounded-lg border text-xs transition-all ${
                active
                  ? "bg-[#c9a96e]/15 border-[#c9a96e] text-[#c9a96e]"
                  : "bg-[#060d1a] border-[#1e2d45] text-[#5a6a7e] hover:border-[#c9a96e]/40"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── Project Form ─────────────────────────────────────────────────────────────

function ProjectForm({
  initial,
  onSave,
  onCancel,
  isNew,
}: {
  initial: Omit<Project, "id" | "slug"> & { id?: string; slug?: string };
  onSave: (data: Omit<Project, "id" | "slug"> & { id?: string; slug?: string }) => void | Promise<void>;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));
  const apartmentProjectId = useMemo(() => initial.id ?? generateId(), [initial.id]);

  return (
    <form
      onSubmit={async (e) => {
        e.preventDefault();
        await onSave(form);
      }}
      className="space-y-2"
    >
      {/* Core info */}
      <Section title={a.sectionCore} icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={a.projectTitle}>
            <input required className={INPUT_CLS} value={form.title} placeholder={a.projectTitlePlaceholder}
              onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label={a.developer}>
            <input className={INPUT_CLS} value={form.developer} onChange={(e) => set("developer", e.target.value)} />
          </Field>
          <Field label={a.architect}>
            <input className={INPUT_CLS} value={form.architect ?? ""} placeholder={a.architectPlaceholder}
              onChange={(e) => set("architect", e.target.value)} />
          </Field>
          <Field label={a.city}>
            <input className={INPUT_CLS} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label={a.fullAddress}>
              <input className={INPUT_CLS} value={form.location} placeholder={a.addressPlaceholder}
                onChange={(e) => set("location", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label={a.shortDescription}>
            <textarea rows={2} className={INPUT_CLS} value={form.description} placeholder={a.shortDescPlaceholder}
              onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label={a.longDescription}>
            <textarea rows={2} className={INPUT_CLS} value={form.longDescription} placeholder={a.longDescPlaceholder}
              onChange={(e) => set("longDescription", e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Pricing & Status */}
      <Section title={a.sectionPricing} icon={DollarSign}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label={a.startingPrice}>
            <input required type="number" className={INPUT_CLS} value={form.startingPrice || ""}
              placeholder={a.startingPricePlaceholder} onChange={(e) => set("startingPrice", +e.target.value)} />
          </Field>
          <Field label={hy.filter.status}>
            <select className={SELECT_CLS} value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
              <option value="Under Construction">{getStatusLabel(hy, "Under Construction")}</option>
              <option value="Ready">{getStatusLabel(hy, "Ready")}</option>
              <option value="Sold Out">{getStatusLabel(hy, "Sold Out")}</option>
            </select>
          </Field>
          <Field label={a.completionDate}>
            <input className={INPUT_CLS} value={form.completionDate} placeholder={a.completionPlaceholder}
              onChange={(e) => set("completionDate", e.target.value)} />
          </Field>
          <Field label={a.totalFloors}>
            <input type="number" className={INPUT_CLS} value={form.floors || ""} min={1}
              onChange={(e) => set("floors", +e.target.value)} />
          </Field>
          <Field label={a.totalApartments}>
            <input type="number" className={INPUT_CLS} value={form.totalApartments || ""} min={0}
              onChange={(e) => set("totalApartments", +e.target.value)} />
          </Field>
          <Field label={a.availableUnits}>
            <input type="number" className={INPUT_CLS} value={form.availableApartmentsCount || ""} min={0}
              onChange={(e) => set("availableApartmentsCount", +e.target.value)} />
          </Field>
        </div>
        <div className="flex items-center gap-3">
          <div
            className={`w-11 h-6 rounded-full transition-colors cursor-pointer ${form.featured ? "bg-[#c9a96e]" : "bg-[#1e2d45]"}`}
            onClick={() => set("featured", !form.featured)}
          >
            <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${form.featured ? "translate-x-6" : "translate-x-1"}`} />
          </div>
          <span className="text-sm text-[#9a9085]">{a.featuredHomepage}</span>
          <Star size={14} className={form.featured ? "text-[#c9a96e]" : "text-[#3a4d63]"} />
        </div>
      </Section>

      {/* Images */}
      <Section title={a.sectionImages} icon={ImageIcon}>
        <UrlList
          label={a.projectImages}
          values={form.images}
          onChange={(v) => set("images", v)}
          placeholder="https://images.unsplash.com/photo-…?w=1200&q=80"
          hint={a.urlHintHttps}
        />
        {form.images[0] && (
          <div className="grid grid-cols-3 md:grid-cols-5 gap-2 mt-2">
            {form.images.slice(0, 5).map((img, i) => (
              <div key={i} className="relative aspect-video overflow-hidden rounded-lg border border-[#1e2d45] bg-[#060d1a]">
                <RemotePreviewImage src={img} sizes="120px" />
              </div>
            ))}
          </div>
        )}
      </Section>

      {/* Drone Videos */}
      <Section title={a.sectionDrone} icon={Video}>
        <DroneVideosEditor
          values={form.droneVideos ?? []}
          onChange={(v) => set("droneVideos", v)}
        />
      </Section>

      {/* Amenities */}
      <Section title={a.sectionAmenities} icon={Layers}>
        <AmenitiesEditor values={form.amenities} onChange={(v) => set("amenities", v)} />
      </Section>

      {/* Tags */}
      <Section title={a.sectionTags} icon={Star}>
        <TagsEditor values={form.tags} onChange={(v) => set("tags", v)} />
      </Section>

      {/* Payment Options */}
      <Section title={a.sectionPayment} icon={DollarSign}>
        <div className="space-y-3">
          {form.paymentOptions.map((opt, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#060d1a] border border-[#1e2d45] rounded-xl p-4">
              <Field label={a.planTitle}>
                <input className={INPUT_CLS} value={opt.title} placeholder={a.planTitlePlaceholder}
                  onChange={(e) => set("paymentOptions", form.paymentOptions.map((o, j) => j === i ? { ...o, title: e.target.value } : o))} />
              </Field>
              <Field label={a.planDescription}>
                <input className={INPUT_CLS} value={opt.description} placeholder={a.planDescPlaceholder}
                  onChange={(e) => set("paymentOptions", form.paymentOptions.map((o, j) => j === i ? { ...o, description: e.target.value } : o))} />
              </Field>
              <button type="button" onClick={() => set("paymentOptions", form.paymentOptions.filter((_, j) => j !== i))}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors text-left flex items-center gap-1">
                <Trash2 size={12} /> {a.remove}
              </button>
            </div>
          ))}
          <button type="button"
            onClick={() => set("paymentOptions", [...form.paymentOptions, { title: "", description: "" }])}
            className="flex items-center gap-2 text-xs text-[#c9a96e] hover:text-[#e8d5b0] transition-colors">
            <Plus size={14} /> {a.addPaymentOption}
          </button>
        </div>
      </Section>

      {/* Nearby Places */}
      <Section title={a.sectionNearby} icon={MapPin}>
        <div className="space-y-3">
          {form.nearbyPlaces.map((place, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#060d1a] border border-[#1e2d45] rounded-xl p-4">
              <Field label={a.name}>
                <input className={INPUT_CLS} value={place.name} onChange={(e) =>
                  set("nearbyPlaces", form.nearbyPlaces.map((p, j) => j === i ? { ...p, name: e.target.value } : p))} />
              </Field>
              <Field label={a.distance}>
                <input className={INPUT_CLS} value={place.distance} placeholder={a.distancePlaceholder}
                  onChange={(e) => set("nearbyPlaces", form.nearbyPlaces.map((p, j) => j === i ? { ...p, distance: e.target.value } : p))} />
              </Field>
              <Field label={a.category}>
                <select className={SELECT_CLS} value={place.category}
                  onChange={(e) => set("nearbyPlaces", form.nearbyPlaces.map((p, j) => j === i ? { ...p, category: e.target.value as never } : p))}>
                  <option value="transport">{a.nearbyTransport}</option>
                  <option value="education">{a.nearbyEducation}</option>
                  <option value="health">{a.nearbyHealth}</option>
                  <option value="leisure">{a.nearbyLeisure}</option>
                  <option value="shopping">{a.nearbyShopping}</option>
                </select>
              </Field>
              <div className="flex items-end">
                <button type="button" onClick={() => set("nearbyPlaces", form.nearbyPlaces.filter((_, j) => j !== i))}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1 pb-3">
                  <Trash2 size={12} /> {a.remove}
                </button>
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => set("nearbyPlaces", [...form.nearbyPlaces, { name: "", distance: "", category: "transport" }])}
            className="flex items-center gap-2 text-xs text-[#c9a96e] hover:text-[#e8d5b0] transition-colors">
            <Plus size={14} /> {a.addPlace}
          </button>
        </div>
      </Section>

      {/* Apartments */}
      <Section title={a.sectionApartments} icon={Home}>
        <ApartmentsEditor
          projectId={apartmentProjectId}
          apartments={form.apartments}
          onChange={(v) => set("apartments", v)}
        />
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 pb-8">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-[#1e2d45] text-[#9a9085] rounded-xl hover:border-[#c9a96e]/40 hover:text-[#f0ece4] transition-all text-sm">
          <X size={16} /> {a.cancel}
        </button>
        <button type="submit"
          className="flex items-center gap-2 px-8 py-3 bg-[#c9a96e] text-[#0C1428] rounded-xl font-semibold hover:bg-[#e8d5b0] transition-all text-sm">
          <Save size={16} /> {isNew ? a.publishProject : a.saveChanges}
        </button>
      </div>
    </form>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { projects, addProject, updateProject, deleteProject, refreshProjects } = useProjects();
  const [view, setView] = useState<AdminView>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [airtableSetupRunning, setAirtableSetupRunning] = useState(false);
  const [airtableConfigured, setAirtableConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    void fetch("/api/projects/status")
      .then((r) => r.json())
      .then((d: { airtableConfigured?: boolean }) => setAirtableConfigured(!!d.airtableConfigured))
      .catch(() => setAirtableConfigured(false));
  }, []);

  const addToast = (msg: string, type: Toast["type"] = "success") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const editingProject = editingId ? projects.find((p) => p.id === editingId) : null;

  const handleSave = async (data: Omit<Project, "id" | "slug"> & { id?: string; slug?: string }) => {
    try {
      if (view === "new") {
        await addProject(data as Omit<Project, "id" | "slug">);
        addToast(a.toastPublished);
      } else if (editingId) {
        await updateProject(editingId, data as Partial<Project>);
        addToast(a.toastUpdated);
      }
      setView("list");
      setEditingId(null);
    } catch (e) {
      addToast(e instanceof Error ? e.message : String(e), "error");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProject(id);
      setConfirmDelete(null);
      addToast(a.toastDeleted, "error");
    } catch (e) {
      addToast(e instanceof Error ? e.message : String(e), "error");
    }
  };

  return (
    <div className="min-h-screen bg-[#060d1a] font-['DM_Sans']">
      <Seo
        title={
          view === "list"
            ? a.seoList
            : view === "new"
              ? a.seoNew
              : fmt(a.seoEdit, { title: editingProject?.title ?? a.seoEditFallback })
        }
        description={a.seoDescription}
        path="/admin-lx9k2m"
        lang="hy"
        noindex
      />
      {/* Toasts */}
      <div className="fixed top-4 right-4 z-[300] space-y-2">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 60 }}
              className={`flex items-center gap-3 px-5 py-3.5 rounded-xl border text-sm shadow-lg ${
                t.type === "success"
                  ? "bg-[#0d1829] border-[#c9a96e]/30 text-[#f0ece4]"
                  : "bg-[#1a0d0d] border-red-400/30 text-red-300"
              }`}
            >
              {t.type === "success" ? <CheckCircle size={16} className="text-[#c9a96e]" /> : <AlertTriangle size={16} className="text-red-400" />}
              {t.msg}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Confirm delete modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 z-[200] bg-[#060d1a]/90 backdrop-blur-sm flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-[#0a1628] border border-red-400/30 rounded-2xl p-8 max-w-sm w-full text-center"
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
            >
              <AlertTriangle size={32} className="text-red-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-[#f0ece4] mb-2">{a.deleteTitle}</h3>
              <p className="text-sm text-[#9a9085] mb-6">{a.deleteBody}</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 border border-[#1e2d45] text-[#9a9085] rounded-xl hover:border-[#c9a96e]/40 transition-all text-sm">
                  {a.cancel}
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-medium">
                  {a.delete}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <header className="bg-[#060d1a] border-b border-[#1e2d45] sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            {view !== "list" && (
              <button onClick={() => { setView("list"); setEditingId(null); }}
                className="text-[#5a6a7e] hover:text-[#f0ece4] transition-colors">
                <ArrowLeft size={20} />
              </button>
            )}
            <span className="font-['Cormorant_Garamond'] text-xl font-light tracking-widest text-[#f0ece4]">
              Casa<span className="text-[#c9a96e]">Group</span>
              <span className="text-[#5a6a7e] text-sm font-['DM_Sans'] ml-3 tracking-normal">{a.brandAdmin}</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank">
              <span className="flex items-center gap-2 text-xs text-[#5a6a7e] hover:text-[#c9a96e] transition-colors cursor-pointer">
                <Eye size={14} /> {a.viewSite}
              </span>
            </Link>
            {view === "list" && (
              <button onClick={() => setView("new")}
                className="flex items-center gap-2 px-5 py-2 bg-[#c9a96e] text-[#0C1428] rounded-xl text-sm font-semibold hover:bg-[#e8d5b0] transition-all">
                <Plus size={16} /> {a.newProject}
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {airtableConfigured === false && (
          <div className="mb-6 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-100/90">
            <strong className="font-medium text-amber-200">{a.airtableNotConfiguredStrong}</strong>{" "}
            {a.airtableEnvHint}{" "}
            <code className="text-xs bg-[#0a1628] px-1.5 py-0.5 rounded">AIRTABLE_API_KEY</code> և{" "}
            <code className="text-xs bg-[#0a1628] px-1.5 py-0.5 rounded">AIRTABLE_BASE_ID</code>{" "}
            {a.airtableEnvRedeploy}
          </div>
        )}
        {/* LIST VIEW */}
        {view === "list" && (
          <div>
            <h1 className="sr-only">{a.srListTitle}</h1>
            {/* Airtable setup (server action — works on Vercel when AIRTABLE_* env is set) */}
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-xl border border-[#1e2d45] bg-[#0a1628] px-5 py-4">
              <div className="flex gap-3 min-w-0">
                <Database size={20} className="text-[#c9a96e] shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-[#f0ece4]">{a.setupTitle}</p>
                  <p className="text-xs text-[#5a6a7e] mt-1 leading-relaxed">{a.setupDesc}</p>
                </div>
              </div>
              <button
                type="button"
                disabled={airtableSetupRunning}
                onClick={async () => {
                  setAirtableSetupRunning(true);
                  try {
                    const result = await runAirtableSetupFromAdmin();
                    if (result.ok === false) {
                      addToast(result.error, "error");
                      return;
                    }
                    const parts = [
                      result.createdTable ? a.setupCreatedTable : a.setupTableOk,
                      result.createdFields.length
                        ? fmt(a.setupFields, { n: result.createdFields.length })
                        : "",
                      result.seeded.length
                        ? fmt(a.setupProjectsSeeded, { list: result.seeded.join(", ") })
                        : "",
                      result.skippedSeed.length
                        ? fmt(a.setupProjectsSkipped, { list: result.skippedSeed.join(", ") })
                        : "",
                      result.teamSeeded.length
                        ? fmt(a.setupTeamSeeded, { list: result.teamSeeded.join(", ") })
                        : "",
                      result.teamSkippedSeed.length
                        ? fmt(a.setupTeamSkipped, { list: result.teamSkippedSeed.join(", ") })
                        : "",
                    ].filter(Boolean);
                    addToast(parts.join(" · ") || a.setupFinished);
                    await refreshProjects();
                  } catch (e) {
                    addToast(e instanceof Error ? e.message : String(e), "error");
                  } finally {
                    setAirtableSetupRunning(false);
                  }
                }}
                className="shrink-0 px-5 py-2.5 rounded-xl border border-[#c9a96e]/40 text-sm font-medium text-[#e8d5b0] hover:bg-[#c9a96e]/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {airtableSetupRunning ? a.running : a.runSetup}
              </button>
            </div>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: a.statTotalProjects, value: projects.length },
                { label: a.statCities, value: new Set(projects.map((p) => p.city)).size },
                { label: a.statAvailableUnits, value: projects.reduce((sum, p) => sum + p.availableApartmentsCount, 0) },
                { label: a.statFeatured, value: projects.filter((p) => p.featured).length },
              ].map((s) => (
                <div key={s.label} className="bg-[#0a1628] border border-[#1e2d45] rounded-xl p-5">
                  <p className="text-2xl font-['Cormorant_Garamond'] text-[#c9a96e] font-light">{s.value}</p>
                  <p className="text-xs text-[#5a6a7e] mt-1 tracking-wide">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Projects table */}
            <div className="bg-[#0a1628] border border-[#1e2d45] rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-[#1e2d45] flex items-center justify-between">
                <h2 className="text-sm font-medium text-[#f0ece4]">{a.allProjects}</h2>
                <span className="text-xs text-[#5a6a7e]">{fmt(a.totalCount, { count: projects.length })}</span>
              </div>
              <div className="divide-y divide-[#1e2d45]">
                {projects.map((p, i) => (
                  <motion.div
                    key={p.id}
                    className="flex items-center gap-4 px-6 py-4 hover:bg-[#0d1a30] transition-colors"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    {/* Thumb */}
                    <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-lg border border-[#1e2d45] bg-[#060d1a]">
                      {p.images[0] ? <RemotePreviewImage src={p.images[0]} sizes="56px" /> : null}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-[#f0ece4] truncate">{p.title}</p>
                        {p.featured && <Star size={11} className="text-[#c9a96e] shrink-0" fill="#c9a96e" />}
                      </div>
                      <p className="text-xs text-[#5a6a7e] truncate">{p.location}</p>
                    </div>

                    {/* Status */}
                    <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 hidden md:inline ${
                      p.status === "Ready" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
                      : p.status === "Sold Out" ? "text-red-400 border-red-400/30 bg-red-400/5"
                      : "text-yellow-400 border-yellow-400/30 bg-yellow-400/5"
                    }`}>
                      {getStatusLabel(hy, p.status)}
                    </span>

                    {/* Price */}
                    <span className="text-sm font-['DM_Mono'] text-[#c9a96e] shrink-0 hidden lg:block">
                      {formatPrice(p.startingPrice)}
                    </span>

                    {/* Units */}
                    <span className="text-xs text-[#5a6a7e] shrink-0 hidden lg:block">
                      {p.availableApartmentsCount} {a.availShort}
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/projects/${p.slug}`}>
                        <span className="p-2 text-[#3a4d63] hover:text-[#c9a96e] transition-colors cursor-pointer">
                          <Eye size={15} />
                        </span>
                      </Link>
                      <button
                        type="button"
                        onClick={() => { setEditingId(p.id); setView("edit"); }}
                        className="p-2 text-[#3a4d63] hover:text-[#c9a96e] transition-colors"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDelete(p.id)}
                        className="p-2 text-[#3a4d63] hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* NEW / EDIT VIEW */}
        {(view === "new" || view === "edit") && (
          <div>
            <div className="mb-6">
              <h1 className="font-['Cormorant_Garamond'] text-3xl font-light text-[#f0ece4]">
                {view === "new"
                  ? a.newProjectTitle
                  : fmt(a.editProjectTitle, { title: editingProject?.title ?? "" })}
              </h1>
              <p className="text-sm text-[#5a6a7e] mt-1">
                {view === "new" ? a.newProjectSubtitle : a.editProjectSubtitle}
              </p>
            </div>
            <ProjectForm
              initial={view === "new" ? { ...emptyProject(), apartments: [] } : editingProject!}
              onSave={handleSave}
              onCancel={() => { setView("list"); setEditingId(null); }}
              isNew={view === "new"}
            />
          </div>
        )}
      </div>
    </div>
  );
}
