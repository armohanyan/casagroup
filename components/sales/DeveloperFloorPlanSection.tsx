"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, ChevronLeft, ChevronRight } from "lucide-react";
import { DeveloperUnitCard } from "@/components/sales/DeveloperUnitCard";
import { BrandMultiSelect } from "@/components/ui/BrandMultiSelect";
import { BrandSelect } from "@/components/ui/BrandSelect";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { useI18n } from "@/lib/i18n";
import type { Apartment, Building, Project } from "@/types";
import { cn } from "@/lib/utils";

type SortKey = "price-asc" | "price-desc" | "area-asc" | "floor-asc";
type PaymentKey = "mortgage" | "installment";

const PAGE_SIZE = 9;

interface Props {
  project: Project;
}

function marketOf(apartments: Apartment[]) {
  return apartments.filter((a) => a.status !== "Reserved");
}

function uniqueSorted(nums: number[]) {
  return [...new Set(nums)].sort((a, b) => a - b);
}

function areaRange(apartments: Apartment[]) {
  if (apartments.length === 0) return { min: 0, max: 100 };
  const areas = apartments.map((a) => a.area);
  return { min: Math.min(...areas), max: Math.max(...areas) };
}

function sortedBuildings(buildings: Building[] | undefined) {
  return [...(buildings ?? [])]
    .filter((b) => b.name.trim())
    .map((b) => ({ ...b, floors: b.floors ?? [] }))
    .sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name));
}

function formatUpdatedDate(lang: string) {
  const d = new Date();
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yyyy = d.getFullYear();
  if (lang === "hy") return `${dd}.${mm}.${yyyy}`;
  return `${mm}/${dd}/${yyyy}`;
}

export function DeveloperFloorPlanSection({ project }: Props) {
  const { t, lang } = useI18n();

  const buildings = useMemo(() => sortedBuildings(project.buildings), [project.buildings]);
  const hasBuildings = buildings.length > 0;

  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(
    () => buildings[0]?.id ?? null,
  );

  useEffect(() => {
    if (!hasBuildings) {
      setSelectedBuildingId(null);
      return;
    }
    if (!selectedBuildingId || !buildings.some((b) => b.id === selectedBuildingId)) {
      setSelectedBuildingId(buildings[0]?.id ?? null);
    }
  }, [buildings, hasBuildings, selectedBuildingId]);

  const buildingApartments = useMemo(() => {
    if (!hasBuildings || !selectedBuildingId) return project.apartments;
    return project.apartments.filter((a) => a.buildingId === selectedBuildingId);
  }, [project.apartments, hasBuildings, selectedBuildingId]);

  const marketApartments = useMemo(() => marketOf(buildingApartments), [buildingApartments]);
  const roomOptions = useMemo(
    () => uniqueSorted(marketApartments.map((a) => a.rooms)),
    [marketApartments],
  );
  const floorOptions = useMemo(
    () => uniqueSorted(marketApartments.map((a) => a.floor)),
    [marketApartments],
  );
  const areaBounds = useMemo(() => areaRange(marketApartments), [marketApartments]);

  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(100);
  const [payments, setPayments] = useState<PaymentKey[]>(["mortgage", "installment"]);
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [page, setPage] = useState(1);

  useEffect(() => {
    const rooms = uniqueSorted(marketApartments.map((a) => a.rooms));
    const floors = uniqueSorted(marketApartments.map((a) => a.floor));
    const bounds = areaRange(marketApartments);
    setSelectedRooms(rooms);
    setSelectedFloors(floors);
    setAreaMin(bounds.min);
    setAreaMax(bounds.max);
    setPage(1);
  }, [selectedBuildingId, buildingApartments.length, marketApartments]);

  useEffect(() => {
    setPage(1);
  }, [selectedRooms, selectedFloors, areaMin, areaMax, payments, sort]);

  const filtered = useMemo(() => {
    let list = [...marketApartments];

    if (selectedRooms.length > 0) {
      list = list.filter((a) => selectedRooms.includes(a.rooms));
    } else {
      list = [];
    }

    if (list.length && selectedFloors.length > 0) {
      list = list.filter((a) => selectedFloors.includes(a.floor));
    } else if (selectedFloors.length === 0) {
      list = [];
    }

    list = list.filter((a) => a.area >= areaMin && a.area <= areaMax);

    if (payments.length === 0) list = [];

    list.sort((a, b) => {
      switch (sort) {
        case "price-desc":
          return b.price - a.price;
        case "area-asc":
          return a.area - b.area;
        case "floor-asc":
          return a.floor - b.floor;
        default:
          return a.price - b.price;
      }
    });
    return list;
  }, [marketApartments, selectedRooms, selectedFloors, areaMin, areaMax, payments, sort]);

  const paymentOptions = [
    { value: "mortgage", label: t.developerDetail.paymentMortgage },
    { value: "installment", label: t.developerDetail.paymentInstallment },
  ];

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function goToPage(next: number) {
    setPage(Math.min(Math.max(1, next), totalPages));
    document.getElementById("floor-plans")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section id="floor-plans" className="scroll-mt-24">
      {hasBuildings && (
        <div className="mb-8">
          <div className="mb-4 flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-[#1C1917] sm:text-2xl">
              {t.developerDetail.buildingsTitle}
            </h2>
            <span className="rounded-full bg-[#F3F4F6] px-3 py-1 text-xs font-medium text-[#6B7280]">
              {t.developerDetail.buildingsUpdated.replace("{date}", formatUpdatedDate(lang))}
            </span>
          </div>

          <p className="mb-2 text-xs font-medium uppercase tracking-[0.08em] text-[#9CA3AF]">
            {t.developerDetail.buildingBlockLabel}
          </p>

          <div className="overflow-x-auto rounded-[5px] border border-[#E5E7EB] bg-white">
            <div className="flex min-w-max" role="tablist" aria-label={t.developerDetail.buildingsTitle}>
              {buildings.map((building) => {
                const active = building.id === selectedBuildingId;
                return (
                  <button
                    key={building.id}
                    type="button"
                    role="tab"
                    aria-selected={active}
                    onClick={() => setSelectedBuildingId(building.id)}
                    className={cn(
                      "relative flex shrink-0 items-center gap-2 border-r border-[#E5E7EB] px-4 py-3 text-sm font-semibold transition-colors last:border-r-0",
                      active
                        ? "bg-[#E8F5F3] text-[#0c1428]"
                        : "bg-white text-[#4B5563] hover:bg-[#FAFAFA]",
                    )}
                  >
                    <Building2
                      size={16}
                      strokeWidth={1.75}
                      className={active ? "text-[#0F766E]" : "text-[#6B7280]"}
                    />
                    <span>{building.name}</span>
                    {active && (
                      <span className="absolute inset-x-0 bottom-0 h-[3px] bg-[#0F766E]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      <div className="mb-6">
        <div>
          <h2 className="text-xl font-bold text-[#1C1917] sm:text-2xl">
            {t.developerDetail.floorPlansTitle}
          </h2>
          <p className="mt-1 text-sm text-[#57534E]">
            {t.developerDetail.floorPlansTotal}{" "}
            <span className="font-semibold text-[#1C1917]">{marketApartments.length}</span>
          </p>
        </div>
      </div>

      <div className="mb-6 rounded-xl bg-white p-4 shadow-sm sm:p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
          <div className="min-w-0 shrink-0 lg:w-[200px]">
            <div className="flex items-center justify-between gap-2">
              <p className="field-label !mb-0">{t.developerDetail.filterArea}</p>
              <p className="text-xs tabular-nums text-[#57534E]">
                {areaMin}–{areaMax} m²
              </p>
            </div>
            <RangeSlider
              min={areaBounds.min}
              max={areaBounds.max}
              valueMin={areaMin}
              valueMax={areaMax}
              onChange={(nextMin, nextMax) => {
                setAreaMin(nextMin);
                setAreaMax(nextMax);
              }}
            />
          </div>

          <BrandMultiSelect
            className="min-w-0 flex-1 lg:max-w-[140px]"
            label={t.developerDetail.filterRooms}
            values={selectedRooms.map(String)}
            onChange={(vals) => setSelectedRooms(vals.map(Number).sort((a, b) => a - b))}
            options={roomOptions.map((r) => ({ value: String(r), label: String(r) }))}
            allLabel={t.developerDetail.filterAll}
            emptyLabel={t.developerDetail.filterNone}
            triggerClassName="!h-9"
          />

          <BrandMultiSelect
            className="min-w-0 flex-1 lg:max-w-[140px]"
            label={t.developerDetail.filterFloor}
            values={selectedFloors.map(String)}
            onChange={(vals) => setSelectedFloors(vals.map(Number).sort((a, b) => a - b))}
            options={floorOptions.map((f) => ({ value: String(f), label: String(f) }))}
            allLabel={t.developerDetail.filterAll}
            emptyLabel={t.developerDetail.filterNone}
            triggerClassName="!h-9"
          />

          <BrandMultiSelect
            className="min-w-0 flex-1 lg:max-w-[180px]"
            label={t.developerDetail.filterPayment}
            values={payments}
            onChange={(vals) => setPayments(vals as PaymentKey[])}
            options={paymentOptions}
            allLabel={t.developerDetail.filterAll}
            emptyLabel={t.developerDetail.filterNone}
            triggerClassName="!h-9"
          />

          <div className="min-w-0 flex-1 lg:max-w-[220px]">
            <BrandSelect
              label={t.developerDetail.sortBy}
              value={sort}
              onChange={(v) => setSort(v as SortKey)}
              triggerClassName="!h-9"
              options={[
                { value: "price-asc", label: t.developerDetail.sortPriceAsc },
                { value: "price-desc", label: t.developerDetail.sortPriceDesc },
                { value: "area-asc", label: t.developerDetail.sortAreaAsc },
                { value: "floor-asc", label: t.developerDetail.sortFloorAsc },
              ]}
            />
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl bg-white py-16 text-center text-[#57534E] shadow-sm">
          {t.properties.noResults}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {pageItems.map((apartment) => (
              <DeveloperUnitCard
                key={apartment.id}
                apartment={apartment}
                projectSlug={project.slug}
              />
            ))}
          </div>

          {totalPages > 1 && (
            <nav className="mt-8 flex items-center justify-center gap-1.5" aria-label="Pagination">
              <button
                type="button"
                onClick={() => goToPage(page - 1)}
                disabled={page === 1}
                aria-label="Previous page"
                className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-[#E5E7EB] bg-white text-[#0c1428] transition-colors hover:border-[#c9a96e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => goToPage(n)}
                  aria-current={n === page ? "page" : undefined}
                  className={
                    n === page
                      ? "flex h-10 w-10 items-center justify-center rounded-[5px] bg-[#0c1428] text-sm font-semibold text-white"
                      : "flex h-10 w-10 items-center justify-center rounded-[5px] border border-[#E5E7EB] bg-white text-sm font-medium text-[#0c1428] transition-colors hover:border-[#c9a96e]"
                  }
                >
                  {n}
                </button>
              ))}
              <button
                type="button"
                onClick={() => goToPage(page + 1)}
                disabled={page === totalPages}
                aria-label="Next page"
                className="flex h-10 w-10 items-center justify-center rounded-[5px] border border-[#E5E7EB] bg-white text-[#0c1428] transition-colors hover:border-[#c9a96e] disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight size={16} />
              </button>
            </nav>
          )}
        </>
      )}
    </section>
  );
}
