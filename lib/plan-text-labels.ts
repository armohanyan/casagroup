import type { FloorTextLabel } from "@/types";
import type { Lang } from "@/lib/i18n-config";

export const DEFAULT_PLAN_TEXT_COLOR = "#ffffff";
export const DEFAULT_PLAN_TEXT_BG = "rgba(12, 20, 40, 0.7)";
export const DEFAULT_PLAN_TEXT_FONT_SIZE = 10;
export const MIN_PLAN_TEXT_FONT_SIZE = 8;
export const MAX_PLAN_TEXT_FONT_SIZE = 32;
export const MIN_PLAN_TEXT_ROTATION = -180;
export const MAX_PLAN_TEXT_ROTATION = 180;

export type PlanTextFields = {
  text?: string;
  textHy?: string;
  textRu?: string;
};

export function resolvePlanText(fields: PlanTextFields, lang: Lang): string {
  const en = fields.text?.trim() ?? "";
  const hy = fields.textHy?.trim() ?? "";
  const ru = fields.textRu?.trim() ?? "";
  if (lang === "hy") return hy || en || ru;
  if (lang === "ru") return ru || en || hy;
  return en || hy || ru;
}

export function hasPlanText(fields: PlanTextFields): boolean {
  return Boolean(fields.text?.trim() || fields.textHy?.trim() || fields.textRu?.trim());
}

export function planTextLabelFontSize(label: { fontSize?: number }) {
  const size = label.fontSize ?? DEFAULT_PLAN_TEXT_FONT_SIZE;
  return Math.min(MAX_PLAN_TEXT_FONT_SIZE, Math.max(MIN_PLAN_TEXT_FONT_SIZE, size));
}

export function planTextLabelRotation(label: { rotation?: number }) {
  const deg = label.rotation ?? 0;
  return Math.min(MAX_PLAN_TEXT_ROTATION, Math.max(MIN_PLAN_TEXT_ROTATION, deg));
}

export function planTextLabelTransform(label: { rotation?: number }) {
  const rotate = planTextLabelRotation(label);
  return rotate === 0 ? "translate(-50%, -50%)" : `translate(-50%, -50%) rotate(${rotate}deg)`;
}

export function planTextLabelStyle(label: {
  color: string;
  backgroundColor?: string;
  fontSize?: number;
  rotation?: number;
}) {
  return {
    color: label.color,
    backgroundColor: label.backgroundColor ?? DEFAULT_PLAN_TEXT_BG,
    fontSize: `${planTextLabelFontSize(label)}px`,
    transform: planTextLabelTransform(label),
  } as const;
}

export function emptyPlanTextLabel(overrides?: Partial<FloorTextLabel>): FloorTextLabel {
  return {
    id: "",
    text: "SOLD",
    textHy: "ՎԱՃԱՌՎԱԾ",
    textRu: "ПРОДАНО",
    color: DEFAULT_PLAN_TEXT_COLOR,
    backgroundColor: DEFAULT_PLAN_TEXT_BG,
    fontSize: DEFAULT_PLAN_TEXT_FONT_SIZE,
    x: 50,
    y: 50,
    ...overrides,
  };
}
