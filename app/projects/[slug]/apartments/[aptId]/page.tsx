import type { Metadata } from "next";
import { getProjectBySlug } from "@/lib/projects-data";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata, joinSeoTitleParts } from "@/lib/seo-meta";
import { getProjectCity, getProjectTitle } from "@/lib/project-i18n";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; aptId: string }>;
}): Promise<Metadata> {
  const { slug, aptId } = await params;
  const project = await getProjectBySlug(slug);
  const apartment = project?.apartments.find((a) => a.id === aptId);
  if (!project || !apartment) {
    return {
      title: hyTranslations.seo.notFound.title,
      robots: "noindex, nofollow",
    };
  }
  return buildPageMetadata({
    title: joinSeoTitleParts(
      `${apartment.rooms} սենյականոց բնակարան, ${apartment.area} մ²`,
      getProjectTitle(project, "hy"),
    ),
    description: `${apartment.rooms} սենյականոց բնակարան ${getProjectTitle(project, "hy")} նախագծում, ${getProjectCity(project, "hy")}։ ${apartment.area} մ², ${apartment.floor}-րդ հարկ։ Դիտեք հատակագիծը, գինը և պայմանավորվեք դիտման համար CASA GROUP-ի հետ։`,
    path: `/projects/${project.slug}/apartments/${apartment.id}`,
    image: apartment.floorPlanImage || project.images[0],
  });
}

export { default } from "@/components/pages/apartment-detail-page";
