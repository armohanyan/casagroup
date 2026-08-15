"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { fetchProjectViewCount } from "@/lib/project-views";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  count?: number;
  className?: string;
}

export function ProjectViewCount({ projectId, count: initialCount, className }: Props) {
  const { t } = useI18n();
  const [count, setCount] = useState<number | null>(
    typeof initialCount === "number" ? initialCount : null,
  );

  useEffect(() => {
    if (typeof initialCount === "number") setCount(initialCount);
  }, [initialCount]);

  useEffect(() => {
    let cancelled = false;
    fetchProjectViewCount(projectId).then((views) => {
      if (!cancelled) setCount(views);
    });
    return () => {
      cancelled = true;
    };
  }, [projectId]);

  if (count === null) return null;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded bg-black/55 px-2 py-0.5 text-[10px] font-semibold tabular-nums text-white backdrop-blur-sm",
        className,
      )}
      title={t.projects.viewCountLabel}
      aria-label={`${count} ${t.projects.viewCountLabel}`}
    >
      <Eye size={12} strokeWidth={2.25} className="shrink-0 opacity-90" />
      {count}
    </span>
  );
}
