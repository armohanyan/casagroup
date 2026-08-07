import type { Metadata } from "next";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = buildPageMetadata({
  ...hyTranslations.seo.faq,
  path: "/faq",
});

export { default } from "@/components/pages/faq-page";
