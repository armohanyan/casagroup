"use client";

import { useEffect, useId, useRef, useState } from "react";
import { ChevronDown } from "lucide-react";

export interface BrandMultiSelectOption {
  value: string;
  label: string;
}

interface Props {
  label?: string;
  values: string[];
  options: BrandMultiSelectOption[];
  onChange: (values: string[]) => void;
  className?: string;
  triggerClassName?: string;
  allLabel?: string;
  emptyLabel?: string;
  resetLabel?: string;
}

function formatSummary(
  values: string[],
  options: BrandMultiSelectOption[],
  allLabel: string,
  emptyLabel: string,
) {
  if (values.length === 0) return emptyLabel;
  if (values.length === options.length) return allLabel;
  const labels = options.filter((o) => values.includes(o.value)).map((o) => o.label);
  return labels.join(", ");
}

export function BrandMultiSelect({
  label,
  values,
  options,
  onChange,
  className = "",
  triggerClassName = "",
  allLabel = "All",
  emptyLabel = "-",
  resetLabel,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const listId = useId();
  const summary = formatSummary(values, options, allLabel, emptyLabel);

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

  function toggle(value: string) {
    if (values.includes(value)) onChange(values.filter((v) => v !== value));
    else onChange([...values, value]);
  }

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
        <span className="truncate">{summary}</span>
        <ChevronDown
          size={16}
          className={`shrink-0 text-[#0c1428] transition-transform ${open ? "rotate-180" : ""}`}
        />
      </button>

      {open ? (
        <ul
          id={listId}
          role="listbox"
          aria-multiselectable="true"
          className="absolute left-0 right-0 z-30 mt-1.5 max-h-60 min-w-[10rem] overflow-auto rounded-lg border border-[#E7E0D5] bg-white py-1 shadow-lg"
        >
          {resetLabel && values.length > 0 ? (
            <li className="border-b border-[#E7E0D5]">
              <button
                type="button"
                onClick={() => onChange([])}
                className="flex w-full px-3 py-2 text-left text-xs font-medium text-[#57534E] transition-colors hover:bg-[#F5F0E8] hover:text-[#0c1428]"
              >
                {resetLabel}
              </button>
            </li>
          ) : null}
          {options.map((option) => {
            const active = values.includes(option.value);
            return (
              <li key={option.value} role="option" aria-selected={active}>
                <button
                  type="button"
                  onClick={() => toggle(option.value)}
                  className="flex w-full items-center gap-2.5 px-3 py-2.5 text-left text-sm text-[#1C1917] transition-colors hover:bg-[#F5F0E8]"
                >
                  <span
                    className={`flex h-3.5 w-3.5 shrink-0 items-center justify-center rounded-[3px] border bg-white ${
                      active ? "border-[#0c1428]" : "border-[#C4B9A8]"
                    }`}
                    aria-hidden
                  >
                    {active ? (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-[#0c1428]">
                        <path
                          d="M2.5 6.2 4.8 8.5 9.5 3.5"
                          stroke="currentColor"
                          strokeWidth="1.8"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    ) : null}
                  </span>
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
