import { useRef, useState } from "react";
import { Link } from "wouter";
import { motion, useScroll, useTransform } from "framer-motion";
import { ChevronDown, Award, Shield, TrendingUp, MapPin, Plus, Minus } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { StatsSection } from "@/components/StatsSection";
import { ContactForm } from "@/components/ContactForm";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";

const WHY_ICONS = [Award, Shield, TrendingUp, MapPin];

const MATERIAL_IMGS = [
  "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80",
  "https://images.unsplash.com/photo-1565183997392-2f6f122e5912?w=600&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=600&q=80",
];

export default function HomePage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const FEATURED = projects.filter((p) => p.featured);
  const [faqOpen, setFaqOpen] = useState<number | null>(0);
  const heroRef = useRef<HTMLElement>(null);
  const { scrollYProgress: heroScroll } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const heroY = useTransform(heroScroll, [0, 1], ["0%", "30%"]);
  const heroOpacity = useTransform(heroScroll, [0, 0.8], [1, 0]);

  return (
    <main className="bg-[#0C1428] min-h-screen">
      <Seo
        title={t.seo.home.title}
        description={t.seo.home.description}
        path="/"
        lang={lang}
      />
      {/* ─── HERO ─────────────────────────────────────────────────────────── */}
      <section ref={heroRef} className="relative h-screen min-h-[700px] overflow-hidden flex items-center">
        <motion.div
          className="absolute inset-0 will-change-transform"
          style={{ y: heroY }}
        >
          <img
            src="https://images.unsplash.com/photo-1486325212027-8081e485255e?w=1920&q=85"
            alt="Modern high-rise residential complex at dusk — CasaGroup new construction portfolio"
            className="w-full h-full object-cover scale-110"
            fetchPriority="high"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0C1428]/85 via-[#0C1428]/50 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0C1428] via-transparent to-transparent" />
        </motion.div>

        <motion.div
          className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 w-full"
          style={{ opacity: heroOpacity }}
        >
          <motion.p
            className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-[#c9a96e] mb-6 font-medium leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.8 }}
          >
            {t.home.heroEyebrow}
          </motion.p>

          <motion.h1
            className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] leading-[1.1] mb-8 max-w-3xl break-words hyphens-auto"
            style={{ fontSize: lang === "hy" ? "clamp(1.8rem, 3vw, 2.8rem)" : "clamp(2.2rem, 4vw, 3.5rem)" }}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35, duration: 0.9, ease: [0.25, 0.1, 0.25, 1] }}
          >
            {t.home.heroTitle1}
            <br />
            <span className="text-[#c9a96e]">{t.home.heroTitle2}</span>
          </motion.h1>

          <motion.p
            className="text-[#9a9085] font-light leading-relaxed max-w-lg mb-10 text-sm sm:text-base"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
          >
            {t.home.heroSubtitle}
          </motion.p>

          <motion.div
            className="flex flex-wrap gap-3 sm:gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.7 }}
          >
            <Link href="/projects">
              <span className="inline-block px-8 sm:px-10 py-3.5 sm:py-4 bg-[#c9a96e] text-[#0C1428] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-semibold hover:bg-[#e8d5b0] transition-all duration-200 rounded-sm cursor-pointer text-center">
                {t.home.heroCtaProjects}
              </span>
            </Link>
            <Link href="/contact">
              <span className="inline-block px-8 sm:px-10 py-3.5 sm:py-4 border border-[#f0ece4]/40 text-[#f0ece4] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-medium hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all duration-200 rounded-sm cursor-pointer text-center">
                {t.home.heroCtaContact}
              </span>
            </Link>
            <Link href="/contact">
              <span className="inline-block px-8 sm:px-10 py-3.5 sm:py-4 border border-[#c9a96e]/50 text-[#c9a96e] text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.3em] uppercase font-medium hover:bg-[#c9a96e]/10 transition-all duration-200 rounded-sm cursor-pointer text-center">
                {t.home.heroCtaSubmitProject}
              </span>
            </Link>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#5a554f]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.2 }}
        >
          <span className="text-xs tracking-[0.3em] uppercase">{t.home.heroScroll}</span>
          <motion.div animate={{ y: [0, 8, 0] }} transition={{ repeat: Infinity, duration: 1.5 }}>
            <ChevronDown size={16} />
          </motion.div>
        </motion.div>

        {/* Floating info card */}
        <motion.div
          className="absolute bottom-16 right-8 lg:right-16 hidden lg:block"
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.9, duration: 0.7 }}
        >
          <div className="bg-[#0f1e30]/90 backdrop-blur-md border border-[#2a2520] rounded-xl p-6 w-56">
            <p className="text-xs tracking-widest uppercase text-[#5a554f] mb-1">{t.home.heroFloatingNew}</p>
            <p className="font-['Cormorant_Garamond'] text-xl text-[#f0ece4] font-light">Ararat Heights</p>
            <p className="text-[#9a9085] text-xs mt-1">28 {t.home.heroFloatingFloors}</p>
            <div className="mt-3 pt-3 border-t border-[#2a2520] flex justify-between items-center">
              <span className="text-[#c9a96e] font-['DM_Mono'] font-medium">{t.home.heroFloatingFrom} $185K</span>
              <span className="text-xs text-[#5a554f]">14 {t.home.heroFloatingAvail}</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* ─── FEATURED PROJECTS ───────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between mb-16 gap-6">
          <SectionTitle
            eyebrow={t.home.featuredEyebrow}
            title={t.home.featuredTitle}
            subtitle={t.home.featuredSubtitle}
          />
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            <Link href="/projects">
              <span className="text-xs tracking-[0.25em] uppercase text-[#c9a96e] hover:text-[#e8d5b0] transition-colors cursor-pointer whitespace-nowrap">
                {t.home.featuredAll}
              </span>
            </Link>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURED.map((project, i) => (
            <motion.div key={project.id} transition={{ delay: i * 0.1 }}>
              <ProjectCard project={project} />
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── STATS ────────────────────────────────────────────────────────── */}
      <StatsSection />

      {/* ─── WHY CHOOSE US ───────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionTitle
          eyebrow={t.home.whyEyebrow}
          title={t.home.whyTitle}
          subtitle={t.home.whySubtitle}
          centered
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-16">
          {t.home.why.map((item, i) => {
            const Icon = WHY_ICONS[i];
            return (
              <motion.div
                key={i}
                className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-8 hover:border-[#c9a96e]/40 transition-all group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.6 }}
              >
                <div className="w-12 h-12 border border-[#2a2520] rounded-lg flex items-center justify-center mb-6 group-hover:border-[#c9a96e] transition-colors">
                  <Icon size={20} className="text-[#c9a96e]" />
                </div>
                <h3 className="font-['Cormorant_Garamond'] text-xl font-light text-[#f0ece4] mb-3">
                  {item.title}
                </h3>
                <p className="text-[#9a9085] text-sm leading-relaxed">{item.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* ─── PARALLAX BANNER ─────────────────────────────────────────────── */}
      <section className="relative h-[60vh] overflow-hidden flex items-center">
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          whileInView={{ scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 1.2, ease: "easeOut" }}
        >
          <img
            src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=80"
            alt="Premium residential interior showcasing materials and finishes for new construction homes"
            className="w-full h-full object-cover"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-[#0C1428]/65" />
        </motion.div>

        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10 text-center w-full">
          <motion.p
            className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-5"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
          >
            {t.home.bannerEyebrow}
          </motion.p>
          <motion.h2
            className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] max-w-4xl mx-auto whitespace-pre-line break-words hyphens-auto px-4"
            style={{ fontSize: lang === "hy" ? "clamp(1.2rem, 2vw, 2rem)" : "clamp(1.4rem, 2.5vw, 2.4rem)" }}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            {t.home.bannerTitle}
          </motion.h2>
        </div>
      </section>

      {/* ─── MATERIALS ───────────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionTitle
          eyebrow={t.home.materialsEyebrow}
          title={t.home.materialsTitle}
          subtitle={t.home.materialsSubtitle}
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
          {t.home.materials.map((mat, i) => (
            <motion.div
              key={i}
              className="group cursor-default"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.15, duration: 0.6 }}
            >
              <div className="h-72 rounded-xl overflow-hidden mb-5">
                <motion.img
                  src={MATERIAL_IMGS[i]}
                  alt={`${mat.title} — CasaGroup new construction advisory`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  decoding="async"
                  whileHover={{ scale: 1.05 }}
                  transition={{ duration: 0.5 }}
                />
              </div>
              <p className="text-xs tracking-[0.2em] uppercase text-[#c9a96e] mb-2">{mat.title}</p>
              <p className="text-[#9a9085] text-sm">{mat.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── INVESTMENT BENEFITS ─────────────────────────────────────────── */}
      <section className="py-32 bg-[#0d1829] border-y border-[#2a2520]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <SectionTitle
                eyebrow={t.home.investEyebrow}
                title={t.home.investTitle}
                subtitle={t.home.investSubtitle}
              />
              <div className="space-y-6">
                {t.home.investStats.map((item, i) => (
                  <motion.div
                    key={i}
                    className="flex items-start gap-6"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1, duration: 0.5 }}
                  >
                    <span className="font-['Cormorant_Garamond'] text-3xl text-[#c9a96e] font-light shrink-0 w-20">
                      {item.stat}
                    </span>
                    <p className="text-[#9a9085] text-sm leading-relaxed pt-2">{item.desc}</p>
                  </motion.div>
                ))}
              </div>
            </div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <img
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80"
                alt="Contemporary apartment living room in a new residential complex"
                className="rounded-xl w-full object-cover h-64 sm:h-80 lg:h-[500px]"
                loading="lazy"
                decoding="async"
              />
              <div className="absolute -bottom-6 -left-6 bg-[#0f1e30] border border-[#2a2520] rounded-xl p-6 hidden xl:block">
                <p className="text-xs tracking-widest uppercase text-[#5a554f] mb-1">{t.home.investGrowth}</p>
                <p className="font-['Cormorant_Garamond'] text-3xl text-[#c9a96e]">+18%</p>
                <p className="text-xs text-[#9a9085] mt-1">{t.home.investYoY}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── LOCATION ───────────────────────────────────────────────────── */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionTitle
          eyebrow={t.home.locationEyebrow}
          title={t.home.locationTitle}
          subtitle={t.home.locationSubtitle}
          centered
        />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          {t.home.locationStats.map((item, i) => (
            <motion.div
              key={i}
              className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6 text-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="font-['Cormorant_Garamond'] text-xl sm:text-2xl text-[#c9a96e] font-light break-words">{item.value}</p>
              <p className="text-[10px] sm:text-xs tracking-wider uppercase text-[#9a9085] mt-1">{item.label}</p>
              <p className="text-[10px] sm:text-xs text-[#5a554f] mt-2">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── CASA ACADEMY ───────────────────────────────────────────────── */}
      <section id="academy" className="py-32 max-w-7xl mx-auto px-6 lg:px-10 scroll-mt-24">
        <SectionTitle
          eyebrow={t.home.academyEyebrow}
          title={t.home.academyTitle}
          subtitle={t.home.academyLead}
        />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mt-12 max-w-5xl">
          {t.home.academyBullets.map((item, i) => (
            <motion.div
              key={i}
              className="flex items-center gap-3 bg-[#0d1829] border border-[#2a2520] rounded-lg px-4 py-3 text-sm text-[#9a9085]"
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.04 }}
            >
              <span className="text-[#c9a96e] font-['DM_Mono'] text-xs">{String(i + 1).padStart(2, "0")}</span>
              <span className="leading-snug break-words">{item}</span>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ─── PARTNER NETWORK ─────────────────────────────────────────────── */}
      <section id="partners" className="py-32 bg-[#0d1829] border-y border-[#2a2520] scroll-mt-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.home.partnersEyebrow}
            title={t.home.partnersTitle}
            subtitle={t.home.partnersLead}
            centered
          />
          <div className="flex flex-wrap justify-center gap-3 mt-12 max-w-5xl mx-auto">
            {t.home.partnersList.map((label, i) => (
              <span
                key={i}
                className="px-4 py-2 rounded-full border border-[#2a2520] text-xs text-[#9a9085] hover:border-[#c9a96e]/40 transition-colors break-words text-center max-w-[280px]"
              >
                {label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ ─────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-32 max-w-7xl mx-auto px-6 lg:px-10 scroll-mt-24">
        <SectionTitle eyebrow={t.home.faqEyebrow} title={t.home.faqTitle} centered />
        <div className="max-w-3xl mx-auto mt-12 space-y-3">
          {t.home.faqItems.map((item, i) => {
            const open = faqOpen === i;
            return (
              <motion.div
                key={i}
                className="border border-[#2a2520] rounded-xl bg-[#0d1829] overflow-hidden"
                initial={false}
                animate={{ borderColor: open ? "rgba(201, 169, 110, 0.35)" : "rgba(42, 37, 32, 1)" }}
              >
                <button
                  type="button"
                  className="w-full flex items-start justify-between gap-4 text-left px-5 py-4"
                  onClick={() => setFaqOpen(open ? null : i)}
                  aria-expanded={open}
                >
                  <span className="text-sm sm:text-base text-[#f0ece4] font-light leading-snug break-words">
                    {item.q}
                  </span>
                  <span className="shrink-0 text-[#c9a96e] mt-0.5">{open ? <Minus size={18} /> : <Plus size={18} />}</span>
                </button>
                {open && (
                  <div className="px-5 pb-4 pt-0 border-t border-[#2a2520]/60">
                    <p className="text-sm text-[#9a9085] leading-relaxed pt-3 break-words">{item.a}</p>
                  </div>
                )}
              </motion.div>
            );
          })}
        </div>
        <motion.div
          className="max-w-2xl mx-auto mt-16 text-center"
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <p className="font-['Cormorant_Garamond'] text-xl text-[#f0ece4] font-light mb-3">{t.home.faqClosingTitle}</p>
          <p className="text-sm text-[#9a9085] leading-relaxed">{t.home.faqClosingText}</p>
        </motion.div>
      </section>

      {/* ─── CONTACT FORM ─────────────────────────────────────────────────── */}
      <section className="py-32 bg-[#0d1829] border-t border-[#2a2520]" id="contact">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.home.contactEyebrow}
            title={t.home.contactTitle}
            subtitle={t.home.contactSubtitle}
            centered
          />
          <ContactForm />
        </div>
      </section>
    </main>
  );
}
