import type { Metadata } from "next";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = buildPageMetadata({
  ...hyTranslations.seo.services,
  path: "/partners/services",
});

export { default } from "@/components/pages/services-page";
