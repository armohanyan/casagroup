"use client";

import { useState } from "react";
import type { FloorTextLabel } from "@/types";
import { generateId } from "@/lib/store";
import {
  DEFAULT_PLAN_TEXT_BG,
  DEFAULT_PLAN_TEXT_COLOR,
  DEFAULT_PLAN_TEXT_FONT_SIZE,
} from "@/lib/plan-text-labels";

export function usePlanTextLabels(
  textLabels: FloorTextLabel[],
  onChange: (labels: FloorTextLabel[]) => void,
) {
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [labelPlacementMode, setLabelPlacementMode] = useState(false);

  const selectedTextLabel = textLabels.find((l) => l.id === selectedLabelId) ?? null;

  function updateTextLabels(next: FloorTextLabel[]) {
    onChange(next);
  }

  function addTextLabel(defaultText = "SOLD") {
    const id = generateId();
    const next: FloorTextLabel = {
      id,
      text: defaultText,
      color: DEFAULT_PLAN_TEXT_COLOR,
      backgroundColor: DEFAULT_PLAN_TEXT_BG,
      fontSize: DEFAULT_PLAN_TEXT_FONT_SIZE,
      x: 50,
      y: 50,
    };
    updateTextLabels([...textLabels, next]);
    setSelectedLabelId(id);
    setLabelPlacementMode(true);
  }

  function updateTextLabel(id: string, patch: Partial<FloorTextLabel>) {
    updateTextLabels(textLabels.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeTextLabel(id: string) {
    updateTextLabels(textLabels.filter((l) => l.id !== id));
    if (selectedLabelId === id) setSelectedLabelId(null);
    setLabelPlacementMode(false);
  }

  function placeLabel(pt: [number, number]) {
    if (!labelPlacementMode || !selectedLabelId) return;
    updateTextLabel(selectedLabelId, { x: pt[0], y: pt[1] });
    setLabelPlacementMode(false);
  }

  function moveLabel(id: string, pt: [number, number]) {
    updateTextLabel(id, { x: pt[0], y: pt[1] });
  }

  const canvasTextLabels = textLabels.map((l) => ({
    id: l.id,
    text: l.text,
    color: l.color,
    backgroundColor: l.backgroundColor,
    fontSize: l.fontSize,
    x: l.x,
    y: l.y,
    active: l.id === selectedLabelId,
  }));

  return {
    selectedLabelId,
    setSelectedLabelId,
    labelPlacementMode,
    setLabelPlacementMode,
    selectedTextLabel,
    addTextLabel,
    updateTextLabel,
    removeTextLabel,
    placeLabel,
    moveLabel,
    canvasTextLabels,
  };
}
