"use client";

import { useCallback, useEffect, useState } from "react";
import { ArrowDown, ArrowUp, Pencil, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import { useAdminImagePicker } from "@/components/admin/useAdminImagePicker";
import { adminBtnPrimary, adminBtnSecondary, adminCardCls } from "@/components/admin/admin-config";
import {
  adminCreateHeroSlide,
  adminDeleteHeroSlide,
  adminListHeroSlides,
  adminReorderHeroSlides,
  adminUpdateHeroSlide,
  type HeroSlide,
} from "@/lib/api-client";
import { toBrowserMediaUrl } from "@/lib/media-url";
import { hyTranslations } from "@/content/hy";
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

export function AdminHeroPage() {
  const { toast } = useAdminToast();
  const imagePicker = useAdminImagePicker(imageEditorLabels, (msg) => toast(msg, "error"));
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      const rows = await adminListHeroSlides();
      setSlides(rows);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Failed to load slides", "error");
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    void load();
  }, [load]);

  function handleUpload() {
    imagePicker.pickAndUpload({
      multiple: true,
      onUploaded: async ({ url }) => {
        if (!url) return;
        await adminCreateHeroSlide(url);
        await load();
        toast("Նկարը ավելացվեց");
      },
    });
  }

  function handleEdit(slide: HeroSlide) {
    void imagePicker.editExisting({
      src: slide.imageUrl,
      onUploaded: async ({ url }) => {
        if (!url) return;
        await adminUpdateHeroSlide(slide.id, { imageUrl: url });
        await load();
        toast("Նկարը թարմացվեց");
      },
    });
  }

  async function handleDelete(id: string) {
    try {
      await adminDeleteHeroSlide(id);
      setSlides((prev) => prev.filter((s) => s.id !== id));
      toast("Սլայդը ջնջվեց");
    } catch (err) {
      toast(err instanceof Error ? err.message : "Delete failed", "error");
    }
  }

  async function move(index: number, dir: -1 | 1) {
    const next = index + dir;
    if (next < 0 || next >= slides.length) return;
    const reordered = [...slides];
    const [item] = reordered.splice(index, 1);
    reordered.splice(next, 0, item);
    setSlides(reordered);
    try {
      const updated = await adminReorderHeroSlides(reordered.map((s) => s.id));
      setSlides(updated);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Reorder failed", "error");
      await load();
    }
  }

  return (
    <div>
      <AdminPageHeader
        title="Գլխավոր սլայդեր"
        description="Վերբեռնեք գլխավոր էջի ֆոնային նկարները։ Կայքում դրանք ցուցադրվում են հերթով։"
        actions={
          <button
            type="button"
            className={adminBtnPrimary}
            disabled={imagePicker.busy}
            onClick={handleUpload}
          >
            <Plus size={16} />
            {imagePicker.busy ? "Վերբեռնվում է…" : "Ավելացնել նկար"}
          </button>
        }
      />

      {loading ? (
        <p className="text-sm text-[#9CA3AF]">Բեռնվում է…</p>
      ) : slides.length === 0 ? (
        <div className={`${adminCardCls} p-10 text-center`}>
          <p className="text-sm text-[#6B7280]">Սլայդեր չկան։ Ավելացրեք նկարներ գլխավոր էջի համար։</p>
          <button type="button" className={cn(adminBtnSecondary, "mt-4")} onClick={handleUpload}>
            Ավելացնել նկար
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`${adminCardCls} overflow-hidden`}>
              <div className="relative aspect-[16/10] bg-[#F3F4F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={toBrowserMediaUrl(slide.imageUrl)}
                  alt=""
                  className="h-full w-full object-cover"
                />
                <span className="absolute left-2 top-2 rounded bg-[#0c1428]/90 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-white">
                  {String(i + 1).padStart(2, "0")}
                </span>
              </div>
              <div className="flex items-center justify-between gap-2 p-3">
                <div className="flex gap-1">
                  <button
                    type="button"
                    disabled={i === 0}
                    onClick={() => void move(i, -1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40"
                    aria-label="Move up"
                  >
                    <ArrowUp size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={i === slides.length - 1}
                    onClick={() => void move(i, 1)}
                    className="inline-flex h-9 w-9 items-center justify-center rounded-[5px] border border-[#E5E7EB] text-[#6B7280] hover:bg-[#F3F4F6] disabled:opacity-40"
                    aria-label="Move down"
                  >
                    <ArrowDown size={16} />
                  </button>
                  <button
                    type="button"
                    disabled={imagePicker.busy}
                    onClick={() => handleEdit(slide)}
                    className="inline-flex h-9 items-center gap-1.5 rounded-[5px] border border-[#E5E7EB] px-3 text-sm font-medium text-[#0c1428] hover:bg-[#F3F4F6] disabled:opacity-40"
                  >
                    <Pencil size={15} />
                    {a.editImage}
                  </button>
                </div>
                <button
                  type="button"
                  onClick={() => void handleDelete(slide.id)}
                  className="inline-flex h-9 items-center gap-1.5 rounded-[5px] px-3 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  <Trash2 size={15} />
                  Ջնջել
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      {imagePicker.ui}
    </div>
  );
}
