"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { Bold, Italic, Link as LinkIcon, List, ListOrdered, Underline } from "lucide-react";
import { adminTextareaCls } from "@/components/admin/admin-config";
import {
  isRichTextEmpty,
  looksLikeHtml,
  normalizeEditorHtml,
  plainTextToHtml,
} from "@/lib/rich-text";
import { cn } from "@/lib/utils";

type Props = {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
};

function toEditorHtml(value: string): string {
  if (!value.trim()) return "";
  return looksLikeHtml(value) ? value : plainTextToHtml(value);
}

export function RichTextEditor({ value, onChange, placeholder, className }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const lastEmitted = useRef(value);
  const seeded = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (seeded.current && value === lastEmitted.current) return;
    el.innerHTML = toEditorHtml(value);
    lastEmitted.current = value;
    seeded.current = true;
  }, [value]);

  function emit() {
    const el = ref.current;
    if (!el) return;
    const next = normalizeEditorHtml(el.innerHTML);
    lastEmitted.current = next;
    onChange(next);
  }

  function run(command: string, commandValue?: string) {
    ref.current?.focus();
    document.execCommand(command, false, commandValue);
    emit();
  }

  function addLink() {
    const url = window.prompt("URL");
    if (!url?.trim()) return;
    const href = /^https?:\/\//i.test(url) || url.startsWith("/") || url.startsWith("#") || url.startsWith("mailto:")
      ? url.trim()
      : `https://${url.trim()}`;
    run("createLink", href);
  }

  const empty = isRichTextEmpty(value);

  return (
    <div className={cn("overflow-hidden rounded-[5px] border border-[#E5E7EB] bg-white", empty && "border-dashed", className)}>
      <div className="flex flex-wrap gap-0.5 border-b border-[#E5E7EB] bg-[#F9FAFB] px-1.5 py-1">
        <ToolbarBtn label="Bold" onClick={() => run("bold")}>
          <Bold size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Italic" onClick={() => run("italic")}>
          <Italic size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Underline" onClick={() => run("underline")}>
          <Underline size={14} />
        </ToolbarBtn>
        <span className="mx-1 w-px self-stretch bg-[#E5E7EB]" />
        <ToolbarBtn label="Bullet list" onClick={() => run("insertUnorderedList")}>
          <List size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Numbered list" onClick={() => run("insertOrderedList")}>
          <ListOrdered size={14} />
        </ToolbarBtn>
        <ToolbarBtn label="Link" onClick={addLink}>
          <LinkIcon size={14} />
        </ToolbarBtn>
      </div>
      <div className="relative">
        {empty ? (
          <span className="pointer-events-none absolute left-3 top-2.5 text-sm text-[#9CA3AF]">{placeholder}</span>
        ) : null}
        <div
          ref={ref}
          role="textbox"
          aria-multiline
          contentEditable
          suppressContentEditableWarning
          className={cn(
            adminTextareaCls,
            "rich-text-editor min-h-[140px] border-0 focus:border-0 focus:ring-0",
          )}
          onInput={emit}
          onBlur={emit}
        />
      </div>
    </div>
  );
}

function ToolbarBtn({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      className="inline-flex h-7 w-7 items-center justify-center rounded-[4px] text-[#4B5563] transition-colors hover:bg-white hover:text-[#0c1428]"
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
    >
      {children}
    </button>
  );
}
