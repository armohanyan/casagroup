import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required env: ${name}`);
  return value;
}

export const config = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: required("DATABASE_URL"),
  jwtSecret: required("JWT_SECRET"),
  adminUser: required("ADMIN_USER"),
  adminPassword: required("ADMIN_PASSWORD"),
  publicBaseUrl: (process.env.PUBLIC_BASE_URL || "http://localhost:4000").replace(/\/$/, ""),
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:3000",
  uploadsDir: path.resolve(__dirname, "../uploads"),
  maxImageBytes: 20 * 1024 * 1024,
  maxVideoBytes: 500 * 1024 * 1024,
};
