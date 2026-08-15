"use client";

import { Copy } from "lucide-react";
import { adminInputCls, adminTextareaCls } from "@/components/admin/admin-config";
import { cn } from "@/lib/utils";

function LangColumn({
  code,
  value,
  onChange,
  placeholder,
  multiline,
  otherValue,
  copyLabel,
}: {
  code: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  otherValue: string;
  copyLabel: string;
}) {
  const empty = !value.trim();
  const canCopy = empty && otherValue.trim().length > 0;

  return (
    <div className="min-w-0">
      <div className="mb-1.5 flex h-5 items-center justify-between gap-2">
        <span
          className={cn(
            "inline-flex h-5 items-center rounded-[4px] px-1.5 text-[10px] font-bold tracking-wide",
            empty ? "bg-[#FEF3C7] text-[#92400E]" : "bg-[#F3F0EA] text-[#57534E]",
          )}
        >
          {code}
        </span>
        {canCopy ? (
          <button
            type="button"
            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#c9a96e] hover:text-[#a88a52]"
            onClick={() => onChange(otherValue)}
          >
            <Copy size={11} />
            {copyLabel}
          </button>
        ) : null}
      </div>
      {multiline ? (
        <textarea
          className={cn(adminTextareaCls, empty && "border-dashed")}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <input
          className={cn(adminInputCls, empty && "border-dashed")}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      )}
    </div>
  );
}

export function BilingualField({
  label,
  hy,
  en,
  ru,
  onHy,
  onEn,
  onRu,
  placeholderHy,
  placeholderEn,
  placeholderRu,
  multiline,
  copyHyLabel,
  copyEnLabel,
  copyRuLabel,
  className,
}: {
  label: string;
  hy: string;
  en: string;
  ru: string;
  onHy: (v: string) => void;
  onEn: (v: string) => void;
  onRu: (v: string) => void;
  placeholderHy?: string;
  placeholderEn?: string;
  placeholderRu?: string;
  multiline?: boolean;
  copyHyLabel: string;
  copyEnLabel: string;
  copyRuLabel: string;
  className?: string;
}) {
  const copySource = [hy, ru, en].find((v) => v.trim()) ?? "";

  return (
    <div className={cn(multiline && "md:col-span-2", className)}>
      <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-[#9CA3AF]">{label}</p>
      <div className={cn("grid grid-cols-1 gap-3", !multiline && "md:grid-cols-3")}>
        <LangColumn
          code="ՀՅ"
          value={hy}
          onChange={onHy}
          placeholder={placeholderHy}
          multiline={multiline}
          otherValue={copySource}
          copyLabel={copyHyLabel}
        />
        <LangColumn
          code="РУ"
          value={ru}
          onChange={onRu}
          placeholder={placeholderRu}
          multiline={multiline}
          otherValue={copySource}
          copyLabel={copyRuLabel}
        />
        <LangColumn
          code="EN"
          value={en}
          onChange={onEn}
          placeholder={placeholderEn}
          multiline={multiline}
          otherValue={copySource}
          copyLabel={copyEnLabel}
        />
      </div>
    </div>
  );
}
