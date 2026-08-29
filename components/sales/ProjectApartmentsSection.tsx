"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ApartmentSalesJourney } from "@/components/sales/ApartmentSalesJourney";
import { BuildingFloorMapSection } from "@/components/sales/BuildingFloorMapSection";
import { DeveloperFloorPlanSection } from "@/components/sales/DeveloperFloorPlanSection";
import { ProjectPlansViewToggle } from "@/components/sales/ProjectPlansViewToggle";
import { Container } from "@/components/site/Container";
import {
  hasFilteredPlanSearch,
  hasVisualPlanSearch,
  parsePlansViewMode,
  projectSalesMode,
  type PlansViewMode,
} from "@/lib/sales-mode";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";

interface Props {
  project: Project;
}

function ProjectApartmentsSectionInner({ project }: Props) {
  const searchParams = useSearchParams();
  const salesMode = projectSalesMode(project);
  const visualAvailable = hasVisualPlanSearch(project);
  const plansAvailable = hasFilteredPlanSearch(project);
  const showToggle = visualAvailable && plansAvailable;

  const view: PlansViewMode = showToggle
    ? parsePlansViewMode(searchParams.get("view"), project)
    : visualAvailable
      ? "visual"
      : "plans";

  return (
    <div id="apartments" className="scroll-mt-24 border-t border-[#E5E7EB]">
      {showToggle ? (
        <Container className="pt-8 pb-6 md:pt-10 md:pb-8">
          <ProjectPlansViewToggle view={view} />
        </Container>
      ) : null}

      {view === "plans" ? (
        <section>
          <Container className={cn("py-10 md:py-14", showToggle && "!pt-0")}>
            <DeveloperFloorPlanSection project={project} />
          </Container>
        </section>
      ) : salesMode === "plans" ? (
        <BuildingFloorMapSection project={project} />
      ) : (
        <ApartmentSalesJourney project={project} />
      )}
    </div>
  );
}

function ProjectApartmentsSectionFallback() {
  return (
    <section id="apartments" className="border-t border-[#E5E7EB] scroll-mt-24">
      <Container className="py-10 md:py-14">
        <div className="h-64 rounded-2xl skeleton" />
      </Container>
    </section>
  );
}

export function ProjectApartmentsSection(props: Props) {
  return (
    <Suspense fallback={<ProjectApartmentsSectionFallback />}>
      <ProjectApartmentsSectionInner {...props} />
    </Suspense>
  );
}
