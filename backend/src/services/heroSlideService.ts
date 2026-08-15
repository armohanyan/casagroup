import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";

export const DEFAULT_HERO_SLIDES = [
  "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=90&auto=format&fit=crop",
];

export async function ensureDefaultHeroSlides() {
  const count = await prisma.heroSlide.count();
  if (count > 0) return;
  await prisma.heroSlide.createMany({
    data: DEFAULT_HERO_SLIDES.map((imageUrl, sortOrder) => ({ imageUrl, sortOrder })),
  });
}

export async function listHeroSlides() {
  await ensureDefaultHeroSlides();
  return prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
}

export async function createHeroSlide(input: { imageUrl: string; sortOrder?: number }) {
  const imageUrl = String(input.imageUrl || "").trim();
  if (!imageUrl) throw httpError(400, "Image URL is required");

  const maxSort = await prisma.heroSlide.aggregate({ _max: { sortOrder: true } });
  const sortOrder =
    input.sortOrder !== undefined ? Number(input.sortOrder) : (maxSort._max.sortOrder ?? -1) + 1;

  return prisma.heroSlide.create({
    data: { imageUrl, sortOrder },
  });
}

export async function updateHeroSlide(
  id: string,
  input: { imageUrl?: string; sortOrder?: number }
) {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Slide not found");

  const data: { imageUrl?: string; sortOrder?: number } = {};
  if (input.imageUrl !== undefined) {
    const imageUrl = String(input.imageUrl).trim();
    if (!imageUrl) throw httpError(400, "Image URL is required");
    data.imageUrl = imageUrl;
  }
  if (input.sortOrder !== undefined) data.sortOrder = Number(input.sortOrder);

  return prisma.heroSlide.update({ where: { id }, data });
}

export async function deleteHeroSlide(id: string) {
  const existing = await prisma.heroSlide.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Slide not found");
  await prisma.heroSlide.delete({ where: { id } });
  return { ok: true };
}

export async function reorderHeroSlides(ids: string[]) {
  if (!Array.isArray(ids) || ids.length === 0) throw httpError(400, "ids required");
  await prisma.$transaction(
    ids.map((id, sortOrder) =>
      prisma.heroSlide.update({ where: { id }, data: { sortOrder } })
    )
  );
  return listHeroSlides();
}
