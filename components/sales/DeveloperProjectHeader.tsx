"use client";

import Image from "next/image";
import { MapPin, Phone, MessageCircle } from "lucide-react";
import { listingCode } from "@/lib/listing-code";
import { useI18n } from "@/lib/i18n";
import { getProjectConstructionStart, getProjectDescription, getProjectLocation, getProjectTitle, getProjectCompletionDate } from "@/lib/project-i18n";
import type { Project } from "@/types";

interface Props {
  project: Project;
}

export function DeveloperProjectHeader({ project }: Props) {
  const { t, lang } = useI18n();
  const code = listingCode(project.id);
  const title = getProjectTitle(project, lang);
  const location = getProjectLocation(project, lang);
  const tagline = getProjectDescription(project, lang);

  const metaRows = [
    { label: t.developerDetail.developer, value: project.developer },
    { label: t.developerDetail.architect, value: project.architect ?? "—" },
    {
      label: t.developerDetail.management,
      value: project.managementCompany ?? project.developer,
    },
    {
      label: t.developerDetail.partnerBank,
      value: project.partnerBank ?? t.developerDetail.partnerBankDefault,
    },
    {
      label: t.developerDetail.constructionStart,
      value: getProjectConstructionStart(project, lang) || t.developerDetail.tbd,
    },
    {
      label: t.developerDetail.constructionEnd,
      value: getProjectCompletionDate(project, lang),
    },
  ];

  const salesRows = [
    {
      label: t.developerDetail.exclusiveRights,
      value: project.exclusiveSalesRights ?? `CasaGroup`,
    },
    { label: t.developerDetail.salesOffice, value: t.contact.address },
    { label: t.developerDetail.phone, value: "+374 96 799733", href: "tel:+37496799733" },
    { label: "WhatsApp", value: "+374 96 799733", href: "https://wa.me/37496799733" },
  ];

  return (
    <section className="bg-white border border-[#E7E0D5] rounded-xl overflow-hidden shadow-sm">
      {project.images[0] ? (
        <div className="relative h-48 sm:h-56 bg-[#F3EFE8]">
          <Image
            src={project.images[0]}
            alt=""
            fill
            priority
            unoptimized
            sizes="(max-width: 1320px) 100vw, 1320px"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#1C1917]/80 via-[#1C1917]/25 to-transparent" />
          <div className="absolute bottom-4 left-4 sm:left-6">
            <span className="inline-block bg-white/95 text-[#1C1917] text-sm font-bold px-3 py-1 rounded tabular-nums">
              {code}
            </span>
          </div>
        </div>
      ) : null}

      <div className="p-5 sm:p-8">
        <h1 className="text-xl sm:text-2xl lg:text-[1.65rem] font-bold text-[#1C1917] leading-snug">
          {title}
          {tagline ? (
            <span className="block mt-2 text-base sm:text-lg font-medium text-[#57534E]">{tagline}</span>
          ) : null}
        </h1>

        {!project.images[0] ? (
          <span className="inline-block mt-4 bg-[#F3EFE8] text-[#1C1917] text-sm font-bold px-3 py-1 rounded tabular-nums border border-[#E7E0D5]">
            {code}
          </span>
        ) : null}

        <div className="flex items-start gap-2 mt-4 text-sm text-[#57534E]">
          <MapPin size={16} className="text-[#c9a96e] shrink-0 mt-0.5" />
          <span>{location}</span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <ul className="space-y-2.5">
            {metaRows.map((row) => (
              <li key={row.label} className="text-sm text-[#57534E] leading-relaxed">
                <span className="text-[#1C1917] font-medium">{row.label}</span>
                {" — "}
                {row.value}
              </li>
            ))}
          </ul>
          <ul className="space-y-2.5">
            {salesRows.map((row) => (
              <li key={row.label} className="text-sm text-[#57534E] leading-relaxed flex items-start gap-2">
                {row.label === t.developerDetail.phone ? (
                  <Phone size={14} className="text-[#c9a96e] shrink-0 mt-1" />
                ) : row.label === "WhatsApp" ? (
                  <MessageCircle size={14} className="text-[#c9a96e] shrink-0 mt-1" />
                ) : null}
                <span>
                  <span className="text-[#1C1917] font-medium">{row.label}</span>
                  {" — "}
                  {row.href ? (
                    <a href={row.href} className="text-[#c9a96e] hover:text-[#a88a52] font-medium">
                      {row.value}
                    </a>
                  ) : (
                    row.value
                  )}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
