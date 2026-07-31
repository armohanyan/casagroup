"use client";

import dynamic from "next/dynamic";
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
  return (
    <section className="relative isolate z-0 h-[380px] w-full border-t border-[#E5E7EB] bg-[#F3F4F6] md:h-[480px]">
      <ProjectMap
        lat={project.coordinates.lat}
        lng={project.coordinates.lng}
        title={project.title}
        scrollWheelZoom
      />
    </section>
  );
}
