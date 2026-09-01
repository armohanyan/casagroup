import type { FloorTextLabel } from "@/types";

export const DEFAULT_PLAN_TEXT_COLOR = "#ffffff";
export const DEFAULT_PLAN_TEXT_BG = "rgba(12, 20, 40, 0.7)";
export const DEFAULT_PLAN_TEXT_FONT_SIZE = 10;
export const MIN_PLAN_TEXT_FONT_SIZE = 8;
export const MAX_PLAN_TEXT_FONT_SIZE = 32;

export function planTextLabelFontSize(label: { fontSize?: number }) {
  const size = label.fontSize ?? DEFAULT_PLAN_TEXT_FONT_SIZE;
  return Math.min(MAX_PLAN_TEXT_FONT_SIZE, Math.max(MIN_PLAN_TEXT_FONT_SIZE, size));
}

export function planTextLabelStyle(label: {
  color: string;
  backgroundColor?: string;
  fontSize?: number;
}) {
  return {
    color: label.color,
    backgroundColor: label.backgroundColor ?? DEFAULT_PLAN_TEXT_BG,
    fontSize: `${planTextLabelFontSize(label)}px`,
  } as const;
}

export function emptyPlanTextLabel(overrides?: Partial<FloorTextLabel>): FloorTextLabel {
  return {
    id: "",
    text: "SOLD",
    color: DEFAULT_PLAN_TEXT_COLOR,
    backgroundColor: DEFAULT_PLAN_TEXT_BG,
    fontSize: DEFAULT_PLAN_TEXT_FONT_SIZE,
    x: 50,
    y: 50,
    ...overrides,
  };
}
