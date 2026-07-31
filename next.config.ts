import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Pre-existing lint errors must not block production builds; lint runs separately via `npm run lint`.
  eslint: { ignoreDuringBuilds: true },
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
    ],
  },
};

export default nextConfig;
