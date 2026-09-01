import type { FloorTextLabel } from "@/types";
import { planTextLabelStyle } from "@/lib/plan-text-labels";

export function PlanTextLabelsOverlay({ labels }: { labels: FloorTextLabel[] }) {
  if (!labels.length) return null;
  return (
    <>
      {labels.map((lbl) => (
        <span
          key={lbl.id}
          className="pointer-events-none absolute z-[5] -translate-x-1/2 -translate-y-1/2 rounded-sm px-1.5 py-0.5 font-semibold uppercase tracking-wide"
          style={{
            left: `${lbl.x}%`,
            top: `${lbl.y}%`,
            ...planTextLabelStyle(lbl),
          }}
        >
          {lbl.text}
        </span>
      ))}
    </>
  );
}
