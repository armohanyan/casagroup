"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

const ProjectMap = dynamic(
  () => import("@/components/site/ProjectMap").then((m) => m.ProjectMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#F3F4F6] animate-pulse" /> },
);

interface Props {
  project: Project;
  embedded?: boolean;
}

const mapHeight = "h-[280px] md:h-[320px]";

export function ProjectLocationSection({ project, embedded = false }: Props) {
  const { t } = useI18n();

  const content = (
    <>
      <h2 className="text-xl font-semibold text-[#0c1428]">{t.projectDetail.locationTitle}</h2>
      {!embedded && <p className="mt-1 text-sm text-[#6B7280]">{project.location}</p>}
      <div
        className={cn(
          "relative isolate z-0 w-full overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F3F4F6]",
          embedded ? "mt-5" : "mt-4",
          embedded ? mapHeight : "h-72",
        )}
      >
        <ProjectMap
          lat={project.coordinates.lat}
          lng={project.coordinates.lng}
          title={project.title}
        />
      </div>
    </>
  );

  if (embedded) {
    return <div className="flex h-full flex-col">{content}</div>;
  }

  return (
    <Container className="border-t border-[#E5E7EB] py-10">
      {content}
    </Container>
  );
}
