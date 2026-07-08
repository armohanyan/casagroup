"use client";

import { useEffect, useState } from "react";
import { Eye } from "lucide-react";
import { getBaseProjectViews, getProjectViewCount } from "@/lib/project-views";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";

interface Props {
  projectId: string;
  className?: string;
}

export function ProjectViewCount({ projectId, className }: Props) {
  const { t } = useI18n();
  const [count, setCount] = useState(() => getBaseProjectViews(projectId));

  useEffect(() => {
    setCount(getProjectViewCount(projectId));
  }, [projectId]);

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
