import { Router } from "express";
import * as viewService from "../services/viewService.js";

export const viewsRouter = Router();

viewsRouter.post("/", async (req, res, next) => {
  try {
    const projectId = typeof req.body?.projectId === "string" ? req.body.projectId : "";
    const sessionId = typeof req.body?.sessionId === "string" ? req.body.sessionId : "";
    const result = await viewService.recordProjectView(projectId, sessionId);
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
});

viewsRouter.get("/:projectId", async (req, res, next) => {
  try {
    const result = await viewService.getProjectViewCount(req.params.projectId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});
