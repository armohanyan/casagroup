import { motion } from "framer-motion";
import { Link } from "wouter";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { StatsSection } from "@/components/StatsSection";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

const TEAM_IMGS = [
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80",
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80",
];

export default function AboutPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-[#0C1428] min-h-screen pt-20">
      <Seo
        title={t.seo.about.title}
        description={t.seo.about.description}
        path="/about"
        lang={lang}
      />
      {/* Hero */}
      <section className="relative py-32 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1600210492493-0946911123ea?w=1920&q=70"
            alt="CasaGroup team environment and contemporary workspace"
            className="w-full h-full object-cover opacity-15"
            loading="lazy"
            decoding="async"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0C1428]/80 via-transparent to-[#0C1428]" />
        </div>
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-10">
          <motion.p
            className="text-[10px] sm:text-xs tracking-[0.2em] sm:tracking-[0.35em] uppercase text-[#c9a96e] mb-4 leading-relaxed"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            {t.about.heroEyebrow}
          </motion.p>
          <motion.h1
            className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] leading-tight max-w-3xl break-words hyphens-auto"
            style={{ fontSize: lang === "hy" ? "clamp(1.7rem, 2.8vw, 2.6rem)" : "clamp(2rem, 3.5vw, 3.2rem)" }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            {t.about.heroTitle1}
            <br />
            <span className="text-[#c9a96e]">{t.about.heroTitle2}</span>
          </motion.h1>
        </div>
      </section>

      {/* Story */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <img
              src="https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=800&q=80"
              alt="CasaGroup leadership collaborating on a residential development strategy"
              className="rounded-xl w-full h-64 sm:h-80 lg:h-[500px] object-cover"
              loading="lazy"
              decoding="async"
            />
          </motion.div>
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <SectionTitle eyebrow={t.about.storyEyebrow} title={t.about.storyTitle} />
            <div className="space-y-5 text-[#9a9085] leading-relaxed text-base">
              <p>{t.about.storyP1}</p>
              <p>{t.about.storyP2}</p>
              <p>{t.about.storyP3}</p>
              <p>{t.about.storyP4}</p>
            </div>
            <div className="mt-10">
              <Link href="/projects">
                <span className="inline-block px-8 py-3.5 bg-[#c9a96e] text-[#0C1428] text-xs tracking-[0.25em] uppercase font-semibold hover:bg-[#e8d5b0] transition-all rounded-sm cursor-pointer">
                  {t.about.storyCta}
                </span>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats */}
      <StatsSection />

      {/* Values */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-10">
        <SectionTitle
          eyebrow={t.about.principlesEyebrow}
          title={t.about.principlesTitle}
          centered
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-12">
          {t.about.values.map((v, i) => (
            <motion.div
              key={i}
              className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-8 hover:border-[#c9a96e]/30 transition-all"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <p className="text-xs tracking-[0.2em] uppercase text-[#c9a96e] mb-3">0{i + 1}</p>
              <h3 className="font-['Cormorant_Garamond'] text-2xl text-[#f0ece4] font-light mb-3">
                {v.title}
              </h3>
              <p className="text-[#9a9085] text-sm leading-relaxed">{v.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section className="py-32 bg-[#0d1829] border-y border-[#2a2520]">
        <div className="max-w-7xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.about.teamEyebrow}
            title={t.about.teamTitle}
            centered
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-12">
            {t.about.team.map((member, i) => (
              <motion.div
                key={i}
                className="group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="relative overflow-hidden rounded-xl mb-5 h-72">
                  <motion.img
                    src={TEAM_IMGS[i]}
                    alt={member.name}
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.4 }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0C1428] via-transparent to-transparent" />
                </div>
                <p className="font-['Cormorant_Garamond'] text-xl text-[#f0ece4] font-light">{member.name}</p>
                <p className="text-xs tracking-widest uppercase text-[#c9a96e] mt-1 mb-3">{member.role}</p>
                <p className="text-[#9a9085] text-xs leading-relaxed">{member.bio}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 max-w-7xl mx-auto px-6 lg:px-10 text-center">
        <motion.p
          className="text-xs tracking-[0.4em] uppercase text-[#c9a96e] mb-4"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
        >
          {t.about.ctaEyebrow}
        </motion.p>
        <motion.h2
          className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] mb-8 max-w-2xl mx-auto break-words hyphens-auto"
          style={{ fontSize: lang === "hy" ? "clamp(1.4rem, 2vw, 2rem)" : "clamp(1.6rem, 2.5vw, 2.5rem)" }}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {t.about.ctaTitle}
        </motion.h2>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/projects">
            <span className="inline-block px-10 py-4 bg-[#c9a96e] text-[#0C1428] text-xs tracking-[0.3em] uppercase font-semibold hover:bg-[#e8d5b0] transition-all rounded-sm cursor-pointer">
              {t.about.ctaProjects}
            </span>
          </Link>
          <Link href="/contact">
            <span className="inline-block px-10 py-4 border border-[#2a2520] text-[#f0ece4] text-xs tracking-[0.3em] uppercase font-medium hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all rounded-sm cursor-pointer">
              {t.about.ctaContact}
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
