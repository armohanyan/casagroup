"use client";

import type { FloorTextLabel } from "@/types";
import { useI18n } from "@/lib/i18n";
import {
  PLAN_TEXT_LABEL_CLASS,
  planTextLabelStyle,
  resolvePlanText,
} from "@/lib/plan-text-labels";

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
            className={`pointer-events-none ${PLAN_TEXT_LABEL_CLASS}`}
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
