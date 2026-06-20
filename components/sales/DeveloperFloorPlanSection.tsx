"use client";

import { useMemo, useState } from "react";
import { DeveloperUnitCard } from "@/components/sales/DeveloperUnitCard";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";

type SortKey = "price-asc" | "price-desc" | "area-asc" | "floor-asc";

const selectCls = "field-select";

interface Props {
  project: Project;
}

export function DeveloperFloorPlanSection({ project }: Props) {
  const { t } = useI18n();
  const [rooms, setRooms] = useState("");
  const [floor, setFloor] = useState("");
  const [minArea, setMinArea] = useState(0);
  const [sort, setSort] = useState<SortKey>("price-asc");

  const soldCount = project.apartments.filter((a) => a.status === "Sold").length;
  const roomOptions = useMemo(
    () => [...new Set(project.apartments.map((a) => a.rooms))].sort((a, b) => a - b),
    [project.apartments],
  );
  const floorOptions = useMemo(
    () => [...new Set(project.apartments.map((a) => a.floor))].sort((a, b) => a - b),
    [project.apartments],
  );
  const areaOptions = useMemo(
    () => [...new Set(project.apartments.map((a) => a.area))].sort((a, b) => a - b),
    [project.apartments],
  );

  const filtered = useMemo(() => {
    let list = [...project.apartments];
    if (rooms) {
      const r = parseInt(rooms, 10);
      list = list.filter((a) => a.rooms === r);
    }
    if (floor) {
      const f = parseInt(floor, 10);
      list = list.filter((a) => a.floor === f);
    }
    if (minArea > 0) list = list.filter((a) => a.area >= minArea);

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
  }, [project.apartments, rooms, floor, minArea, sort]);

  return (
    <section id="floor-plans" className="scroll-mt-24">
      <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917]">{t.developerDetail.floorPlansTitle}</h2>
          <p className="mt-1 text-sm text-[#57534E]">
            {t.developerDetail.floorPlansTotal}{" "}
            <span className="font-semibold text-[#1C1917]">{project.apartments.length}</span>
          </p>
        </div>
        <div className="flex items-center gap-3 bg-white border border-[#E7E0D5] rounded-lg px-4 py-3">
          <span className="text-2xl font-bold text-[#c9a96e] tabular-nums">{soldCount}</span>
          <span className="text-sm text-[#57534E] leading-tight">{t.developerDetail.sold}</span>
        </div>
      </div>

      <div className="bg-white border border-[#E7E0D5] rounded-xl p-4 sm:p-5 mb-6">
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
          <div>
            <label className="field-label">{t.developerDetail.filterArea}</label>
            <select className={selectCls} value={minArea} onChange={(e) => setMinArea(Number(e.target.value))}>
              <option value={0}>{t.sales.anyArea}</option>
              {areaOptions.map((a) => (
                <option key={a} value={a}>
                  {a} m²+
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">{t.developerDetail.filterRooms}</label>
            <select className={selectCls} value={rooms} onChange={(e) => setRooms(e.target.value)}>
              <option value="">{t.home.searchAnyBedrooms}</option>
              {roomOptions.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="field-label">{t.developerDetail.filterFloor}</label>
            <select className={selectCls} value={floor} onChange={(e) => setFloor(e.target.value)}>
              <option value="">{t.developerDetail.anyFloor}</option>
              {floorOptions.map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
          </div>
          <div className="col-span-2 lg:col-span-2">
            <label className="field-label">{t.developerDetail.sortBy}</label>
            <select
              className={selectCls}
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
            >
              <option value="price-asc">{t.developerDetail.sortPriceAsc}</option>
              <option value="price-desc">{t.developerDetail.sortPriceDesc}</option>
              <option value="area-asc">{t.developerDetail.sortAreaAsc}</option>
              <option value="floor-asc">{t.developerDetail.sortFloorAsc}</option>
            </select>
          </div>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-[#E7E0D5] text-[#57534E]">
          {t.properties.noResults}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
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
