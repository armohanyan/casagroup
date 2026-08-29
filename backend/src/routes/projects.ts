import { Router } from "express";
import * as projectService from "../services/projectService.js";
import * as heroSlideService from "../services/heroSlideService.js";

export const projectsRouter = Router();

projectsRouter.get("/", async (req, res, next) => {
  try {
    const city = typeof req.query.city === "string" ? req.query.city : undefined;
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const maxPrice = req.query.maxPrice ? Number(req.query.maxPrice) : undefined;
    const rooms = req.query.rooms ? Number(req.query.rooms) : undefined;
    const featured =
      req.query.featured === "true" ? true : req.query.featured === "false" ? false : undefined;

    const projects = await projectService.listProjects({ city, status, maxPrice, rooms, featured });
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

/**
 * Public homepage slides - no auth.
 * Mounted under /api/projects so production nginx → Express covers it
 * (unlike /api/hero-slides which often hits Next only).
 * Must stay before /:slug or Express treats the path as a project slug → 404.
 */
async function sendPublicHeroSlides(_req: import("express").Request, res: import("express").Response, next: import("express").NextFunction) {
  try {
    const slides = await heroSlideService.listHeroSlides();
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(slides);
  } catch (err) {
    next(err);
  }
}

projectsRouter.get("/_hero-slides", sendPublicHeroSlides);
projectsRouter.get("/hero-slides", sendPublicHeroSlides);

projectsRouter.get("/:slug", async (req, res, next) => {
  try {
    const slug = String(req.params.slug || "");
    if (slug === "_hero-slides" || slug === "hero-slides") {
      return sendPublicHeroSlides(req, res, next);
    }
    const project = await projectService.getProjectBySlug(slug);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:slug/apartments/:id", async (req, res, next) => {
  try {
    const result = await projectService.getApartmentByProjectSlug(req.params.slug, req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
