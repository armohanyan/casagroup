import type { Metadata } from "next";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = buildPageMetadata({
  ...hyTranslations.seo.partner,
  path: "/partners",
});

export { default } from "@/components/pages/partner-home-page";
