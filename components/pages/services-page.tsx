import { useCallback, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Search,
  BarChart3,
  Users,
  ChevronDown,
  ArrowRight,
  Check,
  CheckCircle2,
  Database,
  Building2,
  Landmark,
} from "lucide-react";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ContactForm } from "@/components/ContactForm";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";
import { useMediaQuery } from "@/lib/use-media-query";

const SERVICE_ICONS = [Search, BarChart3, Users, Database, Building2, Landmark];

const SERVICE_HERO_IMGS = [
  "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=900&q=80",
  "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=900&q=80",
  "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&q=80",
  "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=900&q=80",
  "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=900&q=80",
  "https://images.unsplash.com/photo-1579621970563-ebec7560ff3e?w=900&q=80",
];

const ACCENT_LINES = [
  "bg-gradient-to-r from-[#c9a96e] to-[#e8d5b0]",
  "bg-gradient-to-r from-[#c9a96e]/70 to-[#c9a96e]",
  "bg-gradient-to-r from-[#e8d5b0] to-[#c9a96e]",
  "bg-gradient-to-r from-[#c9a96e] to-[#8a7349]",
  "bg-gradient-to-r from-[#e8d5b0]/80 to-[#c9a96e]",
  "bg-gradient-to-r from-[#c9a96e]/90 to-[#e8d5b0]",
];

export default function ServicesPage() {
  const { t, lang } = useI18n();
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const narrowViewport = useMediaQuery("(max-width: 768px)");
  const heroY = useTransform(
    heroScroll,
    useCallback((p: number) => `${narrowViewport ? 0 : p * 25}%`, [narrowViewport]),
  );
  const heroOpacity = useTransform(heroScroll, [0, 0.85], [1, 0]);

  const services = [
    {
      title: t.services.service1Title,
      eyebrow: t.services.service1Eyebrow,
      tagline: t.services.service1Tagline,
      desc: t.services.service1Desc,
      points: t.services.service1Points,
    },
    {
      title: t.services.service2Title,
      eyebrow: t.services.service2Eyebrow,
      tagline: t.services.service2Tagline,
      desc: t.services.service2Desc,
      points: t.services.service2Points,
    },
    {
      title: t.services.service3Title,
      eyebrow: t.services.service3Eyebrow,
      tagline: t.services.service3Tagline,
      desc: t.services.service3Desc,
      points: t.services.service3Points,
    },
    {
      title: t.services.service4Title,
      eyebrow: t.services.service4Eyebrow,
      tagline: t.services.service4Tagline,
      desc: t.services.service4Desc,
      points: t.services.service4Points,
    },
    {
      title: t.services.service5Title,
      eyebrow: t.services.service5Eyebrow,
      tagline: t.services.service5Tagline,
      desc: t.services.service5Desc,
      points: t.services.service5Points,
    },
    {
      title: t.services.service6Title,
      eyebrow: t.services.service6Eyebrow,
      tagline: t.services.service6Tagline,
      desc: t.services.service6Desc,
      points: t.services.service6Points,
    },
  ];

  return (
    <main className="bg-[#FAF8F5] min-h-screen pt-16">
      <Seo
        title={t.seo.services.title}
        description={t.seo.services.description}
        path="/partners/services"
        lang={lang}
      />
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section
        ref={heroRef}
        className="relative flex h-[100svh] items-center overflow-hidden bg-[#FAF8F5] md:h-screen md:min-h-[700px]"
      >
        <motion.div
          className="pointer-events-none absolute inset-0 z-0 overflow-hidden will-change-transform"
          style={{ y: heroY }}
        >
          <Image
            src="https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=1920&q=85"
            alt="Business advisory meeting for real estate development and new construction sales"
            fill
            priority
            sizes="100vw"
            className="object-cover scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FAF8F5]/92 via-[#FAF8F5]/75 to-[#FAF8F5]/35" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5] via-transparent to-[#FAF8F5]/40" />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full shrink-0 py-8 sm:py-12"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            className="text-[10px] sm:text-xs tracking-[0.15em] sm:tracking-[0.3em] uppercase text-[#c9a96e] mb-6 font-medium leading-relaxed max-w-lg"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t.services.heroEyebrow}
          </motion.p>

          <motion.h1
            className="font-sans font-semibold text-[#1C1917] leading-[1.1] mb-6 max-w-4xl break-words hyphens-auto"
            style={{ fontSize: lang === "hy" ? "clamp(1.7rem, 2.8vw, 2.8rem)" : "clamp(2rem, 3.5vw, 3.5rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t.services.heroTitle1}
            <br />
            <span className="text-[#c9a96e]">{t.services.heroTitle2}</span>
          </motion.h1>

          <motion.div
            className="flex flex-wrap gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
          >
            <a href="#services-list">
              <span className="btn-outline inline-block px-10 py-4 text-xs tracking-[0.3em] uppercase rounded-sm cursor-pointer">
                {t.services.heroCtaEngage}
              </span>
            </a>
            <a href="#process">
              <span className="btn-outline inline-block px-10 py-4 text-xs tracking-[0.3em] uppercase rounded-sm cursor-pointer">
                {t.services.heroCtaLearn}
              </span>
            </a>
          </motion.div>
        </motion.div>

        {/* scroll hint */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#A8A29E]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.6 }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>
      </section>

      {/* ─── OVERVIEW INTRO ──────────────────────────────────────────────── */}
      <section className="py-20 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col gap-14 lg:gap-16">
          <SectionTitle
            eyebrow={t.services.overviewEyebrow}
            title={t.services.overviewTitle}
          />
          <motion.div
            className="grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 items-stretch"
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {services.map((svc, i) => {
              const Icon = SERVICE_ICONS[i];
              return (
                <motion.a
                  key={i}
                  href={`#service-${i}`}
                  className="bg-[#F3EFE8] border border-[#E7E0D5] rounded-xl p-5 flex h-full min-w-0 w-full flex-col items-center text-center gap-3 hover:border-[#c9a96e]/50 transition-all cursor-pointer group"
                  whileHover={{ y: -4 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="w-10 h-10 shrink-0 rounded-lg border border-[#E7E0D5] group-hover:border-[#c9a96e] flex items-center justify-center transition-colors">
                    <Icon size={18} className="text-[#c9a96e]" />
                  </div>
                  <span className="text-[10px] sm:text-xs text-[#57534E] leading-snug min-w-0 w-full break-words">
                    {svc.title}
                  </span>
                </motion.a>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── SERVICE CARDS ───────────────────────────────────────────────── */}
      <section id="services-list" className="pb-8">
        {services.map((svc, i) => {
          const Icon = SERVICE_ICONS[i];
          const isEven = i % 2 === 0;
          return (
            <div
              id={`service-${i}`}
              key={i}
              className={`py-24 ${i % 2 !== 0 ? "bg-[#F3EFE8] border-y border-[#E7E0D5]" : ""}`}
            >
              <div className="max-w-7xl mx-auto px-6 lg:px-10">
                <div className={`grid grid-cols-1 lg:grid-cols-2 gap-16 items-center ${!isEven ? "lg:grid-flow-col" : ""}`}>
                  {/* Image side */}
                  <motion.div
                    className={`relative ${!isEven ? "lg:order-2" : ""}`}
                    initial={{ opacity: 0, x: isEven ? -40 : 40 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="relative rounded-2xl overflow-hidden h-56 sm:h-72 lg:h-[420px]">
                      <Image
                        src={SERVICE_HERO_IMGS[i]}
                        alt={svc.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#FAF8F5]/85 to-transparent" />

                      {/* Number badge */}
                      <div className="absolute top-6 left-6 font-sans font-semibold text-[6rem] text-white/5 leading-none select-none pointer-events-none">
                        {String(i + 1).padStart(2, "0")}
                      </div>

                      {/* Eyebrow pill */}
                      <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
                        <span className="bg-white/90 backdrop-blur-sm border border-[#E7E0D5] px-4 py-2 rounded-full text-[10px] tracking-[0.25em] uppercase text-[#c9a96e]">
                          {svc.eyebrow}
                        </span>
                        <div className="w-12 h-12 rounded-full bg-[#c9a96e]/10 border border-[#c9a96e]/40 backdrop-blur-sm flex items-center justify-center">
                          <Icon size={18} className="text-[#c9a96e]" />
                        </div>
                      </div>
                    </div>

                    {/* Accent line */}
                    <div className={`absolute -bottom-2 left-8 right-8 h-0.5 ${ACCENT_LINES[i % ACCENT_LINES.length]} rounded-full opacity-60`} />
                  </motion.div>

                  {/* Content side */}
                  <motion.div
                    className={!isEven ? "lg:order-1" : ""}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.7, delay: 0.15 }}
                  >
                    <p className="text-xs tracking-[0.3em] uppercase text-[#c9a96e] mb-3 font-medium">{svc.eyebrow}</p>
                    <h2
                      className="font-sans font-semibold text-[#1C1917] leading-tight mb-4 break-words hyphens-auto"
                      style={{ fontSize: lang === "hy" ? "clamp(1.3rem, 2vw, 1.9rem)" : "clamp(1.6rem, 2.5vw, 2.4rem)" }}
                    >
                      {svc.title}
                    </h2>

                    {/* Tagline */}
                    <p className="text-[#c9a96e]/80 font-sans font-semibold text-xl italic mb-6 border-l-2 border-[#c9a96e]/30 pl-4">
                      "{svc.tagline}"
                    </p>

                    <p className="text-[#57534E] leading-relaxed text-sm mb-8">{svc.desc}</p>

                    {/* Deliverables */}
                    <div className="space-y-3">
                      {svc.points.map((point, j) => (
                        <motion.div
                          key={j}
                          className="flex items-center gap-3"
                          initial={{ opacity: 0, x: -10 }}
                          whileInView={{ opacity: 1, x: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: 0.2 + j * 0.07 }}
                        >
                          <CheckCircle2 size={15} className="text-[#c9a96e] shrink-0" />
                          <span className="text-sm text-[#57534E]">{point}</span>
                        </motion.div>
                      ))}
                    </div>

                    <motion.div
                      className="mt-10"
                      initial={{ opacity: 0 }}
                      whileInView={{ opacity: 1 }}
                      viewport={{ once: true }}
                      transition={{ delay: 0.5 }}
                    >
                      <Link href="/partners#contact">
                        <span className="inline-flex items-center gap-3 text-xs tracking-[0.25em] uppercase text-[#c9a96e] hover:text-[#e8d5b0] transition-colors cursor-pointer group">
                          {t.services.heroCtaEngage}
                          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                        </span>
                      </Link>
                    </motion.div>
                  </motion.div>
                </div>
              </div>
            </div>
          );
        })}
      </section>

      {/* ─── PROCESS ─────────────────────────────────────────────────────── */}
      <section id="process" className="py-28 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionTitle
          eyebrow={t.services.processEyebrow}
          title={t.services.processTitle}
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
          {t.services.processSteps.map((step, i) => (
            <motion.div
              key={i}
              className="relative bg-[#F3EFE8] border border-[#E7E0D5] rounded-xl p-8 hover:border-[#c9a96e]/40 transition-all group overflow-hidden"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.12, duration: 0.6 }}
            >
              {/* Big number background */}
              <div className="absolute -top-4 -right-2 font-sans font-semibold text-[7rem] text-[#c9a96e]/5 leading-none select-none pointer-events-none group-hover:text-[#c9a96e]/10 transition-colors">
                {step.num}
              </div>

              <p className="font-sans tabular-nums text-[#c9a96e] text-sm font-medium mb-5">{step.num}</p>
              <h3 className="font-sans font-semibold text-xl text-[#1C1917] mb-3">
                {step.title}
              </h3>
              <p className="text-[#57534E] text-sm leading-relaxed">{step.desc}</p>

              {/* Connector arrow (not on last) */}
              {i < t.services.processSteps.length - 1 && (
                <div className="hidden lg:flex absolute -right-2 top-1/2 -translate-y-1/2 z-10">
                  <div className="w-4 h-4 border-t-2 border-r-2 border-[#E7E0D5] rotate-45" />
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── WHY US / CREDENTIALS ────────────────────────────────────────── */}
      <section className="py-28 bg-[#F3EFE8] border-y border-[#E7E0D5]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            {/* Left: text */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p className="text-xs tracking-[0.35em] uppercase text-[#c9a96e] mb-4 font-medium">{t.services.whyEyebrow}</p>
              <h2
                className="font-sans font-semibold text-[#1C1917] leading-tight mb-5 break-words hyphens-auto"
                style={{ fontSize: lang === "hy" ? "clamp(1.4rem, 2vw, 2rem)" : "clamp(1.7rem, 2.5vw, 2.5rem)" }}
              >
                {t.services.whyTitle}
              </h2>
              <p className="text-[#57534E] leading-relaxed mb-12 max-w-lg">{t.services.whySubtitle}</p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {t.services.whyPoints.map((p, i) => (
                  <motion.div
                    key={i}
                    className="border-l-2 border-[#c9a96e]/40 pl-5"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <p className="font-sans font-semibold text-3xl text-[#c9a96e]">{p.stat}</p>
                    <p className="text-xs text-[#57534E] mt-1 leading-snug">{p.label}</p>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Right: image collage */}
            <motion.div
              className="relative h-[500px]"
              initial={{ opacity: 0, scale: 0.97 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <Image
                src="https://images.unsplash.com/photo-1521737604893-d14cc237f11d?w=800&q=80"
                alt="Advisory team"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover rounded-2xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#F3EFE8]/90 to-transparent rounded-2xl" />

              {/* Floating credential card */}
              <motion.div
                className="absolute -bottom-8 -left-6 bg-[#FAF8F5] border border-[#E7E0D5] rounded-xl p-5 w-52 hidden lg:block"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4 }}
              >
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-2 h-2 rounded-full bg-[#c9a96e] animate-pulse" />
                  <span className="text-[10px] tracking-[0.2em] uppercase text-[#A8A29E]">{t.services.credentialEyebrow}</span>
                </div>
                <p className="font-sans font-semibold text-2xl text-[#1C1917]">{t.services.credentialTitle}</p>
                <p className="text-xs text-[#57534E] mt-1">{t.services.credentialSub}</p>
              </motion.div>

              {/* Check list overlay */}
              <div className="absolute top-6 right-6 bg-white/90 backdrop-blur-sm border border-[#E7E0D5] rounded-xl p-4 hidden lg:block">
                {t.services.checklistItems.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-2 mb-2 last:mb-0">
                    <Check size={12} className="text-[#c9a96e]" />
                    <span className="text-xs text-[#57534E]">{item}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── CTA / CONTACT ───────────────────────────────────────────────── */}
      <section className="py-32 relative overflow-hidden">
        {/* Background texture */}
        <div className="absolute inset-0 opacity-10" aria-hidden>
          <Image
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=50"
            alt=""
            fill
            sizes="100vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-[#FAF8F5]" />
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10 text-center mb-16">
          <motion.p
            className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-4"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.services.ctaEyebrow}
          </motion.p>
          <motion.h2
            className="font-sans font-semibold text-[#1C1917] leading-tight mb-5 break-words hyphens-auto"
            style={{ fontSize: lang === "hy" ? "clamp(1.4rem, 2.4vw, 2.4rem)" : "clamp(1.7rem, 3vw, 3rem)" }}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            {t.services.ctaTitle}
          </motion.h2>
          <motion.p
            className="text-[#57534E] leading-relaxed"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
          >
            {t.services.ctaSubtitle}
          </motion.p>
        </div>

        <div className="relative z-10 max-w-3xl mx-auto px-6 lg:px-10">
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
