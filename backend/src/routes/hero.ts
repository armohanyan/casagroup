import { Router } from "express";
import * as heroSlideService from "../services/heroSlideService.js";

export const heroRouter = Router();

/** Public homepage hero slides - no auth. */
heroRouter.get("/", async (_req, res, next) => {
  try {
    const slides = await heroSlideService.listHeroSlides();
    res.setHeader("Cache-Control", "public, max-age=60, stale-while-revalidate=300");
    res.json(slides);
  } catch (err) {
    next(err);
  }
});
