"use client";

import dynamic from "next/dynamic";
import { Container } from "@/components/site/Container";
import { useI18n } from "@/lib/i18n";
import type { Project } from "@/types";

const ProjectMap = dynamic(
  () => import("@/components/site/ProjectMap").then((m) => m.ProjectMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#F3F4F6] animate-pulse" /> },
);

interface Props {
  project: Project;
}

export function ProjectLocationSection({ project }: Props) {
  const { t } = useI18n();

  return (
    <Container className="py-10 border-t border-[#E5E7EB]">
      <h2 className="text-xl font-semibold text-[#0c1428] mb-4">{t.projectDetail.locationTitle}</h2>
      <div className="relative isolate z-0 h-72 w-full rounded-xl overflow-hidden border border-[#E5E7EB] bg-[#F3F4F6]">
        <ProjectMap
          lat={project.coordinates.lat}
          lng={project.coordinates.lng}
          title={project.title}
        />
      </div>
    </Container>
  );
}
