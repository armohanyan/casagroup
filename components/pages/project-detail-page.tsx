"use client";

import { useMemo } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Phone, MessageCircle } from "lucide-react";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { ContactForm } from "@/components/ContactForm";
import { ProjectMediaShowcase } from "@/components/site/ProjectMediaShowcase";
import { ProjectLocationSection } from "@/components/site/ProjectLocationSection";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjectGallery } from "@/lib/project-gallery";
import { getProjectDescription } from "@/lib/project-i18n";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { formatPrice } from "@/lib/format-price";

const WHATSAPP = "https://wa.me/37496799733";

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { getBySlug, loading } = useProjects();
  const project = slug ? getBySlug(slug) : undefined;

  const galleryItems = useMemo(() => (project ? getProjectGallery(project) : []), [project]);

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

      <Container className="py-8 md:py-10">
        <dl className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: t.home.startingFrom, value: formatPrice(project.startingPrice) },
            { label: t.projectDetail.available, value: String(project.availableApartmentsCount) },
            { label: t.developerDetail.constructionEnd, value: project.completionDate },
            { label: t.projectDetail.floors, value: String(project.floors) },
          ].map((row) => (
            <div key={row.label} className="p-3 rounded-lg border border-[#E5E7EB] bg-[#F9FAFB]">
              <dt className="text-xs text-[#6B7280]">{row.label}</dt>
              <dd className="mt-1 text-base font-semibold text-[#0c1428] tabular-nums">{row.value}</dd>
            </div>
          ))}
        </dl>

        <p className="mt-6 text-base text-[#374151] leading-relaxed max-w-2xl line-clamp-4">{description}</p>
      </Container>

      <section id="apartments" className="border-t border-[#E5E7EB]">
        <Container className="py-10 md:py-14">
          <DeveloperFloorPlanSection project={project} />
        </Container>
      </section>

      {project.amenities.length > 0 && (
        <Container className="py-10 border-t border-[#E5E7EB]">
          <h2 className="text-xl font-semibold text-[#0c1428] mb-4">{t.projectDetail.amenitiesTitle}</h2>
          <ul className="flex flex-wrap gap-2">
            {project.amenities.map((a) => (
              <li key={a.label} className="text-sm text-[#374151] py-2 px-4 bg-[#F9FAFB] rounded-full border border-[#E5E7EB]">
                {a.label}
              </li>
            ))}
          </ul>
        </Container>
      )}

      <ProjectLocationSection project={project} />

      <section className="py-12 md:py-14 bg-[#0c1428] border-t border-[#E5E7EB]">
        <Container className="text-center">
          <h2 className="text-2xl font-semibold text-white">{t.projectDetail.interested}</h2>
          <p className="mt-2 text-sm text-white/70">{t.projectDetail.interestedDesc}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a href="tel:+37496799733" className="inline-flex h-12 items-center gap-2 px-6 rounded-lg bg-[#c9a96e] text-[#0c1428] text-sm font-semibold">
              <Phone size={18} /> {t.nav.call}
            </a>
            <a href={WHATSAPP} target="_blank" rel="noopener noreferrer" className="inline-flex h-12 items-center gap-2 px-6 rounded-lg bg-[#25D366] text-white text-sm font-semibold">
              <MessageCircle size={18} /> WhatsApp
            </a>
            <Link href="/contact" className="inline-flex h-12 items-center px-6 rounded-lg border border-white/40 text-white text-sm font-semibold hover:bg-white/10">
              {t.projectDetail.bookViewing}
            </Link>
          </div>
        </Container>
      </section>

      <Container className="py-10 md:py-14 border-t border-[#E5E7EB]">
        <div className="max-w-lg">
          <h2 className="text-xl font-semibold text-[#0c1428]">{t.projectDetail.contactTitle}</h2>
          <p className="mt-2 text-sm text-[#6B7280]">{t.projectDetail.contactSubtitle}</p>
          <ContactForm defaultProject={project.title} />
        </div>
      </Container>
    </main>
  );
}
