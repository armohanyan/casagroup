import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";

export function notFound(_req: Request, res: Response) {
  res.status(404).json({ error: "Not found" });
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  if (err instanceof ZodError) {
    return res.status(400).json({ error: "Validation failed", details: err.flatten() });
  }
  if (err instanceof Error) {
    const status = (err as Error & { status?: number }).status || 500;
    if (status >= 500) console.error(err);
    return res.status(status).json({ error: err.message || "Server error" });
  }
  console.error(err);
  return res.status(500).json({ error: "Server error" });
}

export function httpError(status: number, message: string) {
  const err = new Error(message) as Error & { status: number };
  err.status = status;
  return err;
}
