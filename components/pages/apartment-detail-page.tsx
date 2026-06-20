"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import {
  BedDouble,
  Layers,
  Square,
  Eye,
  Phone,
  Calendar,
  MapPin,
  MessageCircle,
  Calculator,
  ArrowUpRight,
  Home,
  CreditCard,
  Landmark,
  HardHat,
} from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ContactForm } from "@/components/ContactForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Breadcrumbs } from "@/components/ui/Breadcrumbs";
import { FavoriteButton } from "@/components/FavoriteButton";
import { StickyInquiryBar } from "@/components/StickyInquiryBar";
import { ApartmentInquiryModal, type ApartmentInquiryModalType } from "@/components/ApartmentInquiryModal";
import { DeveloperUnitCard } from "@/components/sales/DeveloperUnitCard";
import { HorizontalScroll } from "@/components/sales/HorizontalScroll";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";
import { listingCode } from "@/lib/listing-code";
import { estimateMonthlyPayment } from "@/lib/mortgage-estimate";
import { formatUnitLine } from "@/lib/unit-summary";
import { addRecentlyViewed } from "@/lib/recently-viewed";

const PHONE = "+374 96 799733";

function buildWhatsAppHref(code: number, projectTitle: string, lang: string) {
  const message =
    lang === "hy"
      ? `Բարև, հետաքրքրված եմ բնակարանով #${code} (${projectTitle})`
      : `Hello, I'm interested in apartment #${code} at ${projectTitle}`;
  return `https://wa.me/37496799733?text=${encodeURIComponent(message)}`;
}

function StatPill({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-[#E7E0D5] bg-[#FAFAF8] px-4 py-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white border border-[#E7E0D5]">
        <Icon size={16} className="text-[#c9a96e]" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-[#A8A29E]">{label}</p>
        <p className="text-sm font-semibold text-[#1C1917] tabular-nums">{value}</p>
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 py-2.5 border-b border-[#E7E0D5] last:border-0">
      <span className="text-sm text-[#57534E]">{label}</span>
      <span className="text-sm font-medium text-[#1C1917] text-right">{value}</span>
    </div>
  );
}

export default function ApartmentDetailPage() {
  const params = useParams();
  const aptId = typeof params.aptId === "string" ? params.aptId : undefined;
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { projects, loading: projectsLoading } = useProjects();
  const [inquiryModal, setInquiryModal] = useState<ApartmentInquiryModalType | null>(null);

  const result = (() => {
    for (const project of projects) {
      const apartment = project.apartments.find((a) => a.id === aptId);
      if (apartment) return { apartment, project };
    }
    return undefined;
  })();

  useEffect(() => {
    if (!aptId || projectsLoading) return;
    for (const project of projects) {
      const apt = project.apartments.find((a) => a.id === aptId);
      if (!apt) continue;
      addRecentlyViewed({
        apartmentId: apt.id,
        projectSlug: project.slug,
        title: `${project.title} · ${apt.rooms} BR`,
        price: apt.price,
        image: apt.gallery[0] ?? project.images[0],
      });
      break;
    }
  }, [aptId, projectsLoading, projects]);

  if (projectsLoading) {
    return (
      <main className="bg-[#F6F7FB] min-h-screen pt-header flex items-center justify-center">
        <p className="text-sm text-[#57534E]">Loading…</p>
      </main>
    );
  }

  if (!result) {
    return (
      <main className="bg-[#F6F7FB] min-h-screen pt-header flex items-center justify-center">
        <Seo
          title={t.aptNotFound}
          description={t.aptNotFound}
          path={`/projects/${slug ?? "_"}/apartments/${aptId ?? ""}`}
          lang={lang}
          noindex
        />
        <div className="text-center">
          <p className="font-semibold text-4xl text-[#D6D0C8]">{t.aptNotFound}</p>
          <Link href="/projects" className="mt-8 inline-block text-[#c9a96e] text-sm font-semibold">
            {t.backProjects} →
          </Link>
        </div>
      </main>
    );
  }

  const { apartment: apt, project } = result;
  const path = `/projects/${project.slug}/apartments/${apt.id}`;
  const code = listingCode(apt.id);
  const sold = apt.status === "Sold";
  const monthly = estimateMonthlyPayment(apt.price);
  const titleSeo = `${apt.rooms}-bedroom apartment · ${project.title}`;
  const descSeo = `${apt.rooms}BR residence at ${project.title} in ${project.location}. ${apt.area} m², ${t.aptDetail.floorLabel} ${apt.floor}. Explore availability with CasaGroup.`;

  const galleryImages =
    apt.gallery.length > 0 ? apt.gallery : project.images.slice(0, 4);

  const relatedApartments = project.apartments
    .filter((a) => a.id !== apt.id && a.status === "Available")
    .slice(0, 6);

  const unitSummary = formatUnitLine(lang, 1, apt.floor, apt.area, apt.rooms);
  const whatsappHref = buildWhatsAppHref(code, project.title, lang);

  return (
    <main className="bg-[#F6F7FB] min-h-screen pt-header pb-20 lg:pb-16">
      <Seo
        title={titleSeo}
        description={descSeo}
        path={path}
        image={galleryImages[0] ?? project.images[0]}
        lang={lang}
        ogType="article"
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.aptDetail.breadHome, path: "/" },
          { name: t.aptDetail.breadProjects, path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
          { name: `${apt.rooms}BR · ${t.aptDetail.floorLabel} ${apt.floor}`, path },
        ])}
      />

      <StickyInquiryBar
        price={apt.price}
        whatsappHref={whatsappHref}
        sold={sold}
        onRequestCall={() => setInquiryModal("call")}
        onWhatsApp={() => setInquiryModal("whatsapp")}
        onBookViewing={() => setInquiryModal("visit")}
      />

      <ApartmentInquiryModal
        type={inquiryModal}
        onClose={() => setInquiryModal(null)}
        context={{
          projectTitle: project.title,
          listingCode: code,
          whatsappHref,
          price: apt.price,
        }}
      />

      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Breadcrumbs
          items={[
            { label: t.aptDetail.breadHome, href: "/" },
            { label: t.aptDetail.breadProjects, href: "/projects" },
            { label: project.title, href: `/projects/${project.slug}` },
            { label: `${t.aptDetail.floorLabel} ${apt.floor} · ${apt.rooms} BR` },
          ]}
          className="mb-6 text-[#A8A29E]"
        />

        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_360px] gap-6 lg:gap-8 items-start">
          {/* Main column */}
          <div className="min-w-0 space-y-6">
            {/* Gallery */}
            <section className="card-premium overflow-hidden">
              {galleryImages.length > 0 ? (
                <div className="p-3 sm:p-4">
                  <ProjectGallery images={galleryImages} title={`${project.title} apartment`} />
                </div>
              ) : (
                <div className="h-64 sm:h-80 bg-[#F3EFE8] flex items-center justify-center">
                  <p className="text-[#A8A29E] text-sm">{t.aptDetail.noImages}</p>
                </div>
              )}
            </section>

            {/* Mobile-only quick summary strip */}
            <section className="lg:hidden bg-white border border-[#E7E0D5] rounded-xl p-5 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <StatusBadge status={apt.status} />
                  <p className="mt-3 text-xs font-semibold text-[#A8A29E] tabular-nums">#{code}</p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[#1C1917] tabular-nums">
                    {sold ? "—" : formatPrice(apt.price)}
                  </p>
                  {!sold && (
                    <p className="mt-1 text-xs text-[#57534E]">
                      {t.developerDetail.monthlyPayment}{" "}
                      <span className="font-semibold tabular-nums">{formatPrice(Math.round(monthly))}</span>
                    </p>
                  )}
                </div>
              </div>
              <p className="mt-4 text-sm text-[#57534E] leading-relaxed">{unitSummary}</p>
            </section>

            {/* Key stats — visible on all sizes, compact grid */}
            <section className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <StatPill icon={BedDouble} label={t.aptDetail.bedrooms} value={`${apt.rooms} BR`} />
              <StatPill icon={Square} label={t.aptDetail.area} value={`${apt.area} m²`} />
              <StatPill
                icon={Layers}
                label={t.aptDetail.floorSpec}
                value={`${apt.floor} / ${project.floors}`}
              />
              <StatPill icon={Eye} label={t.aptDetail.viewSpec} value={apt.viewType} />
            </section>

            {/* Floor plan */}
            {apt.floorPlanImage ? (
              <section className="card-premium overflow-hidden">
                <div className="px-5 sm:px-6 py-4 border-b border-[#E7E0D5]">
                  <h2 className="text-base font-bold text-[#1C1917]">{t.aptDetail.layoutTitle}</h2>
                  <p className="text-sm text-[#57534E] mt-0.5">{t.aptDetail.layoutEyebrow}</p>
                </div>
                <div className="p-4 sm:p-6 bg-[#FAFAF8]">
                  <div className="relative w-full h-72 sm:h-96">
                    <Image
                      src={apt.floorPlanImage}
                      alt={t.aptDetail.layoutTitle}
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 800px"
                      className="object-contain"
                    />
                  </div>
                </div>
              </section>
            ) : null}

            {/* Trust blocks */}
            <section className="card-premium p-5 sm:p-6">
              <p className="type-label text-[#c9a96e]">{t.aptDetail.trustEyebrow}</p>
              <h2 className="type-section-heading text-[#1C1917] mt-1">{t.aptDetail.trustTitle}</h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-5">
                {[
                  { icon: CreditCard, title: t.aptDetail.paymentTitle, desc: t.aptDetail.paymentDesc },
                  { icon: Landmark, title: t.aptDetail.mortgageTitle, desc: t.aptDetail.mortgageDesc },
                  { icon: HardHat, title: t.aptDetail.progressTitle, desc: t.aptDetail.progressDesc },
                ].map(({ icon: Icon, title, desc }) => (
                  <div key={title} className="p-4 rounded-lg bg-[#FAFAF8] border border-[#E7E0D5]">
                    <Icon size={18} className="text-[#c9a96e] mb-2" />
                    <h3 className="text-sm font-semibold text-[#1C1917]">{title}</h3>
                    <p className="text-xs text-[#57534E] mt-1 leading-relaxed">{desc}</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Project context */}
            <Link
              href={`/projects/${project.slug}`}
              className="group flex items-center gap-4 bg-white border border-[#E7E0D5] rounded-xl p-5 shadow-sm hover:border-[#c9a96e]/40 transition-colors"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-[#F3EFE8] border border-[#E7E0D5]">
                <Home size={20} className="text-[#c9a96e]" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[#A8A29E]">
                  {t.aptDetail.breadProjects}
                </p>
                <p className="font-semibold text-[#1C1917] truncate">{project.title}</p>
                <p className="text-sm text-[#57534E] flex items-center gap-1 mt-0.5">
                  <MapPin size={12} className="text-[#c9a96e] shrink-0" />
                  <span className="truncate">{project.location}</span>
                </p>
              </div>
              <ArrowUpRight
                size={18}
                className="text-[#A8A29E] group-hover:text-[#c9a96e] shrink-0 transition-colors"
              />
            </Link>
          </div>

          {/* Sticky sidebar */}
          <aside className="lg:sticky lg:top-24 space-y-4">
            <div className="card-premium overflow-hidden">
              <div className="p-5 sm:p-6 border-b border-[#E7E0D5] bg-[#FAFAF8]">
                <div className="hidden lg:flex items-start justify-between gap-3 mb-4">
                  <StatusBadge status={apt.status} />
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-[#A8A29E] tabular-nums">#{code}</span>
                    <FavoriteButton apartmentId={apt.id} />
                  </div>
                </div>

                <h1 className="hidden lg:block type-card-title text-[#1C1917] leading-snug">
                  {apt.rooms} {t.aptDetail.bedroomApt}
                </h1>
                <p className="hidden lg:block mt-1 text-sm text-[#57534E]">{unitSummary}</p>

                <div className="hidden lg:block mt-5">
                  <p className="text-xs font-medium uppercase tracking-wide text-[#A8A29E]">
                    {t.aptDetail.priceLabel}
                  </p>
                  <p className="mt-1 text-3xl font-bold text-[#1C1917] tabular-nums">
                    {sold ? "—" : formatPrice(apt.price)}
                  </p>
                  {!sold && (
                    <p className="mt-2 text-sm text-[#57534E]">
                      {t.developerDetail.monthlyPayment}{" "}
                      <span className="font-semibold text-[#1C1917] tabular-nums">
                        {formatPrice(Math.round(monthly))}
                      </span>
                    </p>
                  )}
                </div>
              </div>

              <div className="p-5 sm:p-6">
                <DetailRow label={t.aptDetail.viewShort} value={apt.viewType} />
                <DetailRow
                  label={t.aptDetail.balcony}
                  value={apt.balcony ? t.aptDetail.yes : t.aptDetail.no}
                />
                <DetailRow label={t.aptDetail.completionSpec} value={project.completionDate} />
                <DetailRow label={t.aptDetail.statusLabel} value={getStatusLabel(t, apt.status)} />
                <DetailRow label={t.aptDetail.locationSpec} value={project.city} />

                {!sold && (
                  <div className="mt-6 space-y-2.5">
                    <button
                      type="button"
                      onClick={() => setInquiryModal("info")}
                      className="btn-primary flex w-full items-center justify-center gap-2 py-3.5 text-sm rounded-lg type-button"
                    >
                      <Calendar size={16} />
                      {t.aptDetail.requestInfo}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryModal("call")}
                      className="btn-outline flex w-full items-center justify-center gap-2 py-3 text-sm rounded-lg type-button"
                    >
                      <Phone size={16} />
                      {t.aptDetail.requestCall}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryModal("whatsapp")}
                      className="flex w-full items-center justify-center gap-2 py-3 text-sm font-semibold rounded-lg border border-[#25D366]/30 text-[#128C7E] bg-[#25D366]/5 hover:bg-[#25D366]/10 transition-colors type-button"
                    >
                      <MessageCircle size={16} />
                      {t.sales.whatsappLabel}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryModal("visit")}
                      className="btn-outline flex w-full items-center justify-center gap-2 py-3 text-sm rounded-lg type-button"
                    >
                      <Calendar size={16} />
                      {t.aptDetail.scheduleVisit}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInquiryModal("calculator")}
                      className="flex w-full items-center justify-center gap-2 py-3 text-sm font-medium text-[#57534E] hover:text-[#c9a96e] transition-colors"
                    >
                      <Calculator size={14} />
                      {t.calculator.title}
                    </button>
                  </div>
                )}

                <p className="mt-5 pt-4 border-t border-[#E7E0D5] text-xs text-[#A8A29E] text-center">
                  {PHONE}
                </p>
              </div>
            </div>

            <p className="hidden lg:block text-xs text-[#57534E] leading-relaxed px-1">
              {t.aptDetail.interestedDesc}
            </p>
          </aside>
        </div>

        {/* Related apartments */}
        {relatedApartments.length > 0 && (
          <section className="mt-12 sm:mt-16">
            <div className="flex items-end justify-between gap-4 mb-5">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-[#c9a96e]">
                  {t.aptDetail.relatedEyebrow}
                </p>
                <h2 className="text-xl font-bold text-[#1C1917] mt-1">{t.aptDetail.relatedTitle}</h2>
              </div>
              <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-semibold text-[#c9a96e] hover:text-[#a88a52] shrink-0"
              >
                {t.backProjects} →
              </Link>
            </div>
            <HorizontalScroll>
              {relatedApartments.map((a) => (
                <div key={a.id} className="snap-start shrink-0 w-[260px] sm:w-[280px]">
                  <DeveloperUnitCard apartment={a} projectSlug={project.slug} />
                </div>
              ))}
            </HorizontalScroll>
          </section>
        )}

        {/* Inquiry */}
        <section className="mt-12 sm:mt-16 card-premium p-6 sm:p-10">
          <div className="max-w-xl mx-auto text-center mb-8">
            <p className="type-label text-[#c9a96e]">{t.aptDetail.inquireEyebrow}</p>
            <h2 className="type-section-heading text-[#1C1917] mt-2">{t.aptDetail.inquireTitle}</h2>
            <p className="text-sm text-[#57534E] mt-2">{t.aptDetail.inquireSubtitle}</p>
          </div>
          <div className="max-w-xl mx-auto">
            <ContactForm defaultProject={project.title} />
          </div>
        </section>
      </div>
    </main>
  );
}
