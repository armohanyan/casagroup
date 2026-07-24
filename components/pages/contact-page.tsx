"use client";

import dynamic from "next/dynamic";
import Image from "next/image";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { siteImages } from "@/lib/site-images";
import { useI18n } from "@/lib/i18n";

const OfficeMap = dynamic(
  () => import("@/components/site/OfficeMap").then((m) => m.OfficeMap),
  { ssr: false, loading: () => <div className="h-64 bg-[#F3F4F6] rounded-[5px] animate-pulse" /> },
);

const ICONS = [Phone, Mail, MapPin, Clock];

export default function ContactPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.contact.title} description={t.seo.contact.description} path="/contact" lang={lang} />

      <section className="relative pt-header min-h-[340px] md:min-h-[420px] flex items-center justify-center overflow-hidden">
        <Image
          src={siteImages.hero.contact}
          alt=""
          fill
          priority
          unoptimized
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#0F172A]/70" />
        <Container className="relative z-10 py-16 md:py-20 text-center">
          <h1 className="font-display text-4xl md:text-5xl lg:text-[3.25rem] text-white tracking-tight">
            {t.nav.contact}
          </h1>
        </Container>
      </section>

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-5">
              {t.contact.contactInfo.map((item, i) => {
                const Icon = ICONS[i];
                return (
                  <a key={item.label} href={item.href} className="flex gap-4 group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-[5px] border border-[#E5E7EB] shrink-0">
                      <Icon size={18} className="text-[#6B7280]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280]">{item.label}</p>
                      <p className="text-sm font-medium text-[#0c1428] group-hover:text-[#c9a96e]">{item.value}</p>
                    </div>
                  </a>
                );
              })}
              <div className="mt-8 h-56 rounded-[5px] overflow-hidden border border-[#E5E7EB]">
                <OfficeMap />
              </div>
            </div>
            <div>
              <h2 className="text-lg font-semibold text-[#0c1428] mb-4">{t.contact.formTitle}</h2>
              <ContactForm />
            </div>
          </div>
        </Container>
      </section>
    </main>
  );
}
