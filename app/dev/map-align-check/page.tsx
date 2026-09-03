"use client";

import { BuildingFloorMapSection } from "@/components/sales/BuildingFloorMapSection";
import { MOCK_PROJECTS } from "@/data/mock";

/** Temporary visual check for percent map alignment - remove after verification. */
export default function MapAlignCheckPage() {
  const project = MOCK_PROJECTS.find((p) => p.slug === "cascade-residences") ?? MOCK_PROJECTS[0];
  return (
    <main className="min-h-screen bg-white pt-8">
      <BuildingFloorMapSection project={project} />
    </main>
  );
}
