"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import { adminBtnPrimary, adminBtnSecondary, adminCardCls } from "@/components/admin/admin-config";
import {
  adminCreateHeroSlide,
  adminDeleteHeroSlide,
  adminListHeroSlides,
  adminReorderHeroSlides,
  adminUploadFile,
  type HeroSlide,
} from "@/lib/api-client";
import { cn } from "@/lib/utils";

export function AdminHeroPage() {
  const { toast } = useAdminToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [slides, setSlides] = useState<HeroSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);

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

  async function handleUpload(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (list.length === 0) {
      toast("Միայն նկար ֆայլ", "error");
      return;
    }
    setUploading(true);
    try {
      for (const file of list) {
        const result = await adminUploadFile(file);
        const url = result.jpegUrl || result.url;
        if (url) await adminCreateHeroSlide(url);
      }
      await load();
      toast(list.length === 1 ? "Նկարը ավելացվեց" : `${list.length} նկար ավելացվեց`);
    } catch (err) {
      toast(err instanceof Error ? err.message : "Upload failed", "error");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
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
          <>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => {
                if (e.target.files) void handleUpload(e.target.files);
              }}
            />
            <button
              type="button"
              className={adminBtnPrimary}
              disabled={uploading}
              onClick={() => fileRef.current?.click()}
            >
              <Plus size={16} />
              {uploading ? "Վերբեռնվում է…" : "Ավելացնել նկար"}
            </button>
          </>
        }
      />

      {loading ? (
        <p className="text-sm text-[#9CA3AF]">Բեռնվում է…</p>
      ) : slides.length === 0 ? (
        <div className={`${adminCardCls} p-10 text-center`}>
          <p className="text-sm text-[#6B7280]">Սլայդեր չկան։ Ավելացրեք նկարներ գլխավոր էջի համար։</p>
          <button type="button" className={cn(adminBtnSecondary, "mt-4")} onClick={() => fileRef.current?.click()}>
            Ավելացնել նկար
          </button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {slides.map((slide, i) => (
            <div key={slide.id} className={`${adminCardCls} overflow-hidden`}>
              <div className="relative aspect-[16/10] bg-[#F3F4F6]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={slide.imageUrl} alt="" className="h-full w-full object-cover" />
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
    </div>
  );
}
