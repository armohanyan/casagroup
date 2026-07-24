"use client";

import { motion } from "framer-motion";
import type { LucideIcon } from "lucide-react";
import { adminCardCls } from "@/components/admin/admin-config";
import { cn } from "@/lib/utils";

interface Props {
  label: string;
  value: string | number;
  hint?: string;
  icon: LucideIcon;
  accent?: boolean;
  delay?: number;
}

export function AdminStatCard({ label, value, hint, icon: Icon, accent, delay = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.32, 0.72, 0, 1] }}
      className={cn(adminCardCls, "p-5")}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-[#9CA3AF]">{label}</p>
          <p className="mt-2 text-2xl font-semibold tabular-nums text-[#0c1428] sm:text-3xl">{value}</p>
          {hint ? <p className="mt-1.5 text-xs text-[#6B7280]">{hint}</p> : null}
        </div>
        <span
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-[5px]",
            accent ? "bg-[#c9a96e]/15 text-[#a88a52]" : "bg-[#F3F4F6] text-[#0c1428]",
          )}
        >
          <Icon size={18} strokeWidth={1.75} />
        </span>
      </div>
    </motion.div>
  );
}
