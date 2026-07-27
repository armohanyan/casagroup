"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BedDouble,
  Download,
  Eye,
  Layers,
  MapPin,
  Maximize2,
  Sun,
} from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ApartmentInquiryModal } from "@/components/ApartmentInquiryModal";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { useI18n } from "@/lib/i18n";
import { getProjectDescription } from "@/lib/project-i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";
import { listingCode } from "@/lib/listing-code";

function SpecItem({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Layers;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-[5px] border border-[#E8EAED] bg-[#F9FAFB] px-4 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[5px] bg-[#F5F0E8] text-[#8B6A33]">
        <Icon size={16} strokeWidth={2} aria-hidden />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">{label}</p>
        <p className="mt-1 break-words text-sm font-semibold leading-snug text-[#0c1428]">{value}</p>
      </div>
    </div>
  );
}

export default function ApartmentDetailPage() {
  const params = useParams();
  const aptId = typeof params.aptId === "string" ? params.aptId : undefined;
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { projects, loading } = useProjects();
  const [inquiryType, setInquiryType] = useState<"info" | null>(null);

  const result = (() => {
    for (const project of projects) {
      const apartment = project.apartments.find((a) => a.id === aptId);
      if (apartment) return { apartment, project };
    }
    return undefined;
  })();

  if (loading) {
    return (
      <main className="min-h-screen pt-header flex items-center justify-center bg-white">
        <p className="text-sm text-[#6B7280]">Loading…</p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="min-h-screen pt-header flex items-center justify-center bg-white">
        <Seo title={t.aptNotFound} description={t.aptNotFound} path={`/projects/${slug ?? "_"}/apartments/${aptId ?? ""}`} lang={lang} noindex />
        <div className="text-center">
          <p className="text-lg font-medium text-[#0c1428]">{t.aptNotFound}</p>
          <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-[#c9a96e]">{t.backProjects} →</Link>
        </div>
      </main>
    );
  }

  const { apartment: apt, project } = result;
  const path = `/projects/${project.slug}/apartments/${apt.id}`;
  const sold = apt.status === "Sold";
  const images = apt.gallery.length > 0 ? apt.gallery : project.images.slice(0, 4);
  const aptCode = listingCode(apt.id);
  const description = (apt.description?.trim() || getProjectDescription(project, lang)).trim();
  const planPdfUrl = apt.planPdfUrl?.trim() || "";
  const pricePerSqm = apt.area > 0 ? Math.round(apt.price / apt.area) : 0;
  const whatsappMessage = encodeURIComponent(
    `Բարև, հետաքրքրված եմ ${project.title} նախագծի #${aptCode} բնակարանով (${apt.rooms} սեն., ${apt.area} մ²):`,
  );
  const whatsappHref = `https://wa.me/37496799733?text=${whatsappMessage}`;

  return (
    <main className="bg-white min-h-screen pt-header pb-20">
      <Seo
        title={`${apt.rooms} BR · ${project.title}`}
        description={description || `${apt.area} m² apartment at ${project.title}, ${project.city}.`}
        path={path}
        image={images[0]}
        lang={lang}
        ogType="article"
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.aptDetail.breadHome, path: "/" },
          { name: t.aptDetail.breadProjects, path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
          { name: `${apt.rooms} BR`, path },
        ])}
      />

      <Container className="py-6 md:py-10">
        <nav className="text-sm text-[#6B7280] mb-6">
          <Link href={`/projects/${project.slug}`} className="hover:text-[#0c1428]">{project.title}</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0c1428]">{apt.rooms} BR · {t.aptDetail.floorLabel} {apt.floor}</span>
        </nav>

        <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-[minmax(0,1fr)_300px]">
          <div className="min-w-0 space-y-6">
            {images.length > 0 ? (
              <div className="overflow-hidden rounded-[5px]">
                <ProjectGallery images={images} title={project.title} />
              </div>
            ) : null}

            {apt.floorPlanImage ? (
              <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.layoutTitle}</h2>
                  <span className="shrink-0 rounded-[5px] bg-[#F5F0E8] px-3 py-1 text-[11px] font-medium text-[#8B6A33]">
                    {apt.area} m²
                  </span>
                </div>
                <div className="relative h-72 w-full overflow-hidden rounded-[5px] bg-[#F8FAFC] sm:h-[28rem]">
                  <Image
                    src={apt.floorPlanImage}
                    alt={t.aptDetail.layoutTitle}
                    fill
                    unoptimized
                    className="object-contain"
                    sizes="(max-width:1024px) 100vw, 900px"
                  />
                </div>
              </div>
            ) : null}

            {description ? (
              <section className="rounded-[5px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.pdfDescription}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#4B5563]">{description}</p>
              </section>
            ) : null}

            <section className="rounded-[5px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
              <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.specsTitle}</h2>
              <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                <SpecItem icon={BedDouble} label={t.aptDetail.bedrooms} value={apt.rooms} />
                <SpecItem icon={Maximize2} label={t.aptDetail.area} value={`${apt.area} m²`} />
                <SpecItem icon={Layers} label={t.aptDetail.floorSpec} value={apt.floor} />
                <SpecItem icon={Eye} label={t.aptDetail.viewSpec} value={apt.viewType?.trim() || "—"} />
                <SpecItem
                  icon={MapPin}
                  label={t.aptDetail.locationSpec}
                  value={`${project.location}${project.city ? `, ${project.city}` : ""}`}
                />
                {apt.balcony ? (
                  <SpecItem icon={Sun} label={t.aptDetail.balcony} value={t.aptDetail.yes} />
                ) : null}
              </div>
            </section>
          </div>

          <aside className="min-w-0 overflow-hidden rounded-[5px] border border-[#E8EAED] bg-[#F9FAFB] p-5 lg:sticky lg:top-24 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={apt.status} />
              <span className="text-xs font-medium text-[#9CA3AF]">#{aptCode}</span>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {t.aptDetail.priceLabel}
              </p>
              <p className="mt-1 break-words text-3xl font-semibold tabular-nums leading-tight text-[#0c1428]">
                {sold ? "—" : formatPrice(apt.price)}
              </p>
            </div>

            {!sold && pricePerSqm > 0 ? (
              <div className="mt-4 border-t border-[#E8EAED] pt-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                  {t.aptDetail.pricePerSqm}
                </p>
                <p className="mt-1 break-words text-lg font-semibold tabular-nums text-[#0c1428]">
                  {formatPrice(pricePerSqm)}
                  <span className="ml-1 text-sm font-medium text-[#6B7280]">/ m²</span>
                </p>
              </div>
            ) : null}

            <div className="mt-6 space-y-2">
              {!sold && (
                <button
                  type="button"
                  onClick={() => setInquiryType("info")}
                  className="flex h-11 w-full items-center justify-center rounded-[5px] bg-[#0c1428] px-3 text-sm font-semibold text-white hover:bg-[#1F2937]"
                >
                  {t.aptDetail.requestInfo}
                </button>
              )}
              {planPdfUrl ? (
                <a
                  href={planPdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-[5px] border border-[#E5E7EB] bg-white px-3 text-sm font-semibold text-[#0c1428] transition-colors hover:border-[#0c1428]"
                >
                  <Download size={16} />
                  {t.aptDetail.downloadPdf}
                </a>
              ) : null}
            </div>
          </aside>
        </div>
      </Container>

      {!sold && (
        <section id="mortgage" className="border-t border-[#E5E7EB] bg-[#F9FAFB]">
          <Container className="py-10 md:py-14">
            <div className="mb-8 max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.14em] text-[#c9a96e]">
                {t.calculator.eyebrow}
              </p>
              <h2 className="mt-2 text-xl font-semibold text-[#0c1428] sm:text-2xl">
                {t.calculator.title}
              </h2>
              <p className="mt-2 text-sm leading-relaxed text-[#6B7280]">
                {t.calculator.subtitle}
              </p>
            </div>
            <div className="rounded-[5px] bg-white p-5 shadow-sm sm:p-8">
              <MortgageCalculator key={apt.id} initialPrice={apt.price} />
            </div>
          </Container>
        </section>
      )}

      <ApartmentInquiryModal
        type={inquiryType}
        onClose={() => setInquiryType(null)}
        context={{
          projectTitle: project.title,
          listingCode: aptCode,
          whatsappHref,
          price: apt.price,
        }}
      />
    </main>
  );
}
