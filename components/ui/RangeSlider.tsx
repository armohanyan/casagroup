"use client";

import { useCallback, useId, useMemo, useRef } from "react";

interface Props {
  min: number;
  max: number;
  valueMin: number;
  valueMax: number;
  onChange: (min: number, max: number) => void;
  step?: number;
  className?: string;
}

export function RangeSlider({
  min,
  max,
  valueMin,
  valueMax,
  onChange,
  step = 1,
  className = "",
}: Props) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(max - min, 1);
  const leftPct = ((valueMin - min) / span) * 100;
  const rightPct = ((valueMax - min) / span) * 100;

  const clamp = useCallback(
    (n: number) => Math.min(max, Math.max(min, Math.round(n / step) * step)),
    [min, max, step],
  );

  const setFromClientX = useCallback(
    (clientX: number, thumb: "min" | "max") => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      const raw = min + ratio * span;
      if (thumb === "min") onChange(Math.min(clamp(raw), valueMax), valueMax);
      else onChange(valueMin, Math.max(clamp(raw), valueMin));
    },
    [clamp, min, onChange, span, valueMax, valueMin],
  );

  const startDrag = (thumb: "min" | "max") => (e: React.PointerEvent) => {
    e.preventDefault();
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setFromClientX(e.clientX, thumb);
    const onMove = (ev: PointerEvent) => setFromClientX(ev.clientX, thumb);
    const onUp = () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
  };

  const ariaProps = useMemo(
    () => ({
      min,
      max,
      step,
    }),
    [min, max, step],
  );

  return (
    <div className={`pt-1 ${className}`}>
      <div ref={trackRef} className="relative h-9 touch-none select-none">
        <div className="absolute left-0 right-0 top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#D6D3D1]" />
        <div
          className="absolute top-1/2 h-[2px] -translate-y-1/2 rounded-full bg-[#6B7A4A]"
          style={{ left: `${leftPct}%`, right: `${100 - rightPct}%` }}
        />

        <button
          type="button"
          role="slider"
          aria-label="Min area"
          aria-valuemin={ariaProps.min}
          aria-valuemax={valueMax}
          aria-valuenow={valueMin}
          id={`${id}-min`}
          className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#6B7A4A] bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6B7A4A]/40"
          style={{ left: `${leftPct}%` }}
          onPointerDown={startDrag("min")}
        />
        <button
          type="button"
          role="slider"
          aria-label="Max area"
          aria-valuemin={valueMin}
          aria-valuemax={ariaProps.max}
          aria-valuenow={valueMax}
          id={`${id}-max`}
          className="absolute top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#6B7A4A] bg-white shadow-sm outline-none focus-visible:ring-2 focus-visible:ring-[#6B7A4A]/40"
          style={{ left: `${rightPct}%` }}
          onPointerDown={startDrag("max")}
        />
      </div>
    </div>
  );
}
