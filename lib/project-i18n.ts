import type { Lang } from "@/lib/i18n";
import type { Project } from "@/types";

export function getProjectDescription(project: Project, lang: Lang): string {
  if (lang === "hy" && project.descriptionHy) return project.descriptionHy;
  return project.description;
}

export function getProjectLongDescription(project: Project, lang: Lang): string {
  if (lang === "hy" && project.longDescriptionHy) return project.longDescriptionHy;
  return project.longDescription;
}
