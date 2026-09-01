"use client";

import type { FloorTextLabel } from "@/types";
import { useI18n } from "@/lib/i18n";
import { planTextLabelStyle, resolvePlanText } from "@/lib/plan-text-labels";

export function PlanTextLabelsOverlay({ labels }: { labels: FloorTextLabel[] }) {
  const { lang } = useI18n();
  if (!labels.length) return null;
  return (
    <>
      {labels.map((lbl) => {
        const text = resolvePlanText(lbl, lang);
        if (!text) return null;
        return (
          <span
            key={lbl.id}
            className="pointer-events-none absolute z-[5] rounded-sm px-1.5 py-0.5 font-semibold uppercase tracking-wide"
            style={{
              left: `${lbl.x}%`,
              top: `${lbl.y}%`,
              ...planTextLabelStyle(lbl),
            }}
          >
            {text}
          </span>
        );
      })}
    </>
  );
}
