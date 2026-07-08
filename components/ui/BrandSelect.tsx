"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface BrandSelectOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  value: string;
  options: BrandSelectOption[];
  onChange: (value: string) => void;
  className?: string;
  triggerClassName?: string;
}

export function BrandSelect({
  label,
  value,
  options,
  onChange,
  className = "",
  triggerClassName = "",
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const selected = options.find((o) => o.value === value) ?? options[0];

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={`relative ${className}`}>
      {label ? <label className="field-label">{label}</label> : null}
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className={`field-select flex w-full items-center justify-between gap-2 text-left !bg-none pr-3 ${triggerClassName}`}
      >
        <span className="truncate">{selected?.label}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#0c1428] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-60 overflow-auto rounded-lg border border-[#E7E0D5] bg-white py-1 shadow-lg"
        >
          {options.map((option) => {
            const active = option.value === value;
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => {
                    onChange(option.value);
                    setOpen(false);
                  }}
                  className={`flex w-full px-3 py-2.5 text-left text-sm transition-colors ${
                    active
                      ? "bg-[#0c1428] font-medium text-white"
                      : "text-[#1C1917] hover:bg-[#F5F0E8] hover:text-[#0c1428]"
                  }`}
                >
                  {option.label}
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
