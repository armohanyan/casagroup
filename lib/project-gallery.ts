import type { GalleryCategory, Project, ProjectGalleryItem } from "@/types";

const CATEGORIES: GalleryCategory[] = [
  "exterior",
  "interior",
  "entrance",
  "lobby",
  "parking",
  "green",
  "rooftop",
  "construction",
  "drone",
  "night",
];

/** Gallery images for a project — only admin-uploaded / gallery data, no stock fallbacks. */
export function getProjectGallery(project: Project): ProjectGalleryItem[] {
  if (project.gallery && project.gallery.length > 0) {
    return project.gallery;
  }

  return (project.images ?? []).map((url, i) => ({
    url,
    category: CATEGORIES[i % CATEGORIES.length] ?? "exterior",
  }));
}

export const GALLERY_CATEGORIES: GalleryCategory[] = CATEGORIES;
