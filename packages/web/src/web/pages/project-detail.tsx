import { useParams } from "wouter";
import { motion } from "framer-motion";
import { MapPin, Calendar, Building2, Home, ChevronRight, Check } from "lucide-react";
import { ProjectGallery } from "../components/ProjectGallery";
import { DroneVideoSection } from "../components/DroneVideoSection";
import { ApartmentTable } from "../components/ApartmentTable";
import { ContactForm } from "../components/ContactForm";
import { SectionTitle } from "../components/ui/SectionTitle";
import { StatusBadge } from "../components/ui/StatusBadge";
import { Link } from "wouter";
import { useI18n } from "../lib/i18n";
import { useProjects } from "../lib/projects-context";

const AMENITY_ICONS: Record<string, string> = {
  Waves: "🏊",
  Dumbbell: "💪",
  Car: "🚗",
  Shield: "🛡️",
  Leaf: "🌿",
  UtensilsCrossed: "🍽️",
  Wifi: "📶",
  Zap: "⚡",
};

function formatPrice(p: number) {
  return p >= 1_000_000 ? `$${(p / 1_000_000).toFixed(1)}M` : `$${(p / 1000).toFixed(0)}K`;
}

const PLACE_ICONS: Record<string, string> = {
  transport: "🚇",
  education: "🎓",
  health: "🏥",
  leisure: "🎭",
  shopping: "🛍️",
};

export default function ProjectDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const { t, lang } = useI18n();
  const { getBySlug } = useProjects();
  const project = getBySlug(slug);

  if (!project) {
    return (
      <main className="bg-[#0C1428] min-h-screen pt-32 flex items-center justify-center">
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-5xl text-[#2a2520]">{t.projectNotFound}</p>
          <Link href="/projects">
            <span className="mt-8 inline-block text-[#c9a96e] text-sm tracking-widest uppercase cursor-pointer">
              {t.backProjects}
            </span>
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="bg-[#0C1428] min-h-screen pt-20">
      {/* ─── BREADCRUMB ─────────────────────────────────────────────────── */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
        <div className="flex items-center gap-2 text-xs text-[#5a554f]">
          <Link href="/"><span className="hover:text-[#c9a96e] cursor-pointer transition-colors">{t.projectDetail.breadHome}</span></Link>
          <ChevronRight size={12} />
          <Link href="/projects"><span className="hover:text-[#c9a96e] cursor-pointer transition-colors">{t.projectDetail.breadProjects}</span></Link>
          <ChevronRight size={12} />
          <span className="text-[#9a9085]">{project.title}</span>
        </div>
      </div>

      {/* ─── HEADER ─────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-10">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <StatusBadge status={project.status} />
            <h1
              className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] mt-3 leading-tight"
              style={{ fontSize: lang === "hy" ? "clamp(2rem, 2.8vw, 2.6rem)" : "clamp(2.5rem, 3.5vw, 3.2rem)" }}
            >
              {project.title}
            </h1>
            <div className="flex items-center gap-2 text-[#9a9085] text-sm mt-2">
              <MapPin size={14} className="text-[#c9a96e]" />
              {project.location}
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-widest uppercase text-[#5a554f] mb-1">{t.projectDetail.startingFrom}</p>
            <p className="font-['Cormorant_Garamond'] text-4xl text-[#c9a96e]">
              {formatPrice(project.startingPrice)}
            </p>
          </div>
        </motion.div>
      </section>

      {/* ─── GALLERY ────────────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
        <ProjectGallery images={project.images} title={project.title} />
      </section>

      {/* ─── DRONE VIDEOS ───────────────────────────────────────────────── */}
      <DroneVideoSection videos={project.droneVideos ?? []} projectTitle={project.title} />

      {/* ─── OVERVIEW + SIDEBAR ─────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-12">
            {/* Description */}
            <div>
              <SectionTitle eyebrow={t.projectDetail.overviewEyebrow} title={t.projectDetail.overviewTitle} />
              <p className="text-[#9a9085] leading-relaxed text-base">{project.longDescription}</p>
            </div>

            {/* Amenities */}
            <div>
              <SectionTitle eyebrow={t.projectDetail.amenitiesEyebrow} title={t.projectDetail.amenitiesTitle} />
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {project.amenities.map((a, i) => (
                  <motion.div
                    key={a.label}
                    className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-5 flex flex-col items-center text-center gap-3"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.07 }}
                  >
                    <span className="text-2xl">{AMENITY_ICONS[a.icon] ?? "✦"}</span>
                    <span className="text-xs text-[#9a9085] tracking-wide">{a.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Payment options */}
            <div>
              <SectionTitle eyebrow={t.projectDetail.financeEyebrow} title={t.projectDetail.financeTitle} />
              <div className="space-y-4">
                {project.paymentOptions.map((opt, i) => (
                  <motion.div
                    key={opt.title}
                    className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6 flex gap-4"
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                  >
                    <div className="w-6 h-6 rounded-full border border-[#c9a96e] flex items-center justify-center shrink-0 mt-0.5">
                      <Check size={12} className="text-[#c9a96e]" />
                    </div>
                    <div>
                      <p className="text-[#f0ece4] font-medium text-sm">{opt.title}</p>
                      <p className="text-[#9a9085] text-sm mt-1">{opt.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick facts */}
            <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#5a554f] mb-5">{t.projectDetail.detailsLabel}</p>
              <div className="space-y-4">
                {[
                  { label: t.projectDetail.developer, value: project.developer },
                  { label: t.projectDetail.architect, value: project.architect ?? "—" },
                  { label: t.projectDetail.floors, value: `${project.floors}` },
                  { label: t.projectDetail.totalUnits, value: `${project.totalApartments}` },
                  { label: t.projectDetail.available, value: `${project.availableApartmentsCount}` },
                  { label: t.projectDetail.completion, value: project.completionDate },
                  { label: t.projectDetail.statusLabel, value: project.status },
                ].map((row) => (
                  <div key={row.label} className="flex justify-between items-start">
                    <span className="text-xs text-[#5a554f] uppercase tracking-wider">{row.label}</span>
                    <span className="text-sm text-[#f0ece4] text-right ml-4">{row.value}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Tags */}
            <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#5a554f] mb-4">{t.projectDetail.highlights}</p>
              <div className="flex flex-wrap gap-2">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-[#162035] border border-[#2a2520] rounded-full text-xs text-[#9a9085] capitalize"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby */}
            <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6">
              <p className="text-xs tracking-[0.2em] uppercase text-[#5a554f] mb-5">{t.projectDetail.nearby}</p>
              <div className="space-y-3">
                {project.nearbyPlaces.map((place) => (
                  <div key={place.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-sm text-[#9a9085]">
                      <span>{PLACE_ICONS[place.category] ?? "📍"}</span>
                      {place.name}
                    </div>
                    <span className="text-xs font-['DM_Mono'] text-[#c9a96e]">{place.distance}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick contact */}
            <div className="bg-[#c9a96e]/10 border border-[#c9a96e]/30 rounded-xl p-6">
              <p className="text-[#c9a96e] text-sm font-medium mb-2">{t.projectDetail.interested}</p>
              <p className="text-[#9a9085] text-xs mb-4">{t.projectDetail.interestedDesc}</p>
              <Link href="/contact">
                <span className="block text-center py-3 bg-[#c9a96e] text-[#0C1428] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#e8d5b0] transition-all rounded-sm cursor-pointer">
                  {t.projectDetail.bookViewing}
                </span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── APARTMENTS TABLE ─────────────────────────────────────────────── */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
        <SectionTitle eyebrow={t.projectDetail.availabilityEyebrow} title={t.projectDetail.availabilityTitle} />
        <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl overflow-hidden">
          <ApartmentTable apartments={project.apartments} projectSlug={project.slug} />
        </div>
      </section>

      {/* ─── INQUIRY FORM ─────────────────────────────────────────────────── */}
      <section className="bg-[#0d1829] border-t border-[#2a2520] py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.projectDetail.contactEyebrow}
            title={t.projectDetail.contactTitle}
            subtitle={t.projectDetail.contactSubtitle}
            centered
          />
          <ContactForm defaultProject={project.title} />
        </div>
      </section>
    </main>
  );
}
