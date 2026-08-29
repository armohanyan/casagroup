"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import {
  ADMIN_BASE,
  adminCardCls,
  adminInputCls,
  adminSelectCls,
} from "@/components/admin/admin-config";
import { formatPrice } from "@/lib/format-price";
import { getStatusLabel } from "@/lib/i18n";
import { getApartmentViewType, getProjectTitle } from "@/lib/project-i18n";
import { useProjects } from "@/lib/projects-context";
import { hyTranslations } from "@/content/hy";
import type { ApartmentStatus } from "@/types";
import { cn } from "@/lib/utils";

export function AdminApartmentsList() {
  const { projects, loading } = useProjects();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | ApartmentStatus>("");

  const rows = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.flatMap((p) =>
      p.apartments
        .filter((apt) => {
          if (status && apt.status !== status) return false;
          if (!query) return true;
          return (
            p.title.toLowerCase().includes(query) ||
            (p.titleHy ?? "").toLowerCase().includes(query) ||
            (p.titleRu ?? "").toLowerCase().includes(query) ||
            apt.id.toLowerCase().includes(query) ||
            (apt.apartmentNumber ?? "").toLowerCase().includes(query) ||
            String(apt.rooms).includes(query)
          );
        })
        .map((apt) => ({ apt, project: p })),
    );
  }, [projects, q, status]);

  return (
    <div>
      <AdminPageHeader
        title="Բնակարաններ"
        description="Բոլոր նախագծերի բնակարանները մեկ աղյուսակում"
        breadcrumbs={[
          { label: "Վահանակ", href: ADMIN_BASE },
          { label: "Բնակարաններ" },
        ]}
      />

      <div className={`${adminCardCls} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-[#F0F1F3] p-4 sm:flex-row">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Որոնել բնակարան կամ նախագիծ…"
              className={cn(adminInputCls, "pl-9")}
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "" | ApartmentStatus)}
            className={cn(adminSelectCls, "sm:w-44")}
          >
            <option value="">Բոլորը</option>
            <option value="Available">{getStatusLabel(hyTranslations, "Available")}</option>
            <option value="Reserved">{getStatusLabel(hyTranslations, "Reserved")}</option>
            <option value="Sold">{getStatusLabel(hyTranslations, "Sold")}</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F1F3] bg-[#FAFAFA] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                <th className="px-4 py-3">Համար</th>
                <th className="px-4 py-3">Նախագիծ</th>
                <th className="px-4 py-3">Հարկ</th>
                <th className="px-4 py-3">Սեն.</th>
                <th className="px-4 py-3">Մ²</th>
                <th className="px-4 py-3">Գին</th>
                <th className="px-4 py-3">Տեսարան</th>
                <th className="px-4 py-3">Կարգավիճակ</th>
                <th className="px-4 py-3">Պատշգամբ</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#9CA3AF]">
                    Բեռնվում է…
                  </td>
                </tr>
              )}
              {!loading && rows.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-4 py-12 text-center text-[#9CA3AF]">
                    Արդյունքներ չկան
                  </td>
                </tr>
              )}
              {rows.map(({ apt, project }) => (
                <tr key={`${project.id}-${apt.id}`} className="border-b border-[#F0F1F3] last:border-0 hover:bg-[#F9FAFB]">
                  <td className="px-4 py-3">
                    <span className="font-semibold tabular-nums text-[#0c1428]">
                      {apt.apartmentNumber?.trim() || "-"}
                    </span>
                    <span className="mt-0.5 block font-mono text-[10px] text-[#9CA3AF]">{apt.id.slice(0, 8)}</span>
                  </td>
                  <td className="px-4 py-3">
                    <Link href={`${ADMIN_BASE}/projects/${project.id}`} className="font-medium text-[#0c1428] hover:text-[#c9a96e]">
                      {getProjectTitle(project, "hy")}
                    </Link>
                  </td>
                  <td className="px-4 py-3 tabular-nums">{apt.floor}</td>
                  <td className="px-4 py-3 tabular-nums">{apt.rooms}</td>
                  <td className="px-4 py-3 tabular-nums">{apt.area}</td>
                  <td className="px-4 py-3 tabular-nums font-medium">{formatPrice(apt.price)}</td>
                  <td className="px-4 py-3 text-[#6B7280]">{getApartmentViewType(apt, "hy") || "-"}</td>
                  <td className="px-4 py-3">
                    <span className="rounded-[5px] bg-[#F3F4F6] px-2 py-1 text-[11px] font-semibold">
                      {getStatusLabel(hyTranslations, apt.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">{apt.balcony ? "Այո" : "Ոչ"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
