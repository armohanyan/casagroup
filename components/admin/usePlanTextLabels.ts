"use client";

import { useEffect, useRef, useState } from "react";
import type { FloorTextLabel } from "@/types";
import { generateId } from "@/lib/store";
import {
  emptyPlanTextLabel,
  resolvePlanText,
} from "@/lib/plan-text-labels";

export function usePlanTextLabels(
  textLabels: FloorTextLabel[],
  onChange: (labels: FloorTextLabel[]) => void,
) {
  const [selectedLabelId, setSelectedLabelId] = useState<string | null>(null);
  const [labelPlacementMode, setLabelPlacementMode] = useState(false);
  const textLabelsRef = useRef(textLabels);
  textLabelsRef.current = textLabels;

  const selectedTextLabel = textLabels.find((l) => l.id === selectedLabelId) ?? null;

  useEffect(() => {
    if (textLabels.length === 0) {
      if (selectedLabelId !== null) setSelectedLabelId(null);
      return;
    }
    if (!selectedLabelId || !textLabels.some((l) => l.id === selectedLabelId)) {
      setSelectedLabelId(textLabels[0].id);
    }
  }, [textLabels, selectedLabelId]);

  function applyTextLabels(
    updater: FloorTextLabel[] | ((prev: FloorTextLabel[]) => FloorTextLabel[]),
  ) {
    const prev = textLabelsRef.current;
    const next = typeof updater === "function" ? updater(prev) : updater;
    textLabelsRef.current = next;
    onChange(next);
  }

  function addTextLabel() {
    const id = generateId();
    const next: FloorTextLabel = {
      ...emptyPlanTextLabel(),
      id,
    };
    applyTextLabels((prev) => [...prev, next]);
    setSelectedLabelId(id);
    setLabelPlacementMode(true);
  }

  function duplicateTextLabel(id: string) {
    const source = textLabelsRef.current.find((l) => l.id === id);
    if (!source) return;
    const newId = generateId();
    const next: FloorTextLabel = {
      ...source,
      id: newId,
      x: Math.min(98, source.x + 3),
      y: Math.min(98, source.y + 3),
    };
    applyTextLabels((prev) => [...prev, next]);
    setSelectedLabelId(newId);
    setLabelPlacementMode(true);
  }

  function updateTextLabel(id: string, patch: Partial<FloorTextLabel>) {
    applyTextLabels((prev) => prev.map((l) => (l.id === id ? { ...l, ...patch } : l)));
  }

  function removeTextLabel(id: string) {
    applyTextLabels((prev) => prev.filter((l) => l.id !== id));
    if (selectedLabelId === id) {
      const remaining = textLabelsRef.current;
      setSelectedLabelId(remaining.length > 0 ? remaining[0].id : null);
    }
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
    text: resolvePlanText(l, "hy"),
    color: l.color,
    backgroundColor: l.backgroundColor,
    fontSize: l.fontSize,
    rotation: l.rotation,
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
    duplicateTextLabel,
    updateTextLabel,
    removeTextLabel,
    placeLabel,
    moveLabel,
    canvasTextLabels,
  };
}
