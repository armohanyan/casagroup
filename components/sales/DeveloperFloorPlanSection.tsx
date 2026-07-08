"use client";

import { useEffect, useMemo, useState } from "react";
import { DeveloperUnitCard } from "@/components/sales/DeveloperUnitCard";
import { BrandMultiSelect } from "@/components/ui/BrandMultiSelect";
import { BrandSelect } from "@/components/ui/BrandSelect";
import { RangeSlider } from "@/components/ui/RangeSlider";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";

type SortKey = "price-asc" | "price-desc" | "area-asc" | "floor-asc";
type PaymentKey = "mortgage" | "installment";

interface Props {
  project: Project;
}

export function DeveloperFloorPlanSection({ project }: Props) {
  const { t } = useI18n();
  const [selectedRooms, setSelectedRooms] = useState<number[]>([]);
  const [selectedFloors, setSelectedFloors] = useState<number[]>([]);
  const [areaMin, setAreaMin] = useState(0);
  const [areaMax, setAreaMax] = useState(0);
  const [payments, setPayments] = useState<PaymentKey[]>(["mortgage", "installment"]);
  const [sort, setSort] = useState<SortKey>("price-asc");
  const [defaultsReady, setDefaultsReady] = useState(false);

  const marketApartments = useMemo(
    () => project.apartments.filter((a) => a.status !== "Reserved"),
    [project.apartments],
  );
  const roomOptions = useMemo(
    () => [...new Set(marketApartments.map((a) => a.rooms))].sort((a, b) => a - b),
    [marketApartments],
  );
  const floorOptions = useMemo(
    () => [...new Set(marketApartments.map((a) => a.floor))].sort((a, b) => a - b),
    [marketApartments],
  );
  const areaBounds = useMemo(() => {
    if (marketApartments.length === 0) return { min: 0, max: 100 };
    const areas = marketApartments.map((a) => a.area);
    return { min: Math.min(...areas), max: Math.max(...areas) };
  }, [marketApartments]);

  useEffect(() => {
    setSelectedRooms(roomOptions);
    setSelectedFloors(floorOptions);
    setAreaMin(areaBounds.min);
    setAreaMax(areaBounds.max);
    setDefaultsReady(true);
  }, [roomOptions, floorOptions, areaBounds.min, areaBounds.max]);

  const filtered = useMemo(() => {
    if (!defaultsReady) return [];
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
  }, [
    defaultsReady,
    marketApartments,
    selectedRooms,
    selectedFloors,
    areaMin,
    areaMax,
    payments,
    sort,
  ]);

  const paymentOptions = [
    { value: "mortgage", label: t.developerDetail.paymentMortgage },
    { value: "installment", label: t.developerDetail.paymentInstallment },
  ];

  return (
    <section id="floor-plans" className="scroll-mt-24">
      <div className="mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917]">{t.developerDetail.floorPlansTitle}</h2>
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
        <div className="rounded-xl bg-white py-16 text-center shadow-sm text-[#57534E]">
          {t.properties.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((apartment) => (
            <DeveloperUnitCard
              key={apartment.id}
              apartment={apartment}
              projectSlug={project.slug}
            />
          ))}
        </div>
      )}
    </section>
  );
}
