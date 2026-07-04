"use client";

import dynamic from "next/dynamic";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageIntro } from "@/components/site/PageIntro";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

const OfficeMap = dynamic(
  () => import("@/components/site/OfficeMap").then((m) => m.OfficeMap),
  { ssr: false, loading: () => <div className="h-64 bg-[#F3F4F6] rounded-lg animate-pulse" /> },
);

const ICONS = [Phone, Mail, MapPin, Clock];

export default function ContactPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.contact.title} description={t.seo.contact.description} path="/contact" lang={lang} />
      <PageIntro title={t.contact.title} subtitle={t.contact.pageSubtitle} />

      <section className="py-10 md:py-14">
        <Container>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="space-y-5">
              {t.contact.contactInfo.map((item, i) => {
                const Icon = ICONS[i];
                return (
                  <a key={item.label} href={item.href} className="flex gap-4 group">
                    <div className="w-10 h-10 flex items-center justify-center rounded-lg border border-[#E5E7EB] shrink-0">
                      <Icon size={18} className="text-[#6B7280]" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-[#6B7280]">{item.label}</p>
                      <p className="text-sm font-medium text-[#0c1428] group-hover:text-[#c9a96e]">{item.value}</p>
                    </div>
                  </a>
                );
              })}
              <div className="mt-8 h-56 rounded-lg overflow-hidden border border-[#E5E7EB]">
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
