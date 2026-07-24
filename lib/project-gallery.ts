import type { GalleryCategory, Project, ProjectGalleryItem } from "@/types";

const FALLBACK_POOL: Record<GalleryCategory, string[]> = {
  exterior: [
    "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85",
    "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=85",
  ],
  interior: [
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85",
    "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1400&q=85",
    "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85",
  ],
  entrance: [
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85",
    "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1400&q=85",
  ],
  lobby: [
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=85",
    "https://images.unsplash.com/photo-1600210492493-0946911128ee?w=1400&q=85",
  ],
  parking: [
    "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1400&q=85",
  ],
  green: [
    "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1400&q=85",
    "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=85",
  ],
  rooftop: [
    "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85",
  ],
  construction: [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1400&q=85",
  ],
  drone: [
    "https://images.unsplash.com/photo-1477959854737-0bf3c97c3b63?w=1400&q=85",
    "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1400&q=85",
  ],
  night: [
    "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=85",
    "https://images.unsplash.com/photo-1480714378408-67cf0d13bc1b?w=1400&q=85",
  ],
};

/** All gallery images for a project, with categories for filters and lightbox. */
export function getProjectGallery(project: Project): ProjectGalleryItem[] {
  if (project.gallery && project.gallery.length > 0) {
    return project.gallery;
  }

  const items: ProjectGalleryItem[] = [];
  const categories = Object.keys(FALLBACK_POOL) as GalleryCategory[];

  project.images.forEach((url, i) => {
    items.push({ url, category: categories[i % categories.length] ?? "exterior" });
  });

  for (const category of categories) {
    const pool = FALLBACK_POOL[category];
    const url = pool[items.length % pool.length];
    if (url && !items.some((item) => item.url === url)) {
      items.push({ url, category });
    }
  }

  return items;
}

export const GALLERY_CATEGORIES: GalleryCategory[] = [
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
