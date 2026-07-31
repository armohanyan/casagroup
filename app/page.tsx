import type { Metadata } from "next";
import { hyTranslations } from "@/content/hy";
import { buildPageMetadata } from "@/lib/seo-meta";

export const metadata: Metadata = {
  ...buildPageMetadata({
    ...hyTranslations.seo.home,
    path: "/",
  }),
  // The layout's title template only applies to child segments, so add the brand here.
  title: { absolute: `${hyTranslations.seo.home.title} | CasaGroup` },
};

export { default } from "@/components/pages/home-page";
