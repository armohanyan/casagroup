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

/** Public homepage slides — under /api/projects so existing nginx → Express proxy covers it (no auth). */
projectsRouter.get("/_hero-slides", async (_req, res, next) => {
  try {
    const slides = await heroSlideService.listHeroSlides();
    res.json(slides);
  } catch (err) {
    next(err);
  }
});

projectsRouter.get("/:slug", async (req, res, next) => {
  try {
    const project = await projectService.getProjectBySlug(req.params.slug);
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
