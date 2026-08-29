"use client";

import { Suspense, useCallback } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { LayoutGrid, Map } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import type { PlansViewMode } from "@/lib/sales-mode";
import { cn } from "@/lib/utils";

interface Props {
  view: PlansViewMode;
}

function ProjectPlansViewToggleInner({ view }: Props) {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const setView = useCallback(
    (next: PlansViewMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("view", next);
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [pathname, router, searchParams],
  );

  const tabBase =
    "flex flex-1 items-center justify-center gap-2 py-3.5 px-4 text-sm font-semibold transition-all duration-200 min-h-[52px]";

  return (
    <div
      className="flex w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6] p-1"
      role="group"
      aria-label={t.developerDetail.viewModeLabel}
    >
      <button
        type="button"
        onClick={() => setView("plans")}
        className={cn(
          tabBase,
          view === "plans"
            ? "rounded-lg bg-[#0c1428] text-white shadow-sm"
            : "rounded-lg text-[#6B7280] hover:bg-white/70 hover:text-[#0c1428]",
        )}
        aria-pressed={view === "plans"}
      >
        <LayoutGrid size={18} strokeWidth={2} className="shrink-0" />
        <span>{t.developerDetail.viewModePlans}</span>
      </button>
      <button
        type="button"
        onClick={() => setView("visual")}
        className={cn(
          tabBase,
          view === "visual"
            ? "rounded-lg bg-[#0c1428] text-white shadow-sm"
            : "rounded-lg text-[#6B7280] hover:bg-white/70 hover:text-[#0c1428]",
        )}
        aria-pressed={view === "visual"}
      >
        <Map size={18} strokeWidth={2} className="shrink-0" />
        <span>{t.developerDetail.viewModeVisual}</span>
      </button>
    </div>
  );
}

function ProjectPlansViewToggleSkeleton() {
  return <div className="h-[52px] w-full rounded-xl border border-[#E5E7EB] skeleton" />;
}

export function ProjectPlansViewToggle(props: Props) {
  return (
    <Suspense fallback={<ProjectPlansViewToggleSkeleton />}>
      <ProjectPlansViewToggleInner {...props} />
    </Suspense>
  );
}
