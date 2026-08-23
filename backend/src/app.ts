import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import fs from "node:fs";
import { config } from "./config.js";
import { errorHandler, notFound } from "./middleware/error.js";
import { authRouter } from "./routes/auth.js";
import { projectsRouter } from "./routes/projects.js";
import { inquiriesRouter } from "./routes/inquiries.js";
import { adminRouter } from "./routes/admin.js";
import { viewsRouter } from "./routes/views.js";
import { heroRouter } from "./routes/hero.js";
import { ensureDefaultLeadStatuses } from "./services/leadStatusService.js";
import { cleanupLegacyHeroSlides } from "./services/heroSlideService.js";

fs.mkdirSync(config.uploadsDir, { recursive: true });

export function createApp() {
  const app = express();

  app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
  app.use(
    cors({
      origin: config.corsOrigin.split(",").map((o) => o.trim()),
      credentials: true,
    })
  );
  app.use(morgan("dev"));
  app.use(express.json({ limit: "2mb" }));
  app.use("/uploads", express.static(config.uploadsDir));

  app.get("/health", (_req, res) => {
    res.json({ ok: true });
  });

  // Seed default lead statuses once DB is reachable (non-blocking for health)
  void ensureDefaultLeadStatuses().catch((err) => {
    console.error("[lead-statuses] ensure defaults failed", err);
  });
  void cleanupLegacyHeroSlides().catch((err) => {
    console.error("[hero-slides] cleanup legacy mocks failed", err);
  });

  app.use("/api/auth", authRouter);
  app.use("/api/projects", projectsRouter);
  app.use("/api/inquiries", inquiriesRouter);
  app.use("/api/views", viewsRouter);
  app.use("/api/hero-slides", heroRouter);
  app.use("/api/admin", adminRouter);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}
