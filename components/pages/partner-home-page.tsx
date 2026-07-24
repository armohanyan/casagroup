import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  Plus,
  Minus,
  Landmark,
  Compass,
  Palette,
  HardHat,
  Megaphone,
  Handshake,
  Network,
  LineChart,
  Scale,
} from "lucide-react";
import { ContactForm } from "@/components/ContactForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/use-media-query";

const PARTNER_ICONS = [
  Landmark,
  Compass,
  Palette,
  HardHat,
  Megaphone,
  Handshake,
  Network,
  LineChart,
  Scale,
];

const MATERIAL_IMGS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
];

export default function PartnerHomePage() {
  const { t, lang } = useI18n();
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const canFineHover = useMediaQuery("(hover: hover) and (pointer: fine)");

  return (
    <main className="bg-[#FAF8F5] min-h-screen pt-16">
      <Seo
        title={t.seo.partner.title}
        description={t.seo.partner.description}
        path="/partners"
        lang={lang}
      />

      {/* Hero */}
      <section className="relative py-20 sm:py-24 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1920&q=70"
            alt="Construction site — CasaGroup partner portal"
            fill
            sizes="100vw"
            className="object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#FAF8F5] via-transparent to-[#FAF8F5]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t.partner.heroEyebrow}
          </motion.p>
          <motion.h1
            className="font-sans font-semibold text-[#1C1917] leading-tight mb-6 max-w-3xl"
            style={{ fontSize: lang === "hy" ? "clamp(2rem, 3vw, 2.8rem)" : "clamp(2.5rem, 4vw, 3.5rem)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.partner.heroTitle1}
            <br />
            <span className="text-[#c9a96e]">{t.partner.heroTitle2}</span>
          </motion.h1>
          <motion.div
            className="flex flex-wrap gap-3"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <Link href="/partners/services">
              <span className="btn-outline inline-block px-8 py-3.5 text-xs tracking-[0.25em] uppercase rounded-sm cursor-pointer">
                {t.partner.heroCtaServices}
              </span>
            </Link>
            <Link href="/partners#contact">
              <span className="btn-outline inline-block px-8 py-3.5 text-xs tracking-[0.25em] uppercase rounded-sm cursor-pointer">
                {t.partner.heroCtaContact}
              </span>
            </Link>
            <Link href="/partners#contact">
              <span className="btn-outline inline-block px-8 py-3.5 text-xs tracking-[0.25em] uppercase rounded-sm cursor-pointer">
                {t.partner.heroCtaSubmitProject}
              </span>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Materials / Ecosystem */}
      <section className="py-24 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionTitle
          eyebrow={t.partner.materialsEyebrow}
          title={t.partner.materialsTitle}
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {t.partner.materials.map((mat, i) => (
            <motion.div
              key={i}
              className="group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="h-56 rounded-xl overflow-hidden mb-4 relative">
                <Image
                  src={MATERIAL_IMGS[i]}
                  alt={mat.title}
                  fill
                  sizes="33vw"
                  className={`object-cover ${canFineHover ? "group-hover:scale-105 transition-transform duration-500" : ""}`}
                />
              </div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#c9a96e] mb-2">{mat.title}</p>
              <p className="text-[#57534E] text-sm">{mat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Partnership stats */}
      <section className="py-24 bg-[#F3EFE8] border-y border-[#E7E0D5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <SectionTitle
              eyebrow={t.partner.investEyebrow}
              title={t.partner.investTitle}
            />
            <div className="space-y-6">
              {t.partner.investStats.map((item, i) => (
                <motion.div
                  key={i}
                  className="flex items-start gap-5"
                  initial={{ opacity: 0, x: -16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <span className="font-sans text-3xl font-bold text-[#c9a96e] tabular-nums shrink-0 w-20">
                    {item.stat}
                  </span>
                  <p className="text-[#57534E] text-sm leading-relaxed pt-2">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Banner */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0">
          <Image
            src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80"
            alt="Premium interior"
            fill
            sizes="100vw"
            className="object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-white/85" />
        </div>
        <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
          <p className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-4">{t.partner.bannerEyebrow}</p>
          <h2 className="font-sans font-semibold text-[#1C1917] whitespace-pre-line text-2xl md:text-3xl">
            {t.partner.bannerTitle}
          </h2>
        </div>
      </section>

      {/* Academy */}
      <section id="academy" className="py-24 max-w-7xl mx-auto px-6 lg:px-10 scroll-mt-24">
        <SectionTitle
          eyebrow={t.partner.academyEyebrow}
          title={t.partner.academyTitle}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-12 max-w-5xl">
          {t.partner.academyBullets.map((item, i) => (
            <div
              key={i}
              className="flex items-center gap-3 bg-[#F3EFE8] border border-[#E7E0D5] rounded-lg px-4 py-3 text-sm text-[#57534E]"
            >
              <span className="text-[#c9a96e] font-sans tabular-nums text-xs">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-snug">{item}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Partner network */}
      <section id="partners" className="py-24 bg-[#F3EFE8] border-y border-[#E7E0D5] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.partner.partnersEyebrow}
            title={t.partner.partnersTitle}
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-12 max-w-5xl mx-auto">
            {t.partner.partnersList.map((label, i) => {
              const Icon = PARTNER_ICONS[i] ?? Landmark;
              return (
                <div
                  key={i}
                  className="flex items-center gap-4 bg-[#F3EFE8]/70 border border-[#E7E0D5] rounded-xl px-4 py-3.5"
                >
                  <div className="w-10 h-10 rounded-lg border border-[#E7E0D5] flex items-center justify-center shrink-0">
                    <Icon size={16} className="text-[#c9a96e]" />
                  </div>
                  <span className="text-sm text-[#57534E] leading-snug">{label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Developer FAQ */}
      <section id="faq" className="py-24 max-w-7xl mx-auto px-6 lg:px-10 scroll-mt-24">
        <SectionTitle eyebrow={t.partner.faqEyebrow} title={t.partner.faqTitle} centered />
        <div className="max-w-3xl mx-auto mt-12 space-y-3">
          {t.partner.faqItems.map((item, i) => {
            const open = faqOpen === i;
            return (
              <div
                key={i}
                className={`border rounded-xl bg-[#F3EFE8] overflow-hidden transition-colors ${
                  open ? "border-[#c9a96e]/35" : "border-[#E7E0D5]"
                }`}
              >
                <button
                  type="button"
                  className="w-full flex items-start justify-between gap-4 text-left px-5 py-4"
                  onClick={() => setFaqOpen(open ? null : i)}
                  aria-expanded={open}
                >
                  <span className="text-sm text-[#1C1917] leading-snug">{item.q}</span>
                  <span className="shrink-0 text-[#c9a96e]">{open ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
                {open && (
                  <div className="px-5 pb-4 border-t border-[#E7E0D5]/60">
                    <p className="text-sm text-[#57534E] leading-relaxed pt-3">{item.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-24 bg-[#F3EFE8] border-t border-[#E7E0D5] scroll-mt-20">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.partner.contactEyebrow}
            title={t.partner.contactTitle}
            centered
          />
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
