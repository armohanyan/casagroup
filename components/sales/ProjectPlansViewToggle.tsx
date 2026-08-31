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
    "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2.5 py-2 text-xs font-semibold leading-tight transition-all duration-200 sm:gap-2 sm:px-3 sm:text-sm";

  return (
    <div
      className="flex w-full overflow-hidden rounded-lg border border-[#E5E7EB] bg-[#F3F4F6] p-0.5 sm:rounded-xl sm:p-1"
      role="group"
      aria-label={t.developerDetail.viewModeLabel}
    >
      <button
        type="button"
        onClick={() => setView("plans")}
        className={cn(
          tabBase,
          view === "plans"
            ? "bg-[#0c1428] text-white shadow-sm"
            : "text-[#6B7280] hover:bg-white/70 hover:text-[#0c1428]",
        )}
        aria-pressed={view === "plans"}
      >
        <LayoutGrid size={16} strokeWidth={2} className="shrink-0" />
        <span className="whitespace-nowrap">{t.developerDetail.viewModePlans}</span>
      </button>
      <button
        type="button"
        onClick={() => setView("visual")}
        className={cn(
          tabBase,
          view === "visual"
            ? "bg-[#0c1428] text-white shadow-sm"
            : "text-[#6B7280] hover:bg-white/70 hover:text-[#0c1428]",
        )}
        aria-pressed={view === "visual"}
      >
        <Map size={16} strokeWidth={2} className="shrink-0" />
        <span className="whitespace-nowrap">{t.developerDetail.viewModeVisual}</span>
      </button>
    </div>
  );
}

function ProjectPlansViewToggleSkeleton() {
  return <div className="h-10 w-full rounded-lg border border-[#E5E7EB] skeleton sm:h-11" />;
}

export function ProjectPlansViewToggle(props: Props) {
  return (
    <Suspense fallback={<ProjectPlansViewToggleSkeleton />}>
      <ProjectPlansViewToggleInner {...props} />
    </Suspense>
  );
}
