"use client";

import Image from "next/image";
import Link from "next/link";
import { Container } from "@/components/site/Container";
import { FaqSection } from "@/components/site/FaqSection";
import { HomeContactStrip } from "@/components/site/home/HomeContactStrip";
import { Seo } from "@/components/seo/Seo";
import { siteImages } from "@/lib/site-images";
import { useI18n } from "@/lib/i18n";

export default function FaqPage() {
  const { t, lang } = useI18n();

  return (
    <main className="min-h-screen bg-white">
      <Seo title={t.seo.faq.title} description={t.seo.faq.description} path="/faq" lang={lang} />

      <section className="relative flex min-h-[340px] items-center justify-center overflow-hidden pt-header md:min-h-[420px]">
        <Image
          src={siteImages.hero.faq}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <Container className="relative z-10 py-16 text-center md:py-20">
          <h1 className="font-display text-4xl tracking-tight text-white md:text-5xl lg:text-[3.25rem]">
            {t.faq.title}
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-white/80 md:text-base">
            {t.faq.subtitle}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/contact"
              className="inline-flex h-12 items-center rounded-[5px] bg-white px-7 text-sm font-semibold text-[#0c1428] transition-colors hover:bg-white/90"
            >
              {t.nav.contact}
            </Link>
            <Link
              href="/projects"
              className="inline-flex h-12 items-center rounded-[5px] border border-white/40 px-7 text-sm font-semibold text-white transition-colors hover:border-white"
            >
              {t.nav.projects}
            </Link>
          </div>
        </Container>
      </section>

      <FaqSection hideHeading className="border-t-0 bg-white" />
      <HomeContactStrip />
    </main>
  );
}
