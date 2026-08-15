"use client";

import dynamic from "next/dynamic";
import { useI18n } from "@/lib/i18n";
import { getProjectTitle } from "@/lib/project-i18n";
import type { Project } from "@/types";

const ProjectMap = dynamic(
  () => import("@/components/site/ProjectMap").then((m) => m.ProjectMap),
  { ssr: false, loading: () => <div className="absolute inset-0 bg-[#F3F4F6] animate-pulse" /> },
);

interface Props {
  project: Project;
}

/** Full-width project location map. */
export function ProjectLocationSection({ project }: Props) {
  const { lang } = useI18n();
  return (
    <section className="relative isolate z-0 h-[380px] w-full border-t border-[#E5E7EB] bg-[#F3F4F6] md:h-[480px]">
      <ProjectMap
        lat={project.coordinates.lat}
        lng={project.coordinates.lng}
        title={getProjectTitle(project, lang)}
        scrollWheelZoom
      />
    </section>
  );
}
