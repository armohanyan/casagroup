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

/**
 * Gallery images for a project.
 * Admin uploads live on `images`; seeded/categorized extras may live on `gallery`.
 * Merge both (deduped by URL) so admin uploads are never hidden by a short gallery.
 */
export function getProjectGallery(project: Project): ProjectGalleryItem[] {
  const imageUrls = (project.images ?? []).filter(Boolean);
  const galleryItems = (project.gallery ?? []).filter((item) => Boolean(item?.url));
  const galleryByUrl = new Map(galleryItems.map((item) => [item.url, item]));

  const seen = new Set<string>();
  const result: ProjectGalleryItem[] = [];

  imageUrls.forEach((url, i) => {
    if (seen.has(url)) return;
    seen.add(url);
    const match = galleryByUrl.get(url);
    result.push({
      url,
      category: match?.category ?? CATEGORIES[i % CATEGORIES.length] ?? "exterior",
    });
  });

  for (const item of galleryItems) {
    if (seen.has(item.url)) continue;
    seen.add(item.url);
    result.push(item);
  }

  return result;
}

export const GALLERY_CATEGORIES: GalleryCategory[] = CATEGORIES;
