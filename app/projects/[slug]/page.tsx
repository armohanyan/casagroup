import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects-data";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata } from "@/lib/seo-meta";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const project = await getProjectBySlug(slug);
  if (!project) {
    return {
      title: hyTranslations.seo.notFound.title,
      robots: "noindex, nofollow",
    };
  }
  return buildPageMetadata({
    title: `${project.title} — ${project.city}`,
    description: project.descriptionHy ?? project.description,
    path: `/projects/${project.slug}`,
    image: project.images[0],
  });
}

export { default } from "@/components/pages/project-detail-page";
