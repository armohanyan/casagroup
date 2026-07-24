import { Router } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { config } from "../config.js";

export const authRouter = Router();

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

authRouter.post("/login", (req, res) => {
  const body = loginSchema.parse(req.body);
  if (body.username !== config.adminUser || body.password !== config.adminPassword) {
    return res.status(401).json({ error: "Invalid credentials" });
  }
  const token = jwt.sign({ sub: body.username, role: "admin" }, config.jwtSecret, {
    expiresIn: "7d",
  });
  return res.json({ token, user: { username: body.username, role: "admin" } });
});
