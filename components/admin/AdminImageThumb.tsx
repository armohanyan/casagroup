"use client";

import { Pencil, X } from "lucide-react";
import { cn } from "@/lib/utils";

type AdminImageThumbProps = {
  src: string;
  alt?: string;
  onRemove: () => void;
  onEdit?: () => void;
  badge?: string;
  className?: string;
  imgClassName?: string;
  removeLabel?: string;
  editLabel?: string;
};

/** Square thumbnail with optional Edit + Remove controls. */
export function AdminImageThumb({
  src,
  alt = "",
  onRemove,
  onEdit,
  badge,
  className,
  imgClassName,
  removeLabel = "Remove",
  editLabel = "Edit",
}: AdminImageThumbProps) {
  return (
    <div
      className={cn(
        "group relative aspect-square overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-[#F3F4F6]",
        className,
      )}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className={cn("h-full w-full object-cover", imgClassName)} />
      {badge ? (
        <span className="absolute left-1.5 top-1.5 rounded bg-[#0c1428]/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white">
          {badge}
        </span>
      ) : null}
      <div className="absolute right-1.5 top-1.5 flex items-center gap-1">
        {onEdit ? (
          <button
            type="button"
            onClick={onEdit}
            aria-label={editLabel}
            title={editLabel}
            className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0c1428]/90 text-white shadow-sm transition-colors hover:bg-[#c9a96e] hover:text-[#0c1428]"
          >
            <Pencil size={13} strokeWidth={2.5} />
          </button>
        ) : null}
        <button
          type="button"
          onClick={onRemove}
          aria-label={removeLabel}
          title={removeLabel}
          className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-[#0c1428]/90 text-white shadow-sm transition-colors hover:bg-red-600"
        >
          <X size={14} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

type AdminImageGridProps = {
  urls: string[];
  onRemove: (index: number) => void;
  onEdit?: (index: number) => void;
  coverBadge?: string;
  emptyLabel?: string;
  removeLabel?: string;
  editLabel?: string;
  className?: string;
};

/** Grid of removable (and optionally editable) image previews. */
export function AdminImageGrid({
  urls,
  onRemove,
  onEdit,
  coverBadge,
  emptyLabel,
  removeLabel,
  editLabel,
  className,
}: AdminImageGridProps) {
  if (urls.length === 0) {
    return emptyLabel ? (
      <p className="rounded-[5px] border border-dashed border-[#E5E7EB] bg-[#FAFAFA] px-3 py-6 text-center text-sm text-[#9CA3AF]">
        {emptyLabel}
      </p>
    ) : null;
  }

  return (
    <div className={cn("grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5", className)}>
      {urls.map((url, index) => (
        <AdminImageThumb
          key={`${url}-${index}`}
          src={url}
          onRemove={() => onRemove(index)}
          onEdit={onEdit ? () => onEdit(index) : undefined}
          badge={index === 0 ? coverBadge : undefined}
          removeLabel={removeLabel}
          editLabel={editLabel}
        />
      ))}
    </div>
  );
}
