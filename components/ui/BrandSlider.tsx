"use client";

import { useCallback, useId, useRef } from "react";

interface Props {
  min: number;
  max: number;
  value: number;
  step?: number;
  onChange: (value: number) => void;
  "aria-label"?: string;
  className?: string;
}

export function BrandSlider({
  min,
  max,
  value,
  step = 1,
  onChange,
  "aria-label": ariaLabel,
  className = "",
}: Props) {
  const id = useId();
  const trackRef = useRef<HTMLDivElement>(null);
  const span = Math.max(max - min, step);
  const clamped = Math.min(max, Math.max(min, value));
  const pct = ((clamped - min) / span) * 100;

  const clamp = useCallback(
    (n: number) => {
      const snapped = Math.round(n / step) * step;
      return Math.min(max, Math.max(min, snapped));
    },
    [min, max, step],
  );

  const setFromClientX = useCallback(
    (clientX: number) => {
      const el = trackRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      if (rect.width <= 0) return;
      const ratio = Math.min(1, Math.max(0, (clientX - rect.left) / rect.width));
      onChange(clamp(min + ratio * span));
    },
    [clamp, min, onChange, span],
  );

  const onPointerDown = (e: React.PointerEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const target = e.currentTarget as HTMLElement;
    target.setPointerCapture(e.pointerId);
    setFromClientX(e.clientX);

    const onMove = (ev: PointerEvent) => {
      ev.preventDefault();
      setFromClientX(ev.clientX);
    };
    const onUp = (ev: PointerEvent) => {
      try {
        target.releasePointerCapture(ev.pointerId);
      } catch {
        /* already released */
      }
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };

    window.addEventListener("pointermove", onMove, { passive: false });
    window.addEventListener("pointerup", onUp);
    window.addEventListener("pointercancel", onUp);
  };

  return (
    <div className={`select-none touch-none ${className}`}>
      <div
        ref={trackRef}
        role="slider"
        tabIndex={0}
        aria-label={ariaLabel}
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={clamped}
        id={id}
        className="relative flex h-11 cursor-pointer items-center outline-none focus-visible:ring-2 focus-visible:ring-[#c9a96e]/35 focus-visible:ring-offset-2 rounded-md"
        onPointerDown={onPointerDown}
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowDown") {
            e.preventDefault();
            onChange(clamp(clamped - step));
          } else if (e.key === "ArrowRight" || e.key === "ArrowUp") {
            e.preventDefault();
            onChange(clamp(clamped + step));
          } else if (e.key === "Home") {
            e.preventDefault();
            onChange(min);
          } else if (e.key === "End") {
            e.preventDefault();
            onChange(max);
          }
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#E7E0D5]" />
        <div
          className="absolute left-0 top-1/2 h-1.5 -translate-y-1/2 rounded-full bg-[#c9a96e]"
          style={{ width: `${pct}%` }}
        />
        <span
          className="absolute top-1/2 z-10 h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-[3px] border-[#c9a96e] bg-white shadow-md pointer-events-none"
          style={{ left: `${pct}%` }}
          aria-hidden
        />
      </div>
    </div>
  );
}
