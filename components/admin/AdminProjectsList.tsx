"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  Building2,
  Edit3,
  Plus,
  Search,
  Trash2,
  Filter,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { useAdminToast } from "@/components/admin/AdminToast";
import {
  ADMIN_BASE,
  adminBtnPrimary,
  adminBtnSecondary,
  adminCardCls,
  adminInputCls,
  adminSelectCls,
} from "@/components/admin/admin-config";
import { ProjectViewCount } from "@/components/site/ProjectViewCount";
import { formatPrice } from "@/lib/format-price";
import { getStatusLabel } from "@/lib/i18n";
import { getProjectCity, getProjectLocation, getProjectTitle, projectMatchesQuery } from "@/lib/project-i18n";
import { useProjects } from "@/lib/projects-context";
import { hyTranslations } from "@/content/hy";
import type { ProjectStatus } from "@/types";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function AdminProjectsList() {
  const { projects, loading, deleteProject } = useProjects();
  const { toast } = useAdminToast();
  const router = useRouter();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | ProjectStatus>("");
  const [page, setPage] = useState(1);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [hy] = useState(true);

  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    return projects.filter((p) => {
      if (status && p.status !== status) return false;
      if (!query) return true;
      return projectMatchesQuery(p, query);
    });
  }, [projects, q, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [q, status]);

  async function handleDelete(id: string) {
    try {
      await deleteProject(id);
      setConfirmId(null);
      toast(hyTranslations.admin.toastDeleted, "error");
    } catch (e) {
      toast(e instanceof Error ? e.message : String(e), "error");
    }
  }

  return (
    <div>
      <AdminPageHeader
        title={hy ? "Նախագծեր" : "Projects"}
        description={hy ? "Կառավարեք բոլոր նախագծերը մեկ տեղում" : "Manage all projects in one place"}
        breadcrumbs={[
          { label: hy ? "Վահանակ" : "Dashboard", href: ADMIN_BASE },
          { label: hy ? "Նախագծեր" : "Projects" },
        ]}
        actions={
          <Link href={`${ADMIN_BASE}/projects/new`} className={adminBtnPrimary}>
            <Plus size={16} />
            {hyTranslations.admin.newProject}
          </Link>
        }
      />

      <div className={`${adminCardCls} overflow-hidden`}>
        <div className="flex flex-col gap-3 border-b border-[#F0F1F3] p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={hy ? "Որոնել նախագիծ, հասցե, կառուցապատող…" : "Search project, location, developer…"}
              className={cn(adminInputCls, "pl-9")}
            />
          </div>
          <div className="relative sm:w-48">
            <Filter size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as "" | ProjectStatus)}
              className={cn(adminSelectCls, "pl-9")}
            >
              <option value="">{hy ? "Բոլոր կարգավիճակները" : "All statuses"}</option>
              <option value="Under Construction">{getStatusLabel(hyTranslations, "Under Construction")}</option>
              <option value="Ready">{getStatusLabel(hyTranslations, "Ready")}</option>
              <option value="Sold Out">{getStatusLabel(hyTranslations, "Sold Out")}</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[880px] text-left text-sm">
            <thead>
              <tr className="border-b border-[#F0F1F3] bg-[#FAFAFA] text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                <th className="px-4 py-3">{hy ? "Նախագիծ" : "Project"}</th>
                <th className="px-4 py-3">{hy ? "Տեղադրություն" : "Location"}</th>
                <th className="px-4 py-3">{hy ? "Կառուցապատող" : "Developer"}</th>
                <th className="px-4 py-3">{hy ? "Կարգավիճակ" : "Status"}</th>
                <th className="px-4 py-3">{hy ? "Հասանելի" : "Available"}</th>
                <th className="px-4 py-3">{hy ? "Դիտումներ" : "Views"}</th>
                <th className="px-4 py-3">{hy ? "Սկսած" : "From"}</th>
                <th className="px-4 py-3 text-right">{hy ? "Գործողություններ" : "Actions"}</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#9CA3AF]">
                    {hy ? "Բեռնվում է…" : "Loading…"}
                  </td>
                </tr>
              )}
              {!loading && pageItems.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-4 py-12 text-center text-[#9CA3AF]">
                    {hy ? "Արդյունքներ չկան" : "No results"}
                  </td>
                </tr>
              )}
              {pageItems.map((p, i) => (
                <motion.tr
                  key={p.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.03 }}
                  className="border-b border-[#F0F1F3] last:border-0 hover:bg-[#F9FAFB] transition-colors"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="relative h-11 w-14 shrink-0 overflow-hidden rounded-[5px] bg-[#F3F4F6]">
                        {p.images[0] ? (
                          <Image src={p.images[0]} alt="" fill unoptimized className="object-cover" sizes="56px" />
                        ) : (
                          <span className="flex h-full items-center justify-center text-[#D1D5DB]">
                            <Building2 size={14} />
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-[#0c1428]">{getProjectTitle(p, "hy")}</p>
                        <p className="truncate text-xs text-[#9CA3AF]">
                          {p.titleHy && p.title && p.titleHy.trim() !== p.title.trim() ? p.title : p.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-[#6B7280]">
                    <span className="line-clamp-2">{getProjectCity(p, "hy")}, {getProjectLocation(p, "hy")}</span>
                  </td>
                  <td className="px-4 py-3 text-[#0c1428]">{p.developer}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-[5px] bg-[#F3F4F6] px-2 py-1 text-[11px] font-semibold text-[#0c1428]">
                      {getStatusLabel(hyTranslations, p.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium text-[#0c1428]">
                    {p.availableApartmentsCount}
                  </td>
                  <td className="px-4 py-3">
                    <ProjectViewCount
                      projectId={p.id}
                      count={p.viewCount}
                      label={hy ? "Դիտումներ" : "Views"}
                    />
                  </td>
                  <td className="px-4 py-3 tabular-nums font-medium text-[#0c1428]">
                    {formatPrice(p.startingPrice)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => router.push(`${ADMIN_BASE}/projects/${p.id}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-[5px] text-[#6B7280] hover:bg-white hover:text-[#0c1428] hover:shadow-sm transition-all"
                        aria-label="Edit"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmId(p.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-[5px] text-[#6B7280] hover:bg-red-50 hover:text-red-600 transition-all"
                        aria-label="Delete"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-[#F0F1F3] px-4 py-3">
          <p className="text-xs text-[#9CA3AF]">
            {filtered.length} {hy ? "նախագիծ" : "projects"}
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className={cn(adminBtnSecondary, "h-8 px-3 text-xs disabled:opacity-40")}
            >
              {hy ? "Նախորդ" : "Prev"}
            </button>
            <span className="text-xs font-medium text-[#6B7280]">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className={cn(adminBtnSecondary, "h-8 px-3 text-xs disabled:opacity-40")}
            >
              {hy ? "Հաջորդ" : "Next"}
            </button>
          </div>
        </div>
      </div>

      {confirmId && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center bg-[#0c1428]/45 p-4 backdrop-blur-sm">
          <div className={`${adminCardCls} w-full max-w-sm p-6 text-center`}>
            <Trash2 size={28} className="mx-auto text-red-500" />
            <h3 className="mt-3 text-lg font-semibold text-[#0c1428]">{hyTranslations.admin.deleteTitle}</h3>
            <p className="mt-2 text-sm text-[#6B7280]">{hyTranslations.admin.deleteBody}</p>
            <div className="mt-6 flex gap-2">
              <button type="button" onClick={() => setConfirmId(null)} className={cn(adminBtnSecondary, "flex-1")}>
                {hyTranslations.admin.cancel}
              </button>
              <button
                type="button"
                onClick={() => handleDelete(confirmId)}
                className="flex-1 h-10 rounded-[5px] bg-red-500 text-sm font-semibold text-white hover:bg-red-600 transition-colors"
              >
                {hyTranslations.admin.delete}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
