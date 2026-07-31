"use client";

import Link from "next/link";
import { Mail, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const AGENTS = [
  {
    name: "CasaGroup Sales",
    roleKey: "agent" as const,
    email: "info@casagroup.am",
    phone: "+374 96 799733",
    tel: "tel:+37496799733",
  },
];

export function AgentsSection() {
  const { t } = useI18n();

  return (
    <section className="py-12 bg-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl sm:text-2xl font-bold text-[#1C1917] section-heading">{t.sales.agentsTitle}</h2>
          <Link href="/contact" className="text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52]">
            {t.sales.viewAll} →
          </Link>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {AGENTS.map((agent) => (
            <div
              key={agent.email}
              className="flex gap-4 p-5 rounded-xl border border-[#E7E0D5] bg-[#FAF8F5] hover:border-[#c9a96e]/40 transition-colors brand-surface-left"
            >
              <div className="h-16 w-16 shrink-0 rounded-full bg-[#c9a96e]/20 flex items-center justify-center text-[#c9a96e] font-bold text-xl">
                CG
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-[#1C1917]">{agent.name}</p>
                <p className="text-xs text-[#A8A29E] mt-0.5">{t.sales.agentRole}</p>
                <a
                  href={`mailto:${agent.email}`}
                  className="flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#c9a96e] mt-2 truncate"
                >
                  <Mail size={12} className="shrink-0" />
                  {agent.email}
                </a>
                <a
                  href={agent.tel}
                  className="flex items-center gap-1.5 text-xs text-[#57534E] hover:text-[#c9a96e] mt-1"
                >
                  <Phone size={12} className="shrink-0" />
                  {agent.phone}
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
