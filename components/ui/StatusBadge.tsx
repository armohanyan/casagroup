import type { ProjectStatus, ApartmentStatus } from "@/types";

type BadgeStatus = ProjectStatus | ApartmentStatus;

const statusConfig: Record<BadgeStatus, { bg: string; text: string; dot: string }> = {
  "Under Construction": { bg: "bg-amber-900/30", text: "text-amber-400", dot: "bg-amber-400" },
  "Ready": { bg: "bg-green-900/30", text: "text-green-400", dot: "bg-green-400" },
  "Sold Out": { bg: "bg-red-900/30", text: "text-red-400", dot: "bg-red-400" },
  "Available": { bg: "bg-green-900/30", text: "text-green-400", dot: "bg-green-400" },
  "Reserved": { bg: "bg-amber-900/30", text: "text-amber-400", dot: "bg-amber-400" },
  "Sold": { bg: "bg-red-900/30", text: "text-red-400", dot: "bg-red-400" },
};

export function StatusBadge({ status }: { status: BadgeStatus }) {
  const cfg = statusConfig[status] ?? statusConfig["Available"];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium tracking-wide ${cfg.bg} ${cfg.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} />
      {status}
    </span>
  );
}
