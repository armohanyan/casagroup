"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Phone, MessageCircle, BadgeCheck } from "lucide-react";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { BuildingFloorMapSection } from "@/components/sales/BuildingFloorMapSection";
import { NeighborhoodSalesSection } from "@/components/sales/NeighborhoodSalesSection";
import { DroneVideoSection } from "@/components/DroneVideoSection";
import { MortgageCalculator } from "@/components/MortgageCalculator";
import { ProjectMediaShowcase } from "@/components/site/ProjectMediaShowcase";
import { ProjectLocationSection } from "@/components/site/ProjectLocationSection";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { getProjectGallery } from "@/lib/project-gallery";
import { getAmenityLabel, getProjectCity, getProjectDescription, getProjectLongDescription, getProjectTitle } from "@/lib/project-i18n";
import { recordProjectView } from "@/lib/project-views";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { isNeighborhoodProject } from "@/lib/project-kind";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";
import { cn } from "@/lib/utils";
import { ProjectKeyFacts } from "@/components/site/ProjectKeyFacts";

const WHATSAPP = "https://wa.me/37496799733";
const OVERVIEW_PREVIEW_LINES = 10;

function ExpandableDescription({
  text,
  expandLabel,
  collapseLabel,
}: {
  text: string;
  expandLabel: string;
  collapseLabel: string;
}) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  useEffect(() => {
    setExpanded(false);
  }, [text]);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const measure = () => {
      if (expanded) {
        const lineHeight = parseFloat(getComputedStyle(el).lineHeight);
        if (!Number.isFinite(lineHeight) || lineHeight <= 0) return;
        setOverflows(el.scrollHeight > lineHeight * OVERVIEW_PREVIEW_LINES + 2);
        return;
      }
      setOverflows(el.scrollHeight > el.clientHeight + 2);
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [text, expanded]);

  return (
    <div className="mt-3">
      <p
        ref={ref}
        className={cn(
          "whitespace-pre-line text-sm leading-relaxed text-[#4B5563] sm:text-base",
          !expanded && "line-clamp-[10]",
        )}
      >
        {text}
      </p>
      {overflows ? (
        <button
          type="button"
          onClick={() => setExpanded((open) => !open)}
          className="mt-2 text-sm font-semibold text-[#c9a96e] transition-colors hover:text-[#b8954f]"
          aria-expanded={expanded}
        >
          {expanded ? collapseLabel : `${expandLabel}…`}
        </button>
      ) : null}
    </div>
  );
}

export default function ProjectDetailPage() {
  const params = useParams();
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { getBySlug, loading } = useProjects();
  const project = slug ? getBySlug(slug) : undefined;

  const galleryItems = useMemo(() => (project ? getProjectGallery(project) : []), [project]);
  const [recordedViews, setRecordedViews] = useState<number | null>(null);

  useEffect(() => {
    if (!project?.id) return;
    let cancelled = false;
    void recordProjectView(project.id).then((views) => {
      if (!cancelled && views != null) setRecordedViews(views);
    });
    return () => {
      cancelled = true;
    };
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
  const title = getProjectTitle(project, lang);
  const city = getProjectCity(project, lang);
  const description = getProjectDescription(project, lang);
  const longDescription = getProjectLongDescription(project, lang).trim();
  const overviewText = (longDescription || description).trim();
  const hasDroneVideos = (project.droneVideos?.length ?? 0) > 0;
  const projectWithViews =
    recordedViews != null ? { ...project, viewCount: recordedViews } : project;

  const overviewSection = overviewText ? (
    <section className={cn(hasDroneVideos ? "max-w-3xl" : "mb-8 max-w-3xl")}>
      <h2 className="text-xl font-semibold text-[#0c1428] sm:text-2xl">
        {t.projectDetail.overviewTitle}
      </h2>
      <ExpandableDescription
        text={overviewText}
        expandLabel={t.projectDetail.overviewSeeMore}
        collapseLabel={t.projectDetail.overviewSeeLess}
      />
    </section>
  ) : null;

  const factsAndAmenities = (
    <>
      <ProjectKeyFacts
        project={project}
        className={hasDroneVideos ? "bg-transparent p-0" : undefined}
      />
      {project.amenities.length > 0 && (
        <section className="mt-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <h2 className="text-xl font-semibold text-[#0c1428]">{t.projectDetail.amenitiesTitle}</h2>
            <span className="text-xs font-medium text-[#9CA3AF]">{project.amenities.length}</span>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {project.amenities.map((a) => (
              <span
                key={a.label}
                className={cn(
                  "inline-flex items-center gap-2 rounded-[5px] border border-[#E5E7EB] px-3.5 py-2 text-sm font-medium text-[#0c1428]",
                  hasDroneVideos ? "bg-white" : "bg-[#F9FAFB]",
                )}
              >
                <BadgeCheck size={16} className="shrink-0 text-[#c9a96e]" strokeWidth={2} />
                {getAmenityLabel(a, lang)}
              </span>
            ))}
          </div>
        </section>
      )}
    </>
  );

  return (
    <main className="bg-white min-h-screen">
      <Seo title={`${title} — ${city}`} description={description} path={path} image={heroImage} lang={lang} ogType="article" />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.projectDetail.breadHome, path: "/" },
          { name: t.projectDetail.breadProjects, path: "/projects" },
          { name: title, path },
        ])}
      />

      <ProjectMediaShowcase project={projectWithViews} items={galleryItems} />

      {hasDroneVideos ? (
        <section className="border-t border-[#E5E7EB] bg-[#F9FAFB] py-8 md:py-11">
          <Container>
            <DroneVideoSection
              videos={project.droneVideos ?? []}
              projectTitle={title}
              embedded
              sideContent={overviewSection}
            />
            <div className="mt-8 md:mt-10">{factsAndAmenities}</div>
          </Container>
        </section>
      ) : (
        <Container className="py-8 md:py-10">
          {overviewSection}
          {factsAndAmenities}
        </Container>
      )}

      {isNeighborhoodProject(project) ? (
        <NeighborhoodSalesSection project={project} />
      ) : (
        <>
          <section id="apartments" className="border-t border-[#E5E7EB]">
            <Container className="py-10 md:py-14">
              <DeveloperFloorPlanSection project={project} />
            </Container>
          </section>
          <BuildingFloorMapSection project={project} />
        </>
      )}

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

      <ProjectLocationSection project={project} />

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
