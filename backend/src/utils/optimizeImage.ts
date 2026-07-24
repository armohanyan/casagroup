import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { config } from "../config.js";

export async function optimizeImage(inputPath: string, basename: string) {
  const imagesDir = path.join(config.uploadsDir, "images");
  await fs.mkdir(imagesDir, { recursive: true });

  const webpPath = path.join(imagesDir, `${basename}.webp`);
  const jpegPath = path.join(imagesDir, `${basename}.jpg`);

  const image = sharp(inputPath).rotate().resize({
    width: 1920,
    height: 1920,
    fit: "inside",
    withoutEnlargement: true,
  });

  const meta = await image.metadata();
  await Promise.all([
    image.clone().webp({ quality: 82 }).toFile(webpPath),
    image.clone().jpeg({ quality: 85, mozjpeg: true }).toFile(jpegPath),
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
  };
}

export function toPublicUrl(absolutePath: string): string {
  const relative = path.relative(config.uploadsDir, absolutePath).split(path.sep).join("/");
  return `${config.publicBaseUrl}/uploads/${relative}`;
}
