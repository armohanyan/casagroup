import { Router } from "express";
import multer from "multer";
import path from "node:path";
import fs from "node:fs";
import { requireAuth } from "../middleware/auth.js";
import { config } from "../config.js";
import * as projectService from "../services/projectService.js";
import * as inquiryService from "../services/inquiryService.js";
import { processUpload } from "../services/mediaService.js";

export const adminRouter = Router();

adminRouter.use(requireAuth);

const tmpDir = path.join(config.uploadsDir, "tmp");
fs.mkdirSync(tmpDir, { recursive: true });

const upload = multer({
  dest: tmpDir,
  limits: { fileSize: config.maxVideoBytes },
  fileFilter(_req, file, cb) {
    const ok = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/");
    if (!ok) {
      cb(new Error("Unsupported file type"));
      return;
    }
    cb(null, true);
  },
});

adminRouter.get("/projects", async (_req, res, next) => {
  try {
    const projects = await projectService.listProjects();
    res.json(projects);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/projects/:id", async (req, res, next) => {
  try {
    const project = await projectService.getProjectById(req.params.id);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/projects", async (req, res, next) => {
  try {
    const project = await projectService.createProject(req.body);
    res.status(201).json(project);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/projects/:id", async (req, res, next) => {
  try {
    const project = await projectService.updateProject(req.params.id, req.body);
    res.json(project);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/projects/:id", async (req, res, next) => {
  try {
    const result = await projectService.deleteProject(req.params.id);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/projects/:id/apartments", async (req, res, next) => {
  try {
    const apt = await projectService.createApartment(req.params.id, req.body);
    res.status(201).json(apt);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/projects/:id/apartments/:aptId", async (req, res, next) => {
  try {
    const apt = await projectService.updateApartment(req.params.id, req.params.aptId, req.body);
    res.json(apt);
  } catch (err) {
    next(err);
  }
});

adminRouter.delete("/projects/:id/apartments/:aptId", async (req, res, next) => {
  try {
    const result = await projectService.deleteApartment(req.params.id, req.params.aptId);
    res.json(result);
  } catch (err) {
    next(err);
  }
});

adminRouter.get("/inquiries", async (req, res, next) => {
  try {
    const status = typeof req.query.status === "string" ? req.query.status : undefined;
    const inquiries = await inquiryService.listInquiries(status);
    res.json(inquiries);
  } catch (err) {
    next(err);
  }
});

adminRouter.patch("/inquiries/:id", async (req, res, next) => {
  try {
    const inquiry = await inquiryService.updateInquiry(req.params.id, req.body);
    res.json(inquiry);
  } catch (err) {
    next(err);
  }
});

adminRouter.post("/uploads", upload.single("file"), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }
    const projectId = typeof req.body.projectId === "string" ? req.body.projectId : undefined;
    const result = await processUpload(req.file, projectId);
    return res.status(201).json(result);
  } catch (err) {
    return next(err);
  }
});
