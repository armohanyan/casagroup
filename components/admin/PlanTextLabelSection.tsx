"use client";

import type { FloorTextLabel } from "@/types";
import {
  MAX_PLAN_TEXT_FONT_SIZE,
  MIN_PLAN_TEXT_FONT_SIZE,
  planTextLabelFontSize,
} from "@/lib/plan-text-labels";

export type PlanTextLabelSectionLabels = {
  title?: string;
  add?: string;
  text?: string;
  color?: string;
  bgColor?: string;
  size?: string;
  place?: string;
  remove?: string;
  count?: string;
  hint?: string;
};

type Props = {
  textLabels: FloorTextLabel[];
  selectedLabelId: string | null;
  labelPlacementMode: boolean;
  onSelectLabel: (id: string) => void;
  onAddLabel: () => void;
  onUpdateLabel: (id: string, patch: Partial<FloorTextLabel>) => void;
  onRemoveLabel: (id: string) => void;
  onStartPlacement: () => void;
  labels: PlanTextLabelSectionLabels;
};

export function PlanTextLabelSection({
  textLabels,
  selectedLabelId,
  labelPlacementMode,
  onSelectLabel,
  onAddLabel,
  onUpdateLabel,
  onRemoveLabel,
  onStartPlacement,
  labels,
}: Props) {
  const selectedTextLabel = textLabels.find((l) => l.id === selectedLabelId) ?? null;

  return (
    <div className="space-y-2 rounded-[5px] border border-[#E8EAED] bg-[#FAFAF8] p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
          {labels.title ?? "Text on image"}
        </p>
        {labels.add ? (
          <button
            type="button"
            onClick={onAddLabel}
            className="h-9 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
          >
            {labels.add}
          </button>
        ) : null}
      </div>
      {labels.hint ? <p className="text-xs text-[#6B7280]">{labels.hint}</p> : null}
      {selectedTextLabel ? (
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-[120px] flex-1">
            <label className="mb-1 block text-xs text-[#6B7280]">{labels.text ?? "Text"}</label>
            <input
              type="text"
              className="h-9 w-full rounded-[5px] border border-[#E5E7EB] px-2 text-sm"
              value={selectedTextLabel.text}
              onChange={(e) => onUpdateLabel(selectedTextLabel.id, { text: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#6B7280]">{labels.size ?? "Size"}</label>
            <input
              type="number"
              min={MIN_PLAN_TEXT_FONT_SIZE}
              max={MAX_PLAN_TEXT_FONT_SIZE}
              className="h-9 w-16 rounded-[5px] border border-[#E5E7EB] px-2 text-sm"
              value={planTextLabelFontSize(selectedTextLabel)}
              onChange={(e) =>
                onUpdateLabel(selectedTextLabel.id, {
                  fontSize: Number(e.target.value) || undefined,
                })
              }
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#6B7280]">{labels.color ?? "Text color"}</label>
            <input
              type="color"
              className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
              value={selectedTextLabel.color}
              onChange={(e) => onUpdateLabel(selectedTextLabel.id, { color: e.target.value })}
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-[#6B7280]">{labels.bgColor ?? "Background"}</label>
            <input
              type="color"
              className="h-9 w-12 cursor-pointer rounded-[5px] border border-[#E5E7EB]"
              value={
                selectedTextLabel.backgroundColor?.startsWith("#")
                  ? selectedTextLabel.backgroundColor
                  : "#0c1428"
              }
              onChange={(e) =>
                onUpdateLabel(selectedTextLabel.id, { backgroundColor: e.target.value })
              }
            />
          </div>
          <button
            type="button"
            onClick={onStartPlacement}
            className={
              labelPlacementMode
                ? "h-9 rounded-[5px] border border-[#c9a96e] bg-[#F8F6F1] px-3 text-xs font-semibold text-[#0c1428]"
                : "h-9 rounded-[5px] border border-[#E5E7EB] px-3 text-xs font-semibold text-[#0c1428]"
            }
          >
            {labels.place ?? "Place on map"}
          </button>
          <button
            type="button"
            onClick={() => onRemoveLabel(selectedTextLabel.id)}
            className="h-9 rounded-[5px] px-3 text-xs font-semibold text-red-500 hover:bg-red-50"
          >
            {labels.remove ?? "Remove"}
          </button>
        </div>
      ) : null}
      {textLabels.length > 0 ? (
        <ul className="space-y-1">
          {labels.count ? (
            <li className="text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">
              {labels.count.replace("{count}", String(textLabels.length))}
            </li>
          ) : null}
          {textLabels.map((l) => (
            <li key={l.id}>
              <button
                type="button"
                onClick={() => onSelectLabel(l.id)}
                className={
                  l.id === selectedLabelId
                    ? "w-full rounded-[5px] border border-[#c9a96e] bg-white px-3 py-2 text-left text-xs text-[#0c1428]"
                    : "w-full rounded-[5px] border border-[#E8EAED] bg-white px-3 py-2 text-left text-xs text-[#0c1428] hover:border-[#c9a96e]"
                }
              >
                <span style={{ color: l.color, fontSize: `${planTextLabelFontSize(l)}px` }}>
                  {l.text}
                </span>
                <span className="ml-2 text-[#9CA3AF]">
                  ({Math.round(l.x)}%, {Math.round(l.y)}%)
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
