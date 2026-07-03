"use client";

import { useMemo } from "react";
import { Seo } from "@/components/seo/Seo";
import { HomeHero } from "@/components/site/home/HomeHero";
import { HomeFeaturedProjects } from "@/components/site/home/HomeFeaturedProjects";
import { HomeWhy } from "@/components/site/home/HomeWhy";
import { OwnerProfile } from "@/components/site/OwnerProfile";
import { HomeContactStrip } from "@/components/site/home/HomeContactStrip";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";

export default function HomePage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();

  const featured = useMemo(
    () => (projects.filter((p) => p.featured).length > 0 ? projects.filter((p) => p.featured) : projects),
    [projects],
  );

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.home.title} description={t.seo.home.description} path="/" lang={lang} />
      <HomeHero />
      <HomeFeaturedProjects projects={featured} />
      <HomeWhy />
      <OwnerProfile />
      <HomeContactStrip />
    </main>
  );
}
