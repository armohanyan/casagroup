import { motion } from "framer-motion";
import { Phone, Mail, MapPin, Clock } from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

const CONTACT_ICONS = [Phone, Mail, MapPin, Clock];

export default function ContactPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-[#0C1428] min-h-screen pt-20">
      <Seo
        title={t.seo.contact.title}
        description={t.seo.contact.description}
        path="/contact"
        lang={lang}
      />
      {/* Hero */}
      <section className="relative py-28 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=1920&q=60"
            alt="CasaGroup contact — modern residential lobby reception area"
            className="w-full h-full object-cover opacity-15"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C1428] via-transparent to-[#0C1428]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-[#c9a96e] mb-4"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t.contact.eyebrow}
          </motion.p>
          <motion.h1
            className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] leading-tight break-words hyphens-auto"
            style={{ fontSize: lang === "hy" ? "clamp(1.7rem, 2.8vw, 2.6rem)" : "clamp(2rem, 3.5vw, 3.2rem)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.contact.title}
          </motion.h1>
          <motion.p
            className="text-[#9a9085] mt-4 max-w-lg text-sm sm:text-base font-light"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            {t.contact.subtitle}
          </motion.p>
        </div>
      </section>

      {/* Content */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20 pb-32">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-16">
          {/* Contact Info */}
          <div className="lg:col-span-2 space-y-8">
            <SectionTitle eyebrow={t.contact.reachEyebrow} title={t.contact.reachTitle} />

            <div className="space-y-5">
              {t.contact.contactInfo.map((item, i) => {
                const Icon = CONTACT_ICONS[i];
                return (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="flex items-start gap-5 group"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-12 h-12 border border-[#2a2520] rounded-lg flex items-center justify-center shrink-0 group-hover:border-[#c9a96e] transition-colors">
                      <Icon size={18} className="text-[#c9a96e]" />
                    </div>
                    <div>
                      <p className="text-xs tracking-widest uppercase text-[#5a554f] mb-1">{item.label}</p>
                      <p className="text-[#f0ece4] text-sm group-hover:text-[#c9a96e] transition-colors">
                        {item.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>

            {/* Map placeholder */}
            <motion.div
              className="h-52 rounded-xl overflow-hidden border border-[#2a2520] bg-[#0d1829] relative mt-8"
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
            >
              <img
                src="https://images.unsplash.com/photo-1519501025264-65ba15a82390?w=800&q=70"
                alt={t.contact.mapAlt}
                className="w-full h-full object-cover opacity-40"
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2">
                <MapPin size={28} className="text-[#c9a96e]" />
                <p className="text-xs tracking-widest uppercase text-[#9a9085] text-center px-4 break-words">{t.contact.address}</p>
              </div>
            </motion.div>

            {/* Office hours box */}
            <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#5a554f] mb-4">{t.contact.workingHours}</p>
              <div className="space-y-2.5">
                {t.contact.hours.map(([day, hours]) => (
                  <div key={day} className="flex justify-between">
                    <span className="text-sm text-[#9a9085]">{day}</span>
                    <span className="text-sm text-[#f0ece4] font-['DM_Mono']">{hours}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Form */}
          <div className="lg:col-span-3">
            <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-5 sm:p-8 md:p-10">
              <SectionTitle eyebrow={t.contact.formEyebrow} title={t.contact.formTitle} />
              <ContactForm />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
