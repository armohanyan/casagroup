import { Router } from "express";
import { z } from "zod";
import * as inquiryService from "../services/inquiryService.js";

export const inquiriesRouter = Router();

const createSchema = z.object({
  fullName: z.string().min(2),
  phone: z.string().min(5),
  email: z.string().email().optional().or(z.literal("")),
  interestedProject: z.string().optional(),
  message: z.string().optional(),
  kind: z.string().optional(),
});

inquiriesRouter.post("/", async (req, res, next) => {
  try {
    const body = createSchema.parse(req.body);
    const inquiry = await inquiryService.createInquiry(body);
    res.status(201).json({ ok: true, id: inquiry.id });
  } catch (err) {
    next(err);
  }
});
