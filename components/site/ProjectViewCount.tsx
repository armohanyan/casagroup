"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { fetchProjectViewCount } from "@/lib/project-views";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  /** Fallback while the live API count loads. */
  count?: number;
  /** Accessible / tooltip label (e.g. "Դիտումներ"). */
  label?: string;
  className?: string;
}

/**
 * Live project view count (unique browser sessions).
 * Used in the admin panel - not shown on the public site.
 */
export function ProjectViewCount({
  projectId,
  count: initialCount,
  label = "Դիտումներ",
  className,
}: Props) {
  const [count, setCount] = useState<number | null>(
    typeof initialCount === "number" ? initialCount : null,
  );

  useEffect(() => {
    if (typeof initialCount === "number") setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    if (!projectId) return;
    let cancelled = false;
    fetchProjectViewCount(projectId).then((views) => {
      if (!cancelled && views != null) setCount(views);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (count === null) {
    return (
      <span
        className={cn(
          "inline-flex items-center gap-1.5 text-sm tabular-nums text-[#9CA3AF]",
          className,
        )}
        aria-hidden
      >
        <Eye size={14} strokeWidth={2} className="shrink-0 opacity-70" />
       -
      </span>
    );
  }

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-sm font-medium tabular-nums text-[#0c1428]",
        className,
      )}
      title={label}
      aria-label={`${count.toLocaleString("hy-AM")} ${label}`}
    >
      <Eye size={14} strokeWidth={2} className="shrink-0 text-[#c9a96e]" />
      {count.toLocaleString("hy-AM")}
    </span>
  );
}
