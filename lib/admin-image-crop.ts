import type { Area } from "react-easy-crop";

export type FlipState = { horizontal: boolean; vertical: boolean };

/**
 * Load an image URL (blob or remote) into an HTMLImageElement.
 * Uses crossOrigin anonymous for remote URLs so canvas export works.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    if (!src.startsWith("blob:") && !src.startsWith("data:")) {
      img.crossOrigin = "anonymous";
    }
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = src;
  });
}

/**
 * Export the cropped (and optionally flipped) region as a JPEG File.
 * Rotation is already applied by react-easy-crop into `croppedAreaPixels`.
 */
export async function cropImageToFile(
  imageSrc: string,
  croppedAreaPixels: Area,
  flip: FlipState = { horizontal: false, vertical: false },
  fileName = "image.jpg",
  quality = 0.92,
): Promise<File> {
  const image = await loadImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const { width, height, x, y } = croppedAreaPixels;
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));

  ctx.save();
  if (flip.horizontal) {
    ctx.translate(canvas.width, 0);
    ctx.scale(-1, 1);
  }
  if (flip.vertical) {
    ctx.translate(0, canvas.height);
    ctx.scale(1, -1);
  }

  ctx.drawImage(
    image,
    x,
    y,
    width,
    height,
    0,
    0,
    canvas.width,
    canvas.height,
  );
  ctx.restore();

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error("Export failed"))),
      "image/jpeg",
      quality,
    );
  });

  const base = fileName.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.jpg`, { type: "image/jpeg" });
}
