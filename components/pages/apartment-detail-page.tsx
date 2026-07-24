"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BedDouble, Download, Layers, Square } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ApartmentInquiryModal } from "@/components/ApartmentInquiryModal";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { downloadProjectInfoPdf } from "@/lib/download-project-info";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { getProjectDescription } from "@/lib/project-i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";
import { listingCode } from "@/lib/listing-code";

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
  const whatsappMessage = encodeURIComponent(
    `Բարև, հետաքրքրված եմ ${project.title} նախագծի #${aptCode} բնակարանով (${apt.rooms} սեն., ${apt.area} մ²):`,
  );
  const whatsappHref = `https://wa.me/37496799733?text=${whatsappMessage}`;

  function handleDownloadPdf() {
    downloadProjectInfoPdf({
      project,
      apartment: apt,
      statusLabel: getStatusLabel(t, apt.status),
      description: getProjectDescription(project, lang),
      labels: {
        title: t.aptDetail.pdfTitle,
        project: lang === "hy" ? "Նախագիծ" : "Project",
        location: t.aptDetail.locationSpec,
        city: t.admin.city,
        status: t.aptDetail.statusLabel,
        developer: t.projectDetail.developer,
        completion: t.aptDetail.completionSpec,
        floors: t.projectDetail.floors,
        apartment: t.home.searchTypes.apartment,
        price: t.aptDetail.price,
        bedrooms: t.aptDetail.bedrooms,
        area: t.aptDetail.area,
        floor: t.aptDetail.floorSpec,
        view: t.aptDetail.viewSpec,
        description: t.aptDetail.pdfDescription,
        generated: t.aptDetail.pdfGenerated,
      },
    });
  }

  return (
    <main className="bg-white min-h-screen pt-header pb-20">
      <Seo
        title={`${apt.rooms} BR · ${project.title}`}
        description={`${apt.area} m² apartment at ${project.title}, ${project.city}.`}
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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-8 items-start">
          <div className="space-y-6">
            {images.length > 0 ? (
              <div className="rounded-[5px] overflow-hidden">
                <ProjectGallery images={images} title={project.title} />
              </div>
            ) : null}

            {apt.floorPlanImage && (
              <div className="rounded-[5px] bg-white p-4 sm:p-5 shadow-sm border border-[#E5E7EB]">
                <div className="mb-3 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.layoutTitle}</h2>
                  <span className="rounded-[5px] bg-[#F5F0E8] px-3 py-1 text-[11px] font-medium text-[#8B6A33]">
                    {apt.area} m²
                  </span>
                </div>
                <div className="relative w-full h-72 sm:h-[28rem] overflow-hidden rounded-[5px] bg-[#F8FAFC]">
                  <Image
                    src={apt.floorPlanImage}
                    alt={t.aptDetail.layoutTitle}
                    fill
                    unoptimized
                    className="object-cover"
                    sizes="(max-width:1024px) 100vw, 900px"
                  />
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 min-w-0 rounded-[5px] bg-[#F9FAFB] p-5 sm:p-6">
            <StatusBadge status={apt.status} />
            <p className="mt-4 text-3xl font-semibold text-[#0c1428] tabular-nums">
              {sold ? "—" : formatPrice(apt.price)}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">{getStatusLabel(t, apt.status)}</p>

            <div className="mt-5 space-y-3">
              {[
                { icon: BedDouble, label: t.aptDetail.bedrooms, value: `${apt.rooms}` },
                { icon: Square, label: t.aptDetail.area, value: `${apt.area} m²` },
                { icon: Layers, label: t.aptDetail.floorSpec, value: `${apt.floor}` },
                { icon: Square, label: t.aptDetail.viewSpec, value: apt.viewType },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center justify-between gap-3">
                  <div className="inline-flex min-w-0 items-center gap-2 text-[#6B7280]">
                    <Icon size={15} className="shrink-0" />
                    <span className="truncate text-sm">{label}</span>
                  </div>
                  <p className="shrink-0 text-sm font-semibold text-[#0c1428]">{value}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 space-y-2">
              {!sold && (
                <button
                  type="button"
                  onClick={() => setInquiryType("info")}
                  className="flex h-10 w-full items-center justify-center rounded-[5px] bg-[#0c1428] px-3 text-xs font-semibold whitespace-nowrap text-white hover:bg-[#1F2937]"
                >
                  {t.aptDetail.requestInfo}
                </button>
              )}
              <button
                type="button"
                onClick={handleDownloadPdf}
                className="flex h-10 w-full items-center justify-center gap-2 rounded-[5px] border border-[#E5E7EB] bg-white px-3 text-xs font-semibold text-[#0c1428] hover:border-[#0c1428] transition-colors"
              >
                <Download size={15} />
                {t.aptDetail.downloadPdf}
              </button>
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
              <p className="mt-2 text-sm text-[#6B7280] leading-relaxed">
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
