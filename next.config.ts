import type { NextConfig } from "next";
import { getInternalBackendUrl } from "./lib/backend-url";

// Rewrites must target the local Express process - never the public site origin
// (that creates nginx↔Next loops → "400 Request Header Or Cookie Too Large").
const API_ORIGIN = getInternalBackendUrl();
const SITE_ORIGIN = (process.env.NEXT_PUBLIC_SITE_URL || "").replace(/\/$/, "");
const PUBLIC_API = (process.env.NEXT_PUBLIC_API_URL || "").replace(/\/$/, "");

function originToRemotePattern(origin: string): {
  protocol: "http" | "https";
  hostname: string;
  port?: string;
  pathname: string;
} | null {
  try {
    const url = new URL(origin);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return {
      protocol: url.protocol.replace(":", "") as "http" | "https",
      hostname: url.hostname,
      ...(url.port ? { port: url.port } : {}),
      pathname: "/uploads/**",
    };
  } catch {
    return null;
  }
}

const uploadRemotePatterns = [API_ORIGIN, SITE_ORIGIN, PUBLIC_API]
  .map(originToRemotePattern)
  .filter((p): p is NonNullable<typeof p> => Boolean(p));

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pre-existing lint errors must not block production builds; lint runs separately via `npm run lint`.
  eslint: { ignoreDuringBuilds: true },
  async rewrites() {
    return [
      { source: "/uploads/:path*", destination: `${API_ORIGIN}/uploads/:path*` },
      { source: "/api/views", destination: `${API_ORIGIN}/api/views` },
      { source: "/api/views/:path*", destination: `${API_ORIGIN}/api/views/:path*` },
      { source: "/api/projects", destination: `${API_ORIGIN}/api/projects` },
      { source: "/api/projects/:path*", destination: `${API_ORIGIN}/api/projects/:path*` },
      { source: "/api/inquiries", destination: `${API_ORIGIN}/api/inquiries` },
      { source: "/api/inquiries/:path*", destination: `${API_ORIGIN}/api/inquiries/:path*` },
      { source: "/api/auth/:path*", destination: `${API_ORIGIN}/api/auth/:path*` },
      { source: "/api/admin/:path*", destination: `${API_ORIGIN}/api/admin/:path*` },
      { source: "/api/hero-slides", destination: `${API_ORIGIN}/api/hero-slides` },
      { source: "/api/hero-slides/:path*", destination: `${API_ORIGIN}/api/hero-slides/:path*` },
    ];
  },
  async redirects() {
    return [
      { source: "/partner", destination: "/partners", permanent: true },
      { source: "/partner/:path*", destination: "/partners/:path*", permanent: true },
      { source: "/services", destination: "/partners/services", permanent: true },
      { source: "/services/:path*", destination: "/partners/services/:path*", permanent: true },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "http",
        hostname: "localhost",
        port: "4000",
        pathname: "/uploads/**",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
        port: "4000",
        pathname: "/uploads/**",
      },
      ...uploadRemotePatterns,
    ],
  },
};

export default nextConfig;
