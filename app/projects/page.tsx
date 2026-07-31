import { Suspense } from "react";
import type { Metadata } from "next";
import ProjectsPage from "@/components/pages/projects-page";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = buildPageMetadata({
  ...hyTranslations.seo.projects,
  path: "/projects",
});

export default function Page() {
  return (
    <Suspense fallback={<main className="bg-[#F9FAFB] min-h-screen pt-header" />}>
      <ProjectsPage />
    </Suspense>
  );
}
