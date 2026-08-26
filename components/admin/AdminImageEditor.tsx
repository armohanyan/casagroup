"use client";

import { useCallback, useEffect, useState } from "react";
import Cropper, { type Area } from "react-easy-crop";
import "react-easy-crop/react-easy-crop.css";
import {
  Check,
  FlipHorizontal2,
  FlipVertical2,
  RotateCcw,
  RotateCw,
  X,
} from "lucide-react";
import {
  adminBtnPrimary,
  adminBtnSecondary,
} from "@/components/admin/admin-config";
import { cropImageToFile, type FlipState } from "@/lib/admin-image-crop";
import { cn } from "@/lib/utils";

export type AdminImageEditorLabels = {
  title: string;
  zoom: string;
  rotate: string;
  flipH: string;
  flipV: string;
  apply: string;
  cancel: string;
  aspectFree: string;
  aspect1: string;
  aspect43: string;
  aspect169: string;
  aspect34: string;
};

const DEFAULT_LABELS: AdminImageEditorLabels = {
  title: "Խմբագրել նկարը",
  zoom: "Մասշտաբ",
  rotate: "Պտտել",
  flipH: "Հորիզոնական",
  flipV: "Ուղղահայաց",
  apply: "Կիրառել",
  cancel: "Չեղարկել",
  aspectFree: "Ազատ",
  aspect1: "1:1",
  aspect43: "4:3",
  aspect169: "16:9",
  aspect34: "3:4",
};

/** Merge overrides without letting undefined/empty wipe defaults. */
function mergeLabels(partial?: Partial<AdminImageEditorLabels>): AdminImageEditorLabels {
  if (!partial) return DEFAULT_LABELS;
  const out = { ...DEFAULT_LABELS };
  (Object.keys(DEFAULT_LABELS) as (keyof AdminImageEditorLabels)[]).forEach((key) => {
    const value = partial[key];
    if (typeof value === "string" && value.trim() !== "") out[key] = value;
  });
  return out;
}

type AspectOption = { id: string; label: string; value: number | undefined };

type Props = {
  open: boolean;
  imageSrc: string | null;
  fileName?: string;
  labels?: Partial<AdminImageEditorLabels>;
  onCancel: () => void;
  onConfirm: (file: File) => void | Promise<void>;
  onError?: (message: string) => void;
};

export function AdminImageEditor({
  open,
  imageSrc,
  fileName = "image.jpg",
  labels: labelsProp,
  onCancel,
  onConfirm,
  onError,
}: Props) {
  const labels = mergeLabels(labelsProp);
  const aspects: AspectOption[] = [
    { id: "free", label: labels.aspectFree, value: undefined },
    { id: "1", label: labels.aspect1, value: 1 },
    { id: "43", label: labels.aspect43, value: 4 / 3 },
    { id: "169", label: labels.aspect169, value: 16 / 9 },
    { id: "34", label: labels.aspect34, value: 3 / 4 },
  ];

  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [flip, setFlip] = useState<FlipState>({ horizontal: false, vertical: false });
  const [aspectId, setAspectId] = useState("free");
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setFlip({ horizontal: false, vertical: false });
    setAspectId("free");
    setCroppedAreaPixels(null);
    setBusy(false);
  }, [open, imageSrc]);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const onCropComplete = useCallback((_area: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const aspect = aspects.find((a) => a.id === aspectId)?.value;

  async function handleApply() {
    if (!imageSrc || !croppedAreaPixels || busy) return;
    setBusy(true);
    try {
      const file = await cropImageToFile(imageSrc, croppedAreaPixels, flip, fileName);
      await onConfirm(file);
    } catch (e) {
      onError?.(e instanceof Error ? e.message : String(e));
      setBusy(false);
    }
  }

  if (!open || !imageSrc) return null;

  return (
    <div
      className="fixed inset-0 z-[300] flex items-end justify-center bg-[#0c1428]/55 p-3 backdrop-blur-sm sm:items-center sm:p-6"
      role="presentation"
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onCancel();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label={labels.title}
        className="flex max-h-[min(92vh,900px)] w-full max-w-3xl flex-col overflow-hidden rounded-[5px] bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between gap-3 border-b border-[#E8EAED] px-4 py-3">
          <h2 className="text-sm font-semibold text-[#0c1428] sm:text-base">{labels.title}</h2>
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-full text-[#6B7280] hover:bg-[#F3F4F6] hover:text-[#0c1428]"
            onClick={onCancel}
            disabled={busy}
            aria-label={labels.cancel}
          >
            <X size={18} />
          </button>
        </div>

        <div className="relative h-[min(52vh,420px)] w-full bg-[#111827]">
          <div
            className="absolute inset-0"
            style={{
              transform: `scaleX(${flip.horizontal ? -1 : 1}) scaleY(${flip.vertical ? -1 : 1})`,
            }}
          >
            <Cropper
              image={imageSrc}
              crop={crop}
              zoom={zoom}
              rotation={rotation}
              aspect={aspect}
              onCropChange={setCrop}
              onZoomChange={setZoom}
              onRotationChange={setRotation}
              onCropComplete={onCropComplete}
              objectFit="contain"
              showGrid
            />
          </div>
        </div>

        <div className="space-y-3 border-t border-[#E8EAED] px-4 py-3">
          <div className="flex flex-wrap gap-1.5">
            {aspects.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => setAspectId(a.id)}
                className={cn(
                  "h-8 rounded-[5px] px-2.5 text-xs font-semibold transition-colors",
                  aspectId === a.id
                    ? "bg-[#0c1428] text-white"
                    : "bg-[#F3F4F6] text-[#6B7280] hover:bg-[#E5E7EB] hover:text-[#0c1428]",
                )}
              >
                {a.label}
              </button>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {labels.zoom}
              </span>
              <input
                type="range"
                min={1}
                max={3}
                step={0.01}
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
                className="w-full accent-[#c9a96e]"
              />
            </label>
            <div>
              <span className="mb-1 block text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {labels.rotate}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-9 px-3")}
                  onClick={() => setRotation((r) => r - 90)}
                  title="-90°"
                >
                  <RotateCcw size={15} /> -90°
                </button>
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-9 px-3")}
                  onClick={() => setRotation((r) => r + 90)}
                  title="+90°"
                >
                  <RotateCw size={15} /> +90°
                </button>
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-9 px-3")}
                  onClick={() => setFlip((f) => ({ ...f, horizontal: !f.horizontal }))}
                  title={labels.flipH}
                >
                  <FlipHorizontal2 size={15} /> {labels.flipH}
                </button>
                <button
                  type="button"
                  className={cn(adminBtnSecondary, "h-9 px-3")}
                  onClick={() => setFlip((f) => ({ ...f, vertical: !f.vertical }))}
                  title={labels.flipV}
                >
                  <FlipVertical2 size={15} /> {labels.flipV}
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap justify-end gap-2 pt-1">
            <button
              type="button"
              className={adminBtnSecondary}
              onClick={onCancel}
              disabled={busy}
            >
              <X size={15} /> {labels.cancel}
            </button>
            <button
              type="button"
              className={adminBtnPrimary}
              onClick={() => void handleApply()}
              disabled={busy || !croppedAreaPixels}
            >
              {busy ? "…" : (
                <>
                  <Check size={15} /> {labels.apply}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
