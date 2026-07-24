"use client";

import { useEffect, useMemo } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { DroneVideoSection } from "@/components/DroneVideoSection";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { ProjectMediaShowcase } from "@/components/site/ProjectMediaShowcase";
import { ProjectLocationSection } from "@/components/site/ProjectLocationSection";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjectGallery } from "@/lib/project-gallery";
import { getProjectDescription } from "@/lib/project-i18n";
import { recordProjectView } from "@/lib/project-views";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";

const WHATSAPP = "https://wa.me/37496799733";
const AMENITY_VISUALS = [
  "https://images.unsplash.com/photo-1576675784201-0e142b423952?w=600&q=80",
  "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=600&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=600&q=80",
  "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=600&q=80",
];
const AMENITY_LABELS_HY: Record<string, string> = {
  "Rooftop Pool": "Տանիքի լողավազան",
  "Fitness Center": "Ֆիթնես կենտրոն",
  "Parking": "Կայանատեղի",
  "Security": "Անվտանգություն",
  "Terrace Gardens": "Տեռասային այգիներ",
  "Smart Home": "Խելացի տուն",
  "Underground Parking": "Ստորգետնյա կայանատեղի",
  "24/7 Security": "24/7 անվտանգություն",
  "Valet Parking": "Վալետ կայանատեղի",
  "Concierge": "Կոնսիերժ ծառայություն",
  "Infinity Pool": "Ինֆինիտի լողավազան",
  "Private Gardens": "Մասնավոր այգիներ",
  "Private Security": "Մասնավոր անվտանգություն",
};
const AMENITY_LABELS_EN: Record<string, string> = Object.fromEntries(
  Object.entries(AMENITY_LABELS_HY).map(([enLabel, hyLabel]) => [hyLabel, enLabel]),
);

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { getBySlug, loading } = useProjects();
  const project = slug ? getBySlug(slug) : undefined;

  const galleryItems = useMemo(() => (project ? getProjectGallery(project) : []), [project]);

  useEffect(() => {
    if (project?.id) recordProjectView(project.id);
  }, [project?.id]);

  if (loading) {
    return (
      <main className="min-h-screen pt-header flex items-center justify-center bg-white">
        <p className="text-sm text-[#6B7280]">Loading…</p>
      </main>
    );
  }

  if (!project) {
    return (
      <main className="min-h-screen pt-header flex items-center justify-center bg-white">
        <Seo title={t.projectNotFound} description={t.projectNotFound} path={`/projects/${slug ?? ""}`} lang={lang} noindex />
        <div className="text-center">
          <p className="text-lg font-medium text-[#0c1428]">{t.projectNotFound}</p>
          <Link href="/projects" className="mt-4 inline-block text-sm font-semibold text-[#c9a96e]">{t.backProjects} →</Link>
        </div>
      </main>
    );
  }

  const path = `/projects/${project.slug}`;
  const heroImage = galleryItems[0]?.url ?? project.images[0];
  const description = getProjectDescription(project, lang);
  const localizeAmenityLabel = (label: string) =>
    lang === "hy" ? (AMENITY_LABELS_HY[label] ?? label) : (AMENITY_LABELS_EN[label] ?? label);

  return (
    <main className="bg-white min-h-screen">
      <Seo title={`${project.title} — ${project.city}`} description={description} path={path} image={heroImage} lang={lang} ogType="article" />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.projectDetail.breadHome, path: "/" },
          { name: t.projectDetail.breadProjects, path: "/projects" },
          { name: project.title, path },
        ])}
      />

      <ProjectMediaShowcase project={project} items={galleryItems} />

      <section className="bg-[#F9FAFB] py-8 md:py-10">
        <Container>
          <div className="grid grid-cols-1 items-stretch gap-8 lg:grid-cols-2 lg:gap-10">
            <div className="h-full rounded-2xl bg-white p-4 md:p-5">
              <DroneVideoSection
                videos={project.droneVideos ?? []}
                projectTitle={project.title}
                embedded
              />
            </div>
            <div className="h-full rounded-2xl bg-white p-4 md:p-5">
              <ProjectLocationSection project={project} embedded />
            </div>
          </div>
        </Container>
      </section>

      <Container className="py-8 md:py-10">
        <dl className="flex flex-wrap items-start gap-x-8 gap-y-5 sm:gap-x-12">
          {[
            { label: t.home.startingFrom, value: formatPrice(project.startingPrice) },
            { label: t.projectDetail.available, value: String(project.availableApartmentsCount) },
            { label: t.developerDetail.constructionEnd, value: project.completionDate },
            { label: t.projectDetail.floors, value: String(project.floors) },
          ].map((row) => (
            <div key={row.label} className="min-w-0">
              <dt className="text-xs text-[#9CA3AF]">{row.label}</dt>
              <dd className="mt-1 text-base font-semibold text-[#0c1428] tabular-nums sm:text-lg">{row.value}</dd>
            </div>
          ))}
        </dl>

        {project.amenities.length > 0 && (
          <section className="mt-8">
            <div className="mb-5 flex items-end justify-between gap-4">
              <h2 className="text-xl font-semibold text-[#0c1428]">{t.projectDetail.amenitiesTitle}</h2>
              <span className="text-xs font-medium text-[#9CA3AF]">
                {project.amenities.length}
              </span>
            </div>
            <div className="flex flex-wrap items-start gap-4">
              {project.amenities.slice(0, 8).map((a, idx) => (
                <div
                  key={a.label}
                  className="flex w-[118px] flex-col items-center text-center"
                >
                  <span className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full bg-[#F3F4F6] shadow-sm">
                    <Image
                      src={AMENITY_VISUALS[idx % AMENITY_VISUALS.length]}
                      alt={localizeAmenityLabel(a.label)}
                      fill
                      unoptimized
                      sizes="56px"
                      className="object-cover"
                    />
                  </span>
                  <span className="mt-2 line-clamp-2 text-sm font-normal text-[#0c1428]">{localizeAmenityLabel(a.label)}</span>
                </div>
              ))}
            </div>
          </section>
        )}
      </Container>

      <section id="apartments" className="border-t border-[#E5E7EB]">
        <Container className="py-10 md:py-14">
          <DeveloperFloorPlanSection project={project} />
        </Container>
      </section>

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
          <div className="rounded-2xl bg-white p-5 shadow-sm sm:p-8">
            <MortgageCalculator key={project.id} initialPrice={project.startingPrice} />
          </div>
        </Container>
      </section>

      <section className="py-12 md:py-14 bg-[#0c1428] border-t border-[#E5E7EB]">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-white">{t.projectDetail.interested}</h2>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href="tel:+37496799733"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#c9a96e]/60 bg-transparent px-6 text-sm font-semibold text-[#f7f3eb] transition-colors hover:bg-white/10"
            >
              <Phone size={18} /> {t.nav.call}
            </a>
            <a
              href={WHATSAPP}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex h-12 items-center gap-2 rounded-lg border border-[#c9a96e]/60 bg-transparent px-6 text-sm font-semibold text-[#f7f3eb] transition-colors hover:bg-white/10"
            >
              <MessageCircle size={18} /> WhatsApp
            </a>
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-lg border border-[#c9a96e]/60 bg-transparent px-6 text-sm font-semibold text-[#f7f3eb] transition-colors hover:bg-white/10"
            >
              {t.projectDetail.bookViewing}
            </Link>
          </div>
        </Container>
      </section>
    </main>
  );
}
