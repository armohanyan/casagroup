/**
 * Writes robots.txt and sitemap.xml into /dist after Vite build.
 * Set VITE_SITE_URL in the environment to your canonical origin (https, no trailing slash).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const distDir = path.join(__dirname, "..", "dist");

const baseRaw = process.env.VITE_SITE_URL?.trim() || "https://www.example.com";
const base = baseRaw.replace(/\/$/, "");

const staticPaths = [
  "/",
  "/projects",
  "/services",
  "/about",
  "/contact",
];

const projects = [
  { slug: "ararat-heights", apartments: ["apt-1-1", "apt-1-2", "apt-1-3", "apt-1-4", "apt-1-5", "apt-1-6"] },
  { slug: "cascade-residences", apartments: ["apt-2-1", "apt-2-2", "apt-2-3"] },
  { slug: "sevan-shores", apartments: ["apt-3-1", "apt-3-2"] },
  { slug: "park-lane-tower", apartments: ["apt-4-1", "apt-4-2"] },
];

const urls = [
  ...staticPaths,
  ...projects.flatMap((p) => [`/projects/${p.slug}`, ...p.apartments.map((id) => `/projects/${p.slug}/apartments/${id}`)]),
];

const today = new Date().toISOString().slice(0, 10);

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (loc) => `  <url>
    <loc>${base}${loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${loc === "/" ? "1.0" : loc.startsWith("/projects/") && loc.split("/").length > 3 ? "0.7" : "0.8"}</priority>
  </url>`,
  )
  .join("\n")}
</urlset>
`;

const robots = `User-agent: *
Allow: /

Disallow: /admin-lx9k2m

Sitemap: ${base}/sitemap.xml
`;

if (!fs.existsSync(distDir)) {
  console.error("write-seo-dist: dist/ not found. Run vite build first.");
  process.exit(1);
}

fs.writeFileSync(path.join(distDir, "sitemap.xml"), sitemap, "utf8");
fs.writeFileSync(path.join(distDir, "robots.txt"), robots, "utf8");
console.log(`write-seo-dist: wrote sitemap.xml and robots.txt for base ${base}`);
