import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Plus, Trash2, Edit3, Save, X, ChevronDown, ChevronUp,
  Image as ImageIcon, Video, Building2, Home, MapPin,
  DollarSign, Layers, Star, ArrowLeft, Eye,
  GripVertical, AlertTriangle, CheckCircle, Link as LinkIcon,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Seo } from "@/components/seo/Seo";
import { useProjects } from "@/lib/projects-context";
import { emptyProject, emptyApartment, generateId } from "@/lib/store";
import type { Project, Apartment, ProjectStatus, ApartmentStatus } from "@/types";

// ─── Types ────────────────────────────────────────────────────────────────────

type AdminView = "list" | "edit" | "new";

interface Toast { id: string; msg: string; type: "success" | "error" }

function RemotePreviewImage({ src, sizes }: { src: string; sizes: string }) {
  const [visible, setVisible] = useState(true);
  if (!visible) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-[#060d1a] px-1 text-center text-[9px] text-[#5a6a7e]">
        Invalid URL
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

function UrlList({ label, values, onChange, placeholder }: {
  label: string;
  values: string[];
  onChange: (v: string[]) => void;
  placeholder?: string;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const val = input.trim();
    if (val) { onChange([...values, val]); setInput(""); }
  };
  return (
    <div>
      <label className={LABEL_CLS}>{label}</label>
      <div className="flex gap-2 mb-3">
        <input
          className={INPUT_CLS}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={placeholder ?? "Paste URL…"}
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
      <label className={LABEL_CLS}>Tags</label>
      <div className="flex gap-2 mb-3">
        <input className={INPUT_CLS} value={input} onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. pool, gym, panoramic view" onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} />
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
        <label className={LABEL_CLS + " mb-0"}>Apartments ({apartments.length})</label>
        <button type="button" onClick={add}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#c9a96e] text-[#0C1428] rounded-lg text-xs font-medium hover:bg-[#e8d5b0] transition-colors">
          <Plus size={13} /> Add Unit
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
                {apt.rooms}BR · Floor {apt.floor} · {apt.area}m² · ${apt.price.toLocaleString()}
              </span>
              <span className={`text-xs px-2 py-0.5 rounded-full border ${
                apt.status === "Available" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
                : apt.status === "Reserved" ? "text-yellow-400 border-yellow-400/30 bg-yellow-400/5"
                : "text-red-400 border-red-400/30 bg-red-400/5"
              }`}>{apt.status}</span>
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
                    <Field label="Rooms">
                      <input type="number" className={INPUT_CLS} value={apt.rooms} min={1} max={10}
                        onChange={(e) => update(apt.id, { rooms: +e.target.value })} />
                    </Field>
                    <Field label="Floor">
                      <input type="number" className={INPUT_CLS} value={apt.floor} min={1}
                        onChange={(e) => update(apt.id, { floor: +e.target.value })} />
                    </Field>
                    <Field label="Area (m²)">
                      <input type="number" className={INPUT_CLS} value={apt.area}
                        onChange={(e) => update(apt.id, { area: +e.target.value })} />
                    </Field>
                    <Field label="Price ($)">
                      <input type="number" className={INPUT_CLS} value={apt.price}
                        onChange={(e) => update(apt.id, { price: +e.target.value })} />
                    </Field>
                    <Field label="Status">
                      <select className={SELECT_CLS} value={apt.status}
                        onChange={(e) => update(apt.id, { status: e.target.value as ApartmentStatus })}>
                        <option>Available</option>
                        <option>Reserved</option>
                        <option>Sold</option>
                      </select>
                    </Field>
                    <Field label="View Type">
                      <input className={INPUT_CLS} value={apt.viewType} placeholder="City, Mountain…"
                        onChange={(e) => update(apt.id, { viewType: e.target.value })} />
                    </Field>
                    <div className="col-span-2 md:col-span-3">
                      <UrlList label="Gallery Images" values={apt.gallery}
                        onChange={(v) => update(apt.id, { gallery: v })}
                        placeholder="https://images.unsplash.com/…" />
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <Field label="Floor Plan Image URL">
                        <input className={INPUT_CLS} value={apt.floorPlanImage} placeholder="https://…"
                          onChange={(e) => update(apt.id, { floorPlanImage: e.target.value })} />
                      </Field>
                    </div>
                    <Field label="Balcony">
                      <label className="flex items-center gap-3 cursor-pointer mt-2">
                        <div
                          className={`w-10 h-6 rounded-full transition-colors ${apt.balcony ? "bg-[#c9a96e]" : "bg-[#1e2d45]"}`}
                          onClick={() => update(apt.id, { balcony: !apt.balcony })}
                        >
                          <div className={`w-4 h-4 bg-white rounded-full mt-1 transition-transform ${apt.balcony ? "translate-x-5" : "translate-x-1"}`} />
                        </div>
                        <span className="text-xs text-[#9a9085]">{apt.balcony ? "Yes" : "No"}</span>
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
            No apartments yet — click "Add Unit" to add listings
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
        <label className={LABEL_CLS + " mb-0"}>Drone Videos</label>
        <button type="button" onClick={add}
          className="flex items-center gap-2 px-3 py-1.5 bg-[#c9a96e] text-[#0C1428] rounded-lg text-xs font-medium hover:bg-[#e8d5b0] transition-colors">
          <Plus size={13} /> Add Video
        </button>
      </div>
      <div className="space-y-3">
        {values.map((v, i) => (
          <div key={i} className="bg-[#060d1a] border border-[#1e2d45] rounded-xl p-4 grid gap-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Video size={14} className="text-[#c9a96e]" />
                <span className="text-xs text-[#9a9085]">Video {i + 1}</span>
              </div>
              <button type="button" onClick={() => remove(i)} className="text-[#3a4d63] hover:text-red-400 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
            <Field label="Title">
              <input className={INPUT_CLS} value={v.title} placeholder="Aerial Overview"
                onChange={(e) => update(i, { title: e.target.value })} />
            </Field>
            <Field label="YouTube Embed URL">
              <input className={INPUT_CLS} value={v.url} placeholder="https://www.youtube.com/embed/…"
                onChange={(e) => update(i, { url: e.target.value })} />
            </Field>
            <Field label="Thumbnail URL (optional)">
              <input className={INPUT_CLS} value={v.thumbnail ?? ""} placeholder="https://…"
                onChange={(e) => update(i, { thumbnail: e.target.value })} />
            </Field>
          </div>
        ))}
        {values.length === 0 && (
          <p className="text-center text-[#3a4d63] text-xs py-4 border border-dashed border-[#1e2d45] rounded-xl">
            No drone videos — click "Add Video"
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Amenities editor ─────────────────────────────────────────────────────────

const AMENITY_OPTIONS = [
  { icon: "Waves", label: "Pool" },
  { icon: "Dumbbell", label: "Gym" },
  { icon: "Car", label: "Parking" },
  { icon: "Shield", label: "Security" },
  { icon: "Leaf", label: "Garden" },
  { icon: "UtensilsCrossed", label: "Restaurant" },
  { icon: "Wifi", label: "Wi-Fi" },
  { icon: "Zap", label: "Smart Home" },
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
      <label className={LABEL_CLS}>Amenities</label>
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
  onSave: (data: Omit<Project, "id" | "slug"> & { id?: string; slug?: string }) => void;
  onCancel: () => void;
  isNew: boolean;
}) {
  const [form, setForm] = useState(initial);
  const set = (key: string, value: unknown) => setForm((f) => ({ ...f, [key]: value }));

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSave(form); }}
      className="space-y-2"
    >
      {/* Core info */}
      <Section title="Core Information" icon={Building2}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Project Title *">
            <input required className={INPUT_CLS} value={form.title} placeholder="Ararat Heights"
              onChange={(e) => set("title", e.target.value)} />
          </Field>
          <Field label="Developer">
            <input className={INPUT_CLS} value={form.developer} onChange={(e) => set("developer", e.target.value)} />
          </Field>
          <Field label="Architect">
            <input className={INPUT_CLS} value={form.architect ?? ""} placeholder="Studio Name"
              onChange={(e) => set("architect", e.target.value)} />
          </Field>
          <Field label="City">
            <input className={INPUT_CLS} value={form.city} onChange={(e) => set("city", e.target.value)} />
          </Field>
          <div className="md:col-span-2">
            <Field label="Full Address / Location">
              <input className={INPUT_CLS} value={form.location} placeholder="Northern Ave 12, Yerevan"
                onChange={(e) => set("location", e.target.value)} />
            </Field>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Field label="Short Description">
            <textarea rows={2} className={INPUT_CLS} value={form.description} placeholder="One-liner for cards…"
              onChange={(e) => set("description", e.target.value)} />
          </Field>
          <Field label="Long Description">
            <textarea rows={2} className={INPUT_CLS} value={form.longDescription} placeholder="Full project story…"
              onChange={(e) => set("longDescription", e.target.value)} />
          </Field>
        </div>
      </Section>

      {/* Pricing & Status */}
      <Section title="Pricing & Status" icon={DollarSign}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Field label="Starting Price ($) *">
            <input required type="number" className={INPUT_CLS} value={form.startingPrice || ""}
              placeholder="185000" onChange={(e) => set("startingPrice", +e.target.value)} />
          </Field>
          <Field label="Status">
            <select className={SELECT_CLS} value={form.status} onChange={(e) => set("status", e.target.value as ProjectStatus)}>
              <option>Under Construction</option>
              <option>Ready</option>
              <option>Sold Out</option>
            </select>
          </Field>
          <Field label="Completion Date">
            <input className={INPUT_CLS} value={form.completionDate} placeholder="Q2 2026"
              onChange={(e) => set("completionDate", e.target.value)} />
          </Field>
          <Field label="Total Floors">
            <input type="number" className={INPUT_CLS} value={form.floors || ""} min={1}
              onChange={(e) => set("floors", +e.target.value)} />
          </Field>
          <Field label="Total Apartments">
            <input type="number" className={INPUT_CLS} value={form.totalApartments || ""} min={0}
              onChange={(e) => set("totalApartments", +e.target.value)} />
          </Field>
          <Field label="Available Units">
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
          <span className="text-sm text-[#9a9085]">Featured on homepage</span>
          <Star size={14} className={form.featured ? "text-[#c9a96e]" : "text-[#3a4d63]"} />
        </div>
      </Section>

      {/* Images */}
      <Section title="Images" icon={ImageIcon}>
        <UrlList
          label="Project Images (first = hero)"
          values={form.images}
          onChange={(v) => set("images", v)}
          placeholder="https://images.unsplash.com/photo-…?w=1200&q=80"
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
      <Section title="Drone Videos" icon={Video}>
        <DroneVideosEditor
          values={form.droneVideos ?? []}
          onChange={(v) => set("droneVideos", v)}
        />
      </Section>

      {/* Amenities */}
      <Section title="Amenities" icon={Layers}>
        <AmenitiesEditor values={form.amenities} onChange={(v) => set("amenities", v)} />
      </Section>

      {/* Tags */}
      <Section title="Tags & Highlights" icon={Star}>
        <TagsEditor values={form.tags} onChange={(v) => set("tags", v)} />
      </Section>

      {/* Payment Options */}
      <Section title="Payment Options" icon={DollarSign}>
        <div className="space-y-3">
          {form.paymentOptions.map((opt, i) => (
            <div key={i} className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#060d1a] border border-[#1e2d45] rounded-xl p-4">
              <Field label="Plan Title">
                <input className={INPUT_CLS} value={opt.title} placeholder="Mortgage"
                  onChange={(e) => set("paymentOptions", form.paymentOptions.map((o, j) => j === i ? { ...o, title: e.target.value } : o))} />
              </Field>
              <Field label="Description">
                <input className={INPUT_CLS} value={opt.description} placeholder="Up to 20 years, 10% down"
                  onChange={(e) => set("paymentOptions", form.paymentOptions.map((o, j) => j === i ? { ...o, description: e.target.value } : o))} />
              </Field>
              <button type="button" onClick={() => set("paymentOptions", form.paymentOptions.filter((_, j) => j !== i))}
                className="text-xs text-red-400/70 hover:text-red-400 transition-colors text-left flex items-center gap-1">
                <Trash2 size={12} /> Remove
              </button>
            </div>
          ))}
          <button type="button"
            onClick={() => set("paymentOptions", [...form.paymentOptions, { title: "", description: "" }])}
            className="flex items-center gap-2 text-xs text-[#c9a96e] hover:text-[#e8d5b0] transition-colors">
            <Plus size={14} /> Add Payment Option
          </button>
        </div>
      </Section>

      {/* Nearby Places */}
      <Section title="Nearby Places" icon={MapPin}>
        <div className="space-y-3">
          {form.nearbyPlaces.map((place, i) => (
            <div key={i} className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#060d1a] border border-[#1e2d45] rounded-xl p-4">
              <Field label="Name">
                <input className={INPUT_CLS} value={place.name} onChange={(e) =>
                  set("nearbyPlaces", form.nearbyPlaces.map((p, j) => j === i ? { ...p, name: e.target.value } : p))} />
              </Field>
              <Field label="Distance">
                <input className={INPUT_CLS} value={place.distance} placeholder="5 min walk"
                  onChange={(e) => set("nearbyPlaces", form.nearbyPlaces.map((p, j) => j === i ? { ...p, distance: e.target.value } : p))} />
              </Field>
              <Field label="Category">
                <select className={SELECT_CLS} value={place.category}
                  onChange={(e) => set("nearbyPlaces", form.nearbyPlaces.map((p, j) => j === i ? { ...p, category: e.target.value as never } : p))}>
                  <option value="transport">Transport</option>
                  <option value="education">Education</option>
                  <option value="health">Health</option>
                  <option value="leisure">Leisure</option>
                  <option value="shopping">Shopping</option>
                </select>
              </Field>
              <div className="flex items-end">
                <button type="button" onClick={() => set("nearbyPlaces", form.nearbyPlaces.filter((_, j) => j !== i))}
                  className="text-xs text-red-400/70 hover:text-red-400 transition-colors flex items-center gap-1 pb-3">
                  <Trash2 size={12} /> Remove
                </button>
              </div>
            </div>
          ))}
          <button type="button"
            onClick={() => set("nearbyPlaces", [...form.nearbyPlaces, { name: "", distance: "", category: "transport" }])}
            className="flex items-center gap-2 text-xs text-[#c9a96e] hover:text-[#e8d5b0] transition-colors">
            <Plus size={14} /> Add Place
          </button>
        </div>
      </Section>

      {/* Apartments */}
      <Section title="Apartment Listings" icon={Home}>
        <ApartmentsEditor
          projectId={form.id ?? generateId()}
          apartments={form.apartments}
          onChange={(v) => set("apartments", v)}
        />
      </Section>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 pb-8">
        <button type="button" onClick={onCancel}
          className="flex items-center gap-2 px-6 py-3 border border-[#1e2d45] text-[#9a9085] rounded-xl hover:border-[#c9a96e]/40 hover:text-[#f0ece4] transition-all text-sm">
          <X size={16} /> Cancel
        </button>
        <button type="submit"
          className="flex items-center gap-2 px-8 py-3 bg-[#c9a96e] text-[#0C1428] rounded-xl font-semibold hover:bg-[#e8d5b0] transition-all text-sm">
          <Save size={16} /> {isNew ? "Publish Project" : "Save Changes"}
        </button>
      </div>
    </form>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function AdminPage() {
  const { projects, customProjects, addProject, updateProject, deleteProject } = useProjects();
  const [view, setView] = useState<AdminView>("list");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  const addToast = (msg: string, type: Toast["type"] = "success") => {
    const id = generateId();
    setToasts((prev) => [...prev, { id, msg, type }]);
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 3500);
  };

  const editingProject = editingId ? projects.find((p) => p.id === editingId) : null;
  const isCustom = (id: string) => customProjects.some((p) => p.id === id);

  const handleSave = (data: Omit<Project, "id" | "slug"> & { id?: string; slug?: string }) => {
    if (view === "new") {
      addProject(data as Omit<Project, "id" | "slug">);
      addToast("Project published successfully");
    } else if (editingId) {
      updateProject(editingId, data as Partial<Project>);
      addToast("Project updated");
    }
    setView("list");
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    deleteProject(id);
    setConfirmDelete(null);
    addToast("Project deleted", "error");
  };

  return (
    <div className="min-h-screen bg-[#060d1a] font-['DM_Sans']">
      <Seo
        title={view === "list" ? "Listings manager" : view === "new" ? "New project" : `Edit — ${editingProject?.title ?? "Project"}`}
        description="CasaGroup internal tool to manage featured projects and apartment listings. This area is not intended for search indexing."
        path="/admin-lx9k2m"
        lang="en"
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
              <h3 className="text-lg font-medium text-[#f0ece4] mb-2">Delete Project?</h3>
              <p className="text-sm text-[#9a9085] mb-6">This cannot be undone.</p>
              <div className="flex gap-3">
                <button onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-2.5 border border-[#1e2d45] text-[#9a9085] rounded-xl hover:border-[#c9a96e]/40 transition-all text-sm">
                  Cancel
                </button>
                <button onClick={() => handleDelete(confirmDelete)}
                  className="flex-1 py-2.5 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all text-sm font-medium">
                  Delete
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
              <span className="text-[#5a6a7e] text-sm font-['DM_Sans'] ml-3 tracking-normal">Admin</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" target="_blank">
              <span className="flex items-center gap-2 text-xs text-[#5a6a7e] hover:text-[#c9a96e] transition-colors cursor-pointer">
                <Eye size={14} /> View Site
              </span>
            </Link>
            {view === "list" && (
              <button onClick={() => setView("new")}
                className="flex items-center gap-2 px-5 py-2 bg-[#c9a96e] text-[#0C1428] rounded-xl text-sm font-semibold hover:bg-[#e8d5b0] transition-all">
                <Plus size={16} /> New Project
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* LIST VIEW */}
        {view === "list" && (
          <div>
            <h1 className="sr-only">CasaGroup project listings manager</h1>
            {/* Stats strip */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[
                { label: "Total Projects", value: projects.length },
                { label: "Published by You", value: customProjects.length },
                { label: "Available Units", value: projects.reduce((a, p) => a + p.availableApartmentsCount, 0) },
                { label: "Featured", value: projects.filter((p) => p.featured).length },
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
                <h2 className="text-sm font-medium text-[#f0ece4]">All Projects</h2>
                <span className="text-xs text-[#5a6a7e]">{projects.length} total</span>
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
                        {!isCustom(p.id) && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#162035] text-[#5a6a7e] border border-[#1e2d45] shrink-0">mock</span>
                        )}
                      </div>
                      <p className="text-xs text-[#5a6a7e] truncate">{p.location}</p>
                    </div>

                    {/* Status */}
                    <span className={`text-xs px-2.5 py-1 rounded-full border shrink-0 hidden md:inline ${
                      p.status === "Ready" ? "text-emerald-400 border-emerald-400/30 bg-emerald-400/5"
                      : p.status === "Sold Out" ? "text-red-400 border-red-400/30 bg-red-400/5"
                      : "text-yellow-400 border-yellow-400/30 bg-yellow-400/5"
                    }`}>
                      {p.status}
                    </span>

                    {/* Price */}
                    <span className="text-sm font-['DM_Mono'] text-[#c9a96e] shrink-0 hidden lg:block">
                      ${(p.startingPrice / 1000).toFixed(0)}K
                    </span>

                    {/* Units */}
                    <span className="text-xs text-[#5a6a7e] shrink-0 hidden lg:block">
                      {p.availableApartmentsCount} avail
                    </span>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      <Link href={`/projects/${p.slug}`}>
                        <span className="p-2 text-[#3a4d63] hover:text-[#c9a96e] transition-colors cursor-pointer">
                          <Eye size={15} />
                        </span>
                      </Link>
                      {isCustom(p.id) ? (
                        <>
                          <button
                            onClick={() => { setEditingId(p.id); setView("edit"); }}
                            className="p-2 text-[#3a4d63] hover:text-[#c9a96e] transition-colors"
                          >
                            <Edit3 size={15} />
                          </button>
                          <button
                            onClick={() => setConfirmDelete(p.id)}
                            className="p-2 text-[#3a4d63] hover:text-red-400 transition-colors"
                          >
                            <Trash2 size={15} />
                          </button>
                        </>
                      ) : (
                        <span className="text-xs text-[#3a4d63] px-2">read-only</span>
                      )}
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
                {view === "new" ? "New Project" : `Edit — ${editingProject?.title}`}
              </h1>
              <p className="text-sm text-[#5a6a7e] mt-1">
                {view === "new" ? "Fill in the details to publish a new property listing." : "Update project information."}
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
