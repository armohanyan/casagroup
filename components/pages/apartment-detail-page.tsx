"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { BedDouble, Layers, Square, Phone } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ContactForm } from "@/components/ContactForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getStatusLabel, useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";

export default function ApartmentDetailPage() {
  const params = useParams();
  const aptId = typeof params.aptId === "string" ? params.aptId : undefined;
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { projects, loading } = useProjects();

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

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8 items-start">
          <div className="space-y-6">
            {images.length > 0 ? (
              <div className="rounded-lg overflow-hidden border border-[#E5E7EB]">
                <ProjectGallery images={images} title={project.title} />
              </div>
            ) : null}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { icon: BedDouble, label: t.aptDetail.bedrooms, value: `${apt.rooms}` },
                { icon: Square, label: t.aptDetail.area, value: `${apt.area} m²` },
                { icon: Layers, label: t.aptDetail.floorSpec, value: `${apt.floor}` },
                { icon: Square, label: t.aptDetail.viewSpec, value: apt.viewType },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="p-4 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                  <Icon size={18} className="text-[#6B7280] mb-2" />
                  <p className="text-xs text-[#6B7280]">{label}</p>
                  <p className="text-sm font-semibold text-[#0c1428] mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {apt.floorPlanImage && (
              <div>
                <h2 className="text-lg font-semibold text-[#0c1428] mb-3">{t.aptDetail.layoutTitle}</h2>
                <div className="relative w-full h-72 sm:h-96 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
                  <Image src={apt.floorPlanImage} alt="" fill unoptimized className="object-contain p-4" sizes="(max-width:1024px) 100vw, 800px" />
                </div>
              </div>
            )}
          </div>

          <aside className="lg:sticky lg:top-24 p-6 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
            <StatusBadge status={apt.status} />
            <p className="mt-4 text-3xl font-semibold text-[#0c1428] tabular-nums">
              {sold ? "—" : formatPrice(apt.price)}
            </p>
            <p className="mt-1 text-sm text-[#6B7280]">{getStatusLabel(t, apt.status)}</p>

            {!sold && (
              <div className="mt-6 space-y-2">
                <Link
                  href="/contact"
                  className="flex h-12 items-center justify-center rounded-lg bg-[#0c1428] text-white text-sm font-semibold hover:bg-[#1F2937]"
                >
                  {t.aptDetail.requestInfo}
                </Link>
                <a
                  href="tel:+37496799733"
                  className="flex h-12 items-center justify-center gap-2 rounded-lg border border-[#E5E7EB] bg-white text-sm font-semibold text-[#0c1428] hover:border-[#0c1428]"
                >
                  <Phone size={16} />
                  {t.aptDetail.requestCall}
                </a>
              </div>
            )}
          </aside>
        </div>

        <section className="mt-12 max-w-lg">
          <h2 className="text-lg font-semibold text-[#0c1428] mb-4">{t.aptDetail.inquireTitle}</h2>
          <ContactForm defaultProject={`${project.title} — ${apt.rooms} BR`} />
        </section>
      </Container>
    </main>
  );
}
