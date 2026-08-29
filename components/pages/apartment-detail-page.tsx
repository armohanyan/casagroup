"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import {
  BedDouble,
  Download,
  Expand,
  Eye,
  Layers,
  MapPin,
  Maximize2,
  Sun,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { FaWhatsapp } from "react-icons/fa";
import { ApartmentInquiryModal } from "@/components/ApartmentInquiryModal";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { ProjectLocationSection } from "@/components/site/ProjectLocationSection";
import { ApartmentFloorLocationSection } from "@/components/sales/ApartmentFloorLocationSection";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { useI18n } from "@/lib/i18n";
import { getApartmentDescription, getApartmentViewType, getProjectCity, getProjectLocation, getProjectTitle } from "@/lib/project-i18n";
import { recordProjectView } from "@/lib/project-views";
import { useProjects } from "@/lib/projects-context";
import { fetchApartment } from "@/lib/api-client";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";
import { apartmentDisplayNumber, hasApartmentNumber } from "@/lib/apartment-number";
import { isHouseUnit } from "@/lib/building-kind";
import type { Apartment, Project } from "@/types";

function SidebarSpecList({
  items,
}: {
  items: { icon: LucideIcon; label: string; value: React.ReactNode; stacked?: boolean }[];
}) {
  return (
    <dl className="divide-y divide-[#E8EAED] overflow-hidden rounded-[5px] border border-[#E8EAED] bg-white">
      {items.map((item) => {
        const Icon = item.icon;
        return (
          <div
            key={item.label}
            className={item.stacked ? "px-3 py-2" : "flex items-center justify-between gap-3 px-3 py-2"}
          >
            <dt className="flex min-w-0 items-center gap-2 text-xs text-[#6B7280]">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-[4px] bg-[#F5F0E8] text-[#8B6A33]">
                <Icon size={13} strokeWidth={2} aria-hidden />
              </span>
              <span className="min-w-0 leading-snug">{item.label}</span>
            </dt>
            <dd
              className={
                item.stacked
                  ? "mt-1 pl-8 text-sm font-semibold leading-snug text-[#0c1428]"
                  : "shrink-0 text-right text-sm font-semibold tabular-nums text-[#0c1428]"
              }
            >
              {item.value}
            </dd>
          </div>
        );
      })}
    </dl>
  );
}

function collectApartmentImages(floorPlanImage: string, gallery: string[]) {
  const seen = new Set<string>();
  const images: string[] = [];
  for (const url of [floorPlanImage, ...gallery]) {
    const trimmed = url?.trim();
    if (!trimmed || seen.has(trimmed)) continue;
    seen.add(trimmed);
    images.push(trimmed);
  }
  return images;
}

export default function ApartmentDetailPage() {
  const params = useParams();
  const aptId = typeof params.aptId === "string" ? params.aptId : undefined;
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { projects, loading: listLoading, upsertProject, refreshProjects } = useProjects();
  const [inquiryType, setInquiryType] = useState<"info" | null>(null);
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const [fetched, setFetched] = useState<{ project: Project; apartment: Apartment } | null>(null);
  const [fetching, setFetching] = useState(() => Boolean(slug && aptId));
  const [fetchFailed, setFetchFailed] = useState(false);

  const fromList = (() => {
    if (!aptId) return undefined;
    for (const project of projects) {
      if (slug && project.slug !== slug) continue;
      const apartment = project.apartments.find((a) => a.id === aptId);
      if (apartment) return { apartment, project };
    }
    return undefined;
  })();

  useEffect(() => {
    if (!slug || !aptId) return;
    let cancelled = false;
    setFetched(null);
    setFetchFailed(false);
    setFetching(true);

    void (async () => {
      try {
        const data = await fetchApartment(slug, aptId);
        if (cancelled) return;
        setFetched(data);
        upsertProject(data.project);
      } catch {
        if (cancelled) return;
        setFetchFailed(true);
      } finally {
        if (!cancelled) setFetching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [slug, aptId, upsertProject]);

  const result = fetched ?? (fetchFailed || !fetching ? fromList : undefined);

  const images = useMemo(
    () =>
      result
        ? collectApartmentImages(result.apartment.floorPlanImage, result.apartment.gallery ?? [])
        : [],
    [result],
  );

  useEffect(() => {
    if (result?.project.id) void recordProjectView(result.project.id);
  }, [result?.project.id]);

  useEffect(() => {
    if (lightboxIndex === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxIndex(null);
      if (e.key === "ArrowLeft") {
        setLightboxIndex((i) => (i !== null ? (i - 1 + images.length) % images.length : null));
      }
      if (e.key === "ArrowRight") {
        setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null));
      }
    };
    window.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [lightboxIndex, images.length]);

  const loading = Boolean(slug && aptId) && !result && (listLoading || fetching);

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
          {fetchFailed ? (
            <button
              type="button"
              onClick={() => {
                void refreshProjects();
                if (!slug || !aptId) return;
                setFetching(true);
                setFetchFailed(false);
                void fetchApartment(slug, aptId)
                  .then((data) => {
                    setFetched(data);
                    upsertProject(data.project);
                  })
                  .catch(() => setFetchFailed(true))
                  .finally(() => setFetching(false));
              }}
              className="mt-4 inline-block text-sm font-semibold text-[#c9a96e]"
            >
              Retry →
            </button>
          ) : (
            <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-[#c9a96e]">
              {t.backProjects} →
            </Link>
          )}
        </div>
      </main>
    );
  }

  const { apartment: apt, project } = result;
  const isHouse = isHouseUnit(apt, project.buildings);
  const path = `/projects/${project.slug}/apartments/${apt.id}`;
  const sold = apt.status === "Sold";
  const aptNumber = apartmentDisplayNumber(apt);
  const showUnitPlaque = hasApartmentNumber(apt);
  const title = getProjectTitle(project, lang);
  const location = getProjectLocation(project, lang);
  const city = getProjectCity(project, lang);
  const description = getApartmentDescription(apt, project, lang).trim();
  const planPdfUrl = apt.planPdfUrl?.trim() || "";
  const pricePerSqm = apt.area > 0 ? Math.round(apt.price / apt.area) : 0;
  const address = `${location}${city ? `, ${city}` : ""}`;
  const priceLabel = sold ? "-" : formatPrice(apt.price);
  const whatsappMessage =
    lang === "hy"
      ? `Բարև, հետաքրքրված եմ ${title} նախագծի №${aptNumber} բնակարանով։\nՀասցե՝ ${address}\nՄակերես՝ ${apt.area} մ²\nԳին՝ ${priceLabel}`
      : lang === "ru"
        ? `Здравствуйте, меня интересует квартира №${aptNumber} в проекте ${title}.\nАдрес: ${address}\nПлощадь: ${apt.area} м²\nЦена: ${priceLabel}`
        : `Hello, I'm interested in apartment №${aptNumber} at ${title}.\nAddress: ${address}\nArea: ${apt.area} m²\nPrice: ${priceLabel}`;
  const whatsappHref = `https://wa.me/37496799733?text=${encodeURIComponent(whatsappMessage)}`;
  const galleryImages = (apt.gallery ?? []).map((u) => u.trim()).filter(Boolean);
  const floorPlanIndex = apt.floorPlanImage?.trim()
    ? images.indexOf(apt.floorPlanImage.trim())
    : -1;

  const openLightbox = (index: number) => {
    if (index >= 0 && index < images.length) setLightboxIndex(index);
  };

  return (
    <main className="bg-white min-h-screen pt-header">
      <Seo
        title={`${showUnitPlaque ? `№${aptNumber} · ` : ""}${apt.rooms} BR · ${title}`}
        description={description || `${apt.area} m² apartment at ${title}, ${city}.`}
        path={path}
        image={apt.floorPlanImage || undefined}
        lang={lang}
        ogType="article"
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.aptDetail.breadHome, path: "/" },
          { name: t.aptDetail.breadProjects, path: "/projects" },
          { name: title, path: `/projects/${project.slug}` },
          { name: showUnitPlaque ? `№${aptNumber}` : `${apt.rooms} BR`, path },
        ])}
      />

      <Container className="py-6 md:py-10">
        <nav className="text-sm text-[#6B7280] mb-6">
          <Link href={`/projects/${project.slug}`} className="hover:text-[#0c1428]">{title}</Link>
          <span className="mx-2">/</span>
          <span className="text-[#0c1428]">
            {showUnitPlaque ? `№${aptNumber} · ` : null}
            {apt.rooms} BR · {isHouse ? `${apt.area} m²` : `${t.aptDetail.floorLabel} ${apt.floor}`}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-8 items-start lg:grid-cols-[minmax(0,1fr)_360px]">
          <div className="min-w-0 space-y-6">
            {apt.floorPlanImage ? (
              <div className="rounded-[5px] border border-[#E5E7EB] bg-white p-4 shadow-sm sm:p-5">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.layoutTitle}</h2>
                  <span className="shrink-0 rounded-[5px] bg-[#F5F0E8] px-3 py-1 text-[11px] font-medium text-[#8B6A33]">
                    {apt.area} m²
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => openLightbox(floorPlanIndex >= 0 ? floorPlanIndex : 0)}
                  className="group relative block h-72 w-full overflow-hidden rounded-[5px] bg-[#F8FAFC] sm:h-[28rem]"
                  aria-label={t.aptDetail.openImage}
                >
                  <Image
                    src={apt.floorPlanImage}
                    alt={t.aptDetail.layoutTitle}
                    fill
                    unoptimized
                    className="object-contain transition-transform duration-300 group-hover:scale-[1.02]"
                    sizes="(max-width:1024px) 100vw, 900px"
                  />
                  <span className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-[5px] bg-black/45 text-white opacity-0 backdrop-blur-sm transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                    <Expand size={16} aria-hidden />
                  </span>
                </button>
              </div>
            ) : null}

            {galleryImages.length > 0 ? (
              <section className="rounded-[5px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.galleryTitle}</h2>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {galleryImages.map((url) => {
                    const index = images.indexOf(url);
                    return (
                      <button
                        key={url}
                        type="button"
                        onClick={() => openLightbox(index)}
                        className="group relative aspect-[4/3] overflow-hidden rounded-[5px] bg-[#F8FAFC]"
                        aria-label={t.aptDetail.openImage}
                      >
                        <Image
                          src={url}
                          alt=""
                          fill
                          unoptimized
                          className="object-cover transition-transform duration-300 group-hover:scale-105"
                          sizes="(max-width:640px) 50vw, 280px"
                        />
                      </button>
                    );
                  })}
                </div>
              </section>
            ) : null}

            {description ? (
              <section className="rounded-[5px] border border-[#E5E7EB] bg-white p-5 sm:p-6">
                <h2 className="text-lg font-semibold text-[#0c1428]">{t.aptDetail.pdfDescription}</h2>
                <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-[#4B5563]">{description}</p>
              </section>
            ) : null}
          </div>

          <aside className="min-w-0 overflow-hidden rounded-[5px] border border-[#E8EAED] bg-[#F9FAFB] p-5 lg:sticky lg:top-24 sm:p-6">
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={apt.status} />
              <span className="inline-flex items-center rounded-[5px] border border-[#E8EAED] bg-white px-2.5 py-1 text-xs font-semibold tabular-nums text-[#0c1428]">
                № {aptNumber}
              </span>
            </div>

            <div className="mt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {t.aptDetail.priceLabel}
              </p>
              <p className="mt-1 break-words text-3xl font-semibold tabular-nums leading-tight text-[#0c1428]">
                {sold ? "-" : formatPrice(apt.price)}
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

            <div className="mt-5 border-t border-[#E8EAED] pt-5">
              <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-[#9CA3AF]">
                {isHouse ? t.aptDetail.specsTitleHouse : t.aptDetail.specsTitle}
              </p>
              <div className="mt-2.5">
                <SidebarSpecList
                  items={[
                    { icon: BedDouble, label: t.aptDetail.bedrooms, value: apt.rooms },
                    { icon: Maximize2, label: t.aptDetail.area, value: `${apt.area} m²` },
                    ...(isHouse
                      ? apt.landArea && apt.landArea > 0
                        ? [{ icon: Layers, label: t.aptDetail.landSpec, value: `${apt.landArea} m²` }]
                        : []
                      : [{ icon: Layers, label: t.aptDetail.floorSpec, value: apt.floor }]),
                    { icon: Eye, label: t.aptDetail.viewSpec, value: getApartmentViewType(apt, lang) || "-" },
                    ...(apt.balcony ? [{ icon: Sun, label: t.aptDetail.balcony, value: t.aptDetail.yes }] : []),
                    { icon: MapPin, label: t.aptDetail.locationSpec, value: address, stacked: true },
                  ]}
                />
              </div>
            </div>

            <div className="mt-5 space-y-2">
              {!sold && (
                <>
                  <button
                    type="button"
                    onClick={() => setInquiryType("info")}
                    className="flex h-11 w-full items-center justify-center rounded-[5px] bg-[#0c1428] px-3 text-sm font-semibold text-white hover:bg-[#1F2937]"
                  >
                    {t.aptDetail.requestInfo}
                  </button>
                  <a
                    href={whatsappHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex h-11 w-full items-center justify-center gap-2 rounded-[5px] bg-[#25D366] px-3 text-sm font-semibold text-white hover:bg-[#1ebe57]"
                  >
                    <FaWhatsapp size={18} aria-hidden />
                    {t.sales.whatsappLabel}
                  </a>
                </>
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

      {!isHouse ? <ApartmentFloorLocationSection project={project} apartment={apt} /> : null}

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

      <ProjectLocationSection project={project} />

      <ApartmentInquiryModal
        type={inquiryType}
        onClose={() => setInquiryType(null)}
        context={{
          projectTitle: title,
          listingCode: aptNumber,
          whatsappHref,
          price: apt.price,
        }}
      />

      <AnimatePresence>
        {lightboxIndex !== null && images[lightboxIndex] && (
          <motion.div
            className="fixed inset-0 z-[1200] flex flex-col bg-black/98"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={t.aptDetail.openImage}
          >
            <div className="flex items-center justify-between gap-4 border-b border-white/10 px-4 py-3">
              <p className="truncate text-sm font-medium text-white">
                {lightboxIndex + 1} / {images.length}
              </p>
              <button
                type="button"
                onClick={() => setLightboxIndex(null)}
                className="shrink-0 rounded-full p-2 text-white hover:bg-white/10"
                aria-label="Close"
              >
                <X size={22} />
              </button>
            </div>

            <div className="relative flex min-h-0 flex-1 items-center justify-center px-2 md:px-12">
              {images.length > 1 ? (
                <>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((i) =>
                        i !== null ? (i - 1 + images.length) % images.length : null,
                      )
                    }
                    className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:left-4"
                    aria-label="Previous"
                  >
                    <ChevronLeft size={24} />
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setLightboxIndex((i) => (i !== null ? (i + 1) % images.length : null))
                    }
                    className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20 md:right-4"
                    aria-label="Next"
                  >
                    <ChevronRight size={24} />
                  </button>
                </>
              ) : null}

              <motion.div
                key={lightboxIndex}
                className="relative h-full max-h-[80vh] w-full max-w-6xl"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.2 }}
              >
                <Image
                  src={images[lightboxIndex]}
                  alt=""
                  fill
                  unoptimized
                  sizes="100vw"
                  className="object-contain"
                  priority
                />
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
