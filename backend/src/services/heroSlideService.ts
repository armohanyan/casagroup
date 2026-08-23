import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";

const LEGACY_MOCK_HOST = "images.unsplash.com";

/** Drop Unsplash seed slides so the public site never shows mock hero backgrounds. */
export async function cleanupLegacyHeroSlides() {
  await prisma.heroSlide.deleteMany({
    where: { imageUrl: { contains: LEGACY_MOCK_HOST } },
  });
}

function isMockHeroUrl(imageUrl: string) {
  return imageUrl.includes(LEGACY_MOCK_HOST);
}

/** Public + admin listing — real admin uploads only (no stock mock URLs). */
export async function listHeroSlides() {
  const slides = await prisma.heroSlide.findMany({
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
  });
  return slides.filter((s) => s.imageUrl?.trim() && !isMockHeroUrl(s.imageUrl));
}

export async function createHeroSlide(input: { imageUrl: string; sortOrder?: number }) {
  const imageUrl = String(input.imageUrl || "").trim();
  if (!imageUrl) throw httpError(400, "Image URL is required");
  if (isMockHeroUrl(imageUrl)) throw httpError(400, "Mock stock images are not allowed");

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
    if (isMockHeroUrl(imageUrl)) throw httpError(400, "Mock stock images are not allowed");
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
