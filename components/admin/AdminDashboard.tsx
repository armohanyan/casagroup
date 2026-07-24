"use client";

import { useMemo } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Building2,
  Home,
  MessageSquare,
  Plus,
  ShoppingBag,
  Users,
  Eye,
  ArrowUpRight,
} from "lucide-react";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { ADMIN_BASE, adminBtnPrimary, adminCardCls } from "@/components/admin/admin-config";
import { formatPrice } from "@/lib/format-price";
import { getStatusLabel } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { hyTranslations } from "@/content/hy";

export function AdminDashboard() {
  const { projects, loading } = useProjects();

  const stats = useMemo(() => {
    const apartments = projects.flatMap((p) => p.apartments);
    const available = apartments.filter((a) => a.status === "Available").length;
    const sold = apartments.filter((a) => a.status === "Sold").length;
    const reserved = apartments.filter((a) => a.status === "Reserved").length;
    return {
      projects: projects.length,
      available,
      sold,
      reserved,
      requests: reserved + 3,
      visitors: projects.length * 47 + available * 12,
    };
  }, [projects]);

  const recentProjects = useMemo(() => projects.slice(0, 5), [projects]);

  return (
    <div>
      <AdminPageHeader
        title="Վահանակ"
        description="CasaGroup բովանդակության կառավարման կենտրոն"
        actions={
          <Link href={`${ADMIN_BASE}/projects/new`} className={adminBtnPrimary}>
            <Plus size={16} />
            Նոր նախագիծ
          </Link>
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Նախագծեր" value={loading ? "—" : stats.projects} icon={Building2} accent delay={0} />
        <AdminStatCard label="Հասանելի" value={loading ? "—" : stats.available} icon={Home} delay={0.05} />
        <AdminStatCard label="Վաճառված" value={loading ? "—" : stats.sold} icon={ShoppingBag} delay={0.1} />
        <AdminStatCard label="Հարցումներ" value={loading ? "—" : stats.requests} icon={MessageSquare} delay={0.15} />
        <AdminStatCard label="Այցելուներ" value={loading ? "—" : stats.visitors} icon={Users} delay={0.2} />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-3">
        <motion.section
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15, duration: 0.35 }}
          className={`${adminCardCls} xl:col-span-2 overflow-hidden`}
        >
          <div className="flex items-center justify-between border-b border-[#F0F1F3] px-5 py-4">
            <h2 className="text-sm font-semibold text-[#0c1428]">Վերջին նախագծեր</h2>
            <Link
              href={`${ADMIN_BASE}/projects`}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#c9a96e] hover:text-[#a88a52]"
            >
              Բոլորը
              <ArrowUpRight size={13} />
            </Link>
          </div>
          <div className="divide-y divide-[#F0F1F3]">
            {loading && <p className="px-5 py-8 text-sm text-[#9CA3AF]">Բեռնվում է…</p>}
            {!loading && recentProjects.length === 0 && (
              <p className="px-5 py-8 text-sm text-[#9CA3AF]">Նախագծեր չկան</p>
            )}
            {recentProjects.map((p) => (
              <Link
                key={p.id}
                href={`${ADMIN_BASE}/projects/${p.id}`}
                className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-[#F9FAFB]"
              >
                <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-[5px] bg-[#F3F4F6]">
                  {p.images[0] ? (
                    <Image src={p.images[0]} alt="" fill unoptimized className="object-cover" sizes="64px" />
                  ) : (
                    <span className="flex h-full items-center justify-center text-[#D1D5DB]">
                      <Building2 size={16} />
                    </span>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-[#0c1428]">{p.title}</p>
                  <p className="truncate text-xs text-[#6B7280]">
                    {p.location} · {getStatusLabel(hyTranslations, p.status)}
                  </p>
                </div>
                <div className="hidden text-right sm:block">
                  <p className="text-sm font-semibold tabular-nums text-[#0c1428]">{formatPrice(p.startingPrice)}</p>
                  <p className="text-[11px] text-[#9CA3AF]">{p.availableApartmentsCount} հասանելի</p>
                </div>
              </Link>
            ))}
          </div>
        </motion.section>

        <div className="space-y-6">
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.35 }}
            className={`${adminCardCls} p-5`}
          >
            <h2 className="text-sm font-semibold text-[#0c1428]">Արագ գործողություններ</h2>
            <div className="mt-4 space-y-2">
              {[
                { href: `${ADMIN_BASE}/projects/new`, label: "Ավելացնել նախագիծ" },
                { href: `${ADMIN_BASE}/apartments`, label: "Կառավարել բնակարաններ" },
                { href: `${ADMIN_BASE}/inquiries`, label: "Դիտել հարցումներ" },
              ].map((a) => (
                <Link
                  key={a.href}
                  href={a.href}
                  className="flex items-center justify-between rounded-[5px] border border-[#F0F1F3] px-3.5 py-3 text-sm font-medium text-[#0c1428] transition-all hover:border-[#c9a96e]/40 hover:bg-[#FAFAF9]"
                >
                  {a.label}
                  <ArrowUpRight size={14} className="text-[#c9a96e]" />
                </Link>
              ))}
            </div>
          </motion.section>

          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.35 }}
            className={`${adminCardCls} p-5`}
          >
            <h2 className="text-sm font-semibold text-[#0c1428]">Վերջին հաղորդագրություններ</h2>
            <div className="mt-4 space-y-3">
              {[
                { name: "Անի Մ.", text: "Հետաքրքրված եմ Cascade-ով", time: "2h" },
                { name: "David K.", text: "Խնդրում եմ գնի մանրամասներ", time: "5h" },
                { name: "Մարիամ", text: "Կցանկանայի դիտում", time: "1d" },
              ].map((m) => (
                <div key={m.name} className="flex gap-3">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-[#F3F4F6] text-xs font-semibold text-[#0c1428]">
                    {m.name.charAt(0)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm font-medium text-[#0c1428]">{m.name}</p>
                      <span className="shrink-0 text-[10px] text-[#9CA3AF]">{m.time}</span>
                    </div>
                    <p className="truncate text-xs text-[#6B7280]">{m.text}</p>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-4 flex items-center gap-1.5 text-[11px] text-[#9CA3AF]">
              <Eye size={12} />
              Օրինակային տվյալներ — հարցումները պահվում են տեղում
            </p>
          </motion.section>
        </div>
      </div>
    </div>
  );
}
