import { Router } from "express";
import * as heroSlideService from "../services/heroSlideService.js";

export const heroRouter = Router();

heroRouter.get("/", async (_req, res, next) => {
  try {
    const slides = await heroSlideService.listHeroSlides();
    res.json(slides);
  } catch (err) {
    next(err);
  }
});
