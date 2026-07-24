import fs from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { prisma } from "../db.js";
import { config } from "../config.js";
import { optimizeImage, toPublicUrl } from "../utils/optimizeImage.js";
import { ensureVideoDir, generateVideoPoster } from "../utils/optimizeVideo.js";

const IMAGE_MIME = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const VIDEO_MIME = new Set(["video/mp4", "video/webm", "video/quicktime"]);

export async function processUpload(file: Express.Multer.File, projectId?: string) {
  const basename = `${Date.now()}-${randomUUID().slice(0, 8)}`;

  if (IMAGE_MIME.has(file.mimetype)) {
    const optimized = await optimizeImage(file.path, basename);
    const publicUrl = toPublicUrl(optimized.webpPath);
    const jpegUrl = toPublicUrl(optimized.jpegPath);
    const size = (await fs.stat(optimized.webpPath)).size;

    const asset = await prisma.mediaAsset.create({
      data: {
        projectId: projectId || null,
        originalPath: optimized.jpegPath,
        optimizedPath: optimized.webpPath,
        mimeType: "image/webp",
        kind: "image",
        width: optimized.width,
        height: optimized.height,
        sizeBytes: size,
      },
    });

    return {
      id: asset.id,
      kind: "image" as const,
      url: publicUrl,
      jpegUrl,
      width: optimized.width,
      height: optimized.height,
    };
  }

  if (VIDEO_MIME.has(file.mimetype)) {
    await ensureVideoDir();
    const videosDir = path.join(config.uploadsDir, "videos");
    const ext = path.extname(file.originalname) || ".mp4";
    const dest = path.join(videosDir, `${basename}${ext}`);
    await fs.rename(file.path, dest);

    const posterPath = await generateVideoPoster(dest, basename);
    const size = (await fs.stat(dest)).size;

    const asset = await prisma.mediaAsset.create({
      data: {
        projectId: projectId || null,
        originalPath: dest,
        posterPath: posterPath,
        mimeType: file.mimetype,
        kind: "video",
        sizeBytes: size,
      },
    });

    return {
      id: asset.id,
      kind: "video" as const,
      url: toPublicUrl(dest),
      posterUrl: posterPath ? toPublicUrl(posterPath) : null,
    };
  }

  try {
    await fs.unlink(file.path);
  } catch {
    /* ignore */
  }
  const err = new Error("Unsupported file type") as Error & { status: number };
  err.status = 400;
  throw err;
}
