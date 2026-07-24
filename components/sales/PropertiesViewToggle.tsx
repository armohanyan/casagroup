"use client";

import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { LayoutGrid, Map } from "lucide-react";
import { useI18n } from "@/lib/i18n";

interface Props {
  view: "grid" | "map";
}

function PropertiesViewToggleInner({ view }: Props) {
  const { t } = useI18n();
  const searchParams = useSearchParams();
  const qs = searchParams.toString();
  const query = qs ? `?${qs}` : "";

  const base =
    "inline-flex items-center gap-1.5 h-9 px-3 rounded-md text-sm font-semibold transition-colors";
  const active = "btn-outline-active h-9 px-3 text-sm rounded-md";
  const inactive = "btn-outline h-9 px-3 text-sm rounded-md";

  return (
    <div className="inline-flex items-center rounded-lg border border-[#E7E0D5] bg-white p-1 brand-surface-top">
      <Link
        href={`/properties${query}`}
        className={`${base} ${view === "grid" ? active : inactive}`}
        aria-current={view === "grid" ? "page" : undefined}
      >
        <LayoutGrid size={15} />
        {t.properties.gridView}
      </Link>
      <Link
        href={`/properties/map${query}`}
        className={`${base} ${view === "map" ? active : inactive}`}
        aria-current={view === "map" ? "page" : undefined}
      >
        <Map size={15} />
        {t.properties.mapView}
      </Link>
    </div>
  );
}

function PropertiesViewToggleSkeleton() {
  return <div className="h-11 w-48 rounded-lg border border-[#E7E0D5] skeleton" />;
}

export function PropertiesViewToggle(props: Props) {
  return (
    <Suspense fallback={<PropertiesViewToggleSkeleton />}>
      <PropertiesViewToggleInner {...props} />
    </Suspense>
  );
}
