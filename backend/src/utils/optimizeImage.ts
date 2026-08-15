import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config } from "../config.js";

export async function optimizeImage(inputPath: string, basename: string) {
  const imagesDir = path.join(config.uploadsDir, "images");
  await fs.mkdir(imagesDir, { recursive: true });

  const webpPath = path.join(imagesDir, `${basename}.webp`);
  const jpegPath = path.join(imagesDir, `${basename}.jpg`);

  const meta = await sharp(inputPath).metadata();
  const hasAlpha = Boolean(meta.hasAlpha);

  const image = sharp(inputPath).rotate().resize({
    width: 1920,
    height: 1920,
    fit: "inside",
    withoutEnlargement: true,
  });

  // JPEG has no alpha: Sharp composites transparent pixels onto black unless flattened.
  // Keep WebP alpha so floor plans without a background stay transparent.
  const jpegSource = hasAlpha
    ? image.clone().flatten({ background: { r: 255, g: 255, b: 255 } })
    : image.clone();

  await Promise.all([
    image.clone().webp({ quality: 82, alphaQuality: 100 }).toFile(webpPath),
    jpegSource.jpeg({ quality: 85, mozjpeg: true }).toFile(jpegPath),
  ]);

  try {
    await fs.unlink(inputPath);
  } catch {
    /* ignore */
  }

  return {
    webpPath,
    jpegPath,
    width: meta.width ?? null,
    height: meta.height ?? null,
    hasAlpha,
  };
}

export function toPublicUrl(absolutePath: string): string {
  const relative = path.relative(config.uploadsDir, absolutePath).split(path.sep).join("/");
  return `${config.publicBaseUrl}/uploads/${relative}`;
}
