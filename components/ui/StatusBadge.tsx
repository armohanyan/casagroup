import { getStatusLabel, useI18n } from "@/lib/i18n";
import type { ProjectStatus, ApartmentStatus } from "@/types";

type BadgeStatus = ProjectStatus | ApartmentStatus;

const statusConfig: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  "Under Construction": { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  "Ready": { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  "Sold Out": { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" },
  "Available": { bg: "bg-emerald-50", text: "text-emerald-800", dot: "bg-emerald-500" },
  "Reserved": { bg: "bg-amber-50", text: "text-amber-800", dot: "bg-amber-500" },
  "Sold": { bg: "bg-red-50", text: "text-red-800", dot: "bg-red-500" },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const { t } = useI18n();
  const cfg = statusConfig[status] ?? statusConfig["Available"];
  const label = getStatusLabel(t, status);

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${cfg.bg} ${cfg.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {label}
    </span>
  );
}
