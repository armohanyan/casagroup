import fs from "node:fs/promises";
import path from "node:path";
import ffmpeg from "fluent-ffmpeg";
import { config } from "../config.js";

function runFfmpeg(command: ffmpeg.FfmpegCommand): Promise<void> {
  return new Promise((resolve, reject) => {
    command.on("end", () => resolve()).on("error", (err) => reject(err));
  });
}

export async function generateVideoPoster(inputPath: string, basename: string): Promise<string | null> {
  const postersDir = path.join(config.uploadsDir, "posters");
  await fs.mkdir(postersDir, { recursive: true });
  const posterPath = path.join(postersDir, `${basename}.jpg`);

  try {
    await runFfmpeg(
      ffmpeg(inputPath)
        .screenshots({
          timestamps: ["00:00:01"],
          filename: `${basename}.jpg`,
          folder: postersDir,
          size: "1280x?"
        })
    );
    return posterPath;
  } catch (err) {
    console.warn("ffmpeg poster generation failed:", err);
    return null;
  }
}

export async function ensureVideoDir() {
  await fs.mkdir(path.join(config.uploadsDir, "videos"), { recursive: true });
}
