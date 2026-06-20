import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
    ],
  },
};

export default nextConfig;
