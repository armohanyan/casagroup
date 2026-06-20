import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { PageHero } from "@/components/sales/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

const CONTACT_ICONS = [Phone, Mail, MapPin, Clock];

export default function ContactPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo
        title={t.seo.contact.title}
        description={t.seo.contact.description}
        path="/contact"
        lang={lang}
      />

      <PageHero title={t.contact.title} subtitle={t.contact.reachTitle} />

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-10 pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          <div className="lg:col-span-2 space-y-6">
            <SectionTitle eyebrow={t.contact.reachEyebrow} title={t.contact.reachTitle} />

            <div className="space-y-4">
              {t.contact.contactInfo.map((item, i) => {
                const Icon = CONTACT_ICONS[i];
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-4 group"
                  >
                    <div className="w-10 h-10 border border-[#E7E0D5] rounded-lg flex items-center justify-center shrink-0 group-hover:border-[#c9a96e] transition-colors">
                      <Icon size={16} className="text-[#c9a96e]" />
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-[#A8A29E] font-semibold">{item.label}</p>
                      <p className="text-sm font-medium text-[#1C1917] mt-0.5 group-hover:text-[#c9a96e] transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </a>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            <ContactForm />
          </div>
        </div>
      </section>
    </main>
  );
}
