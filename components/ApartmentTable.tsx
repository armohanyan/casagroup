import { motion } from "framer-motion";
import Link from "next/link";
import { StatusBadge } from "./ui/StatusBadge";
import { useI18n } from "@/lib/i18n";
import type { Apartment } from "@/types";

interface Props {
  apartments: Apartment[];
  projectSlug: string;
}

function formatPrice(p: number) {
  return p >= 1_000_000
    ? `$${(p / 1_000_000).toFixed(1)}M`
    : `$${(p / 1000).toFixed(0)}K`;
}

export function ApartmentTable({ apartments, projectSlug }: Props) {
  const { t } = useI18n();
  const headers = [t.table.floor, t.table.rooms, t.table.area, t.table.price, t.table.view, t.table.status, ""];

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-[#2a2520]">
            {headers.map((h, i) => (
              <th key={i} className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase text-[#5a554f] font-medium whitespace-nowrap">
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {apartments.map((apt, i) => (
            <motion.tr
              key={apt.id}
              className="border-b border-[#1e2d45] hover:bg-[#0f1e30] transition-colors group"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05, duration: 0.4 }}
            >
              <td className="py-4 px-4 text-[#f0ece4] font-['DM_Mono'] text-sm">{apt.floor}</td>
              <td className="py-4 px-4 text-[#f0ece4] text-sm">{apt.rooms} BR</td>
              <td className="py-4 px-4 text-[#f0ece4] font-['DM_Mono'] text-sm">{apt.area}</td>
              <td className="py-4 px-4 text-[#c9a96e] font-['DM_Mono'] font-medium text-sm">{formatPrice(apt.price)}</td>
              <td className="py-4 px-4 text-[#9a9085] text-sm">{apt.viewType}</td>
              <td className="py-4 px-4"><StatusBadge status={apt.status} /></td>
              <td className="py-4 px-4">
                <Link href={`/projects/${projectSlug}/apartments/${apt.id}`}>
                  <span className="text-xs tracking-widest uppercase text-[#c9a96e] opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer whitespace-nowrap">
                    {t.table.viewBtn}
                  </span>
                </Link>
              </td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
