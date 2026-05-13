import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { ChevronRight, BedDouble, Layers, Square, Eye, Phone, Calendar, MapPin } from "lucide-react";
import { ProjectGallery } from "@/components/ProjectGallery";
import { ContactForm } from "@/components/ContactForm";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Seo } from "@/components/seo/Seo";
import { JsonLd } from "@/components/seo/JsonLd";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";
import { breadcrumbListSchema } from "@/lib/schema-breadcrumbs";

function formatPrice(p: number) {
  return p >= 1_000_000 ? `$${(p / 1_000_000).toFixed(1)}M` : `$${(p / 1000).toFixed(0)}K`;
}

export default function ApartmentDetailPage() {
  const params = useParams();
  const aptId = typeof params.aptId === "string" ? params.aptId : undefined;
  const slug = typeof params.slug === "string" ? params.slug : undefined;
  const { t, lang } = useI18n();
  const { projects } = useProjects();

  // Find apartment across all projects
  const result = (() => {
    for (const project of projects) {
      const apartment = project.apartments.find((a) => a.id === aptId);
      if (apartment) return { apartment, project };
    }
    return undefined;
  })();

  if (!result) {
    return (
      <main className="bg-[#0C1428] min-h-screen pt-32 flex items-center justify-center">
        <Seo title={t.aptNotFound} description={t.aptNotFound} path={`/projects/${slug ?? "_"}/apartments/${aptId ?? ""}`} lang={lang} noindex />
        <div className="text-center">
          <p className="font-['Cormorant_Garamond'] text-5xl text-[#2a2520]">{t.aptNotFound}</p>
          <Link href="/projects">
            <span className="mt-8 inline-block text-[#c9a96e] text-sm tracking-widest uppercase cursor-pointer">
              {t.backProjects}
            </span>
          </Link>
        </div>
      </main>
    );
  }

  const { apartment: apt, project } = result;

  const path = `/projects/${project.slug}/apartments/${apt.id}`;
  const titleSeo = `${apt.rooms}-bedroom apartment · ${project.title}`;
  const descSeo = `${apt.rooms}BR residence at ${project.title} in ${project.location}. ${apt.area} m², ${t.aptDetail.floorLabel} ${apt.floor}. Explore availability with CasaGroup.`;

  const allImages = [
    ...apt.gallery,
    ...(apt.floorPlanImage ? [apt.floorPlanImage] : []),
    ...project.images.slice(0, 2),
  ];

  const relatedApartments = project.apartments
    .filter((a) => a.id !== apt.id && a.status === "Available")
    .slice(0, 3);

  return (
    <main className="bg-[#0C1428] min-h-screen pt-20">
      <Seo
        title={titleSeo}
        description={descSeo}
        path={path}
        image={allImages[0] ?? project.images[0]}
        lang={lang}
        ogType="article"
      />
      <JsonLd
        data={breadcrumbListSchema([
          { name: t.aptDetail.breadHome, path: "/" },
          { name: t.aptDetail.breadProjects, path: "/projects" },
          { name: project.title, path: `/projects/${project.slug}` },
          { name: `${apt.rooms}BR · ${t.aptDetail.floorLabel} ${apt.floor}`, path },
        ])}
      />
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-6">
        <div className="flex items-center gap-2 text-xs text-[#5a554f] flex-wrap">
          <Link href="/"><span className="hover:text-[#c9a96e] cursor-pointer transition-colors">{t.aptDetail.breadHome}</span></Link>
          <ChevronRight size={12} />
          <Link href="/projects"><span className="hover:text-[#c9a96e] cursor-pointer transition-colors">{t.aptDetail.breadProjects}</span></Link>
          <ChevronRight size={12} />
          <Link href={`/projects/${project.slug}`}>
            <span className="hover:text-[#c9a96e] cursor-pointer transition-colors">{project.title}</span>
          </Link>
          <ChevronRight size={12} />
          <span className="text-[#9a9085]">{t.aptDetail.floorLabel} {apt.floor} · {apt.rooms}BR</span>
        </div>
      </div>

      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 pb-10">
        <motion.div
          className="flex flex-col md:flex-row md:items-end md:justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div>
            <StatusBadge status={apt.status} />
            <h1
              className="font-['Cormorant_Garamond'] font-light text-[#f0ece4] mt-3 leading-tight"
              style={{ fontSize: lang === "hy" ? "clamp(1.7rem, 2.4vw, 2.4rem)" : "clamp(2rem, 3vw, 3rem)" }}
            >
              {apt.rooms}-{t.aptDetail.bedroomApt}
              <span className="text-[#9a9085]"> · {t.aptDetail.floorLabel} {apt.floor}</span>
            </h1>
            <div className="flex items-center gap-2 text-[#9a9085] text-sm mt-2">
              <MapPin size={13} className="text-[#c9a96e]" />
              <Link href={`/projects/${project.slug}`}>
                <span className="hover:text-[#c9a96e] transition-colors cursor-pointer">{project.title}</span>
              </Link>
              <span>·</span>
              <span>{project.location}</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs tracking-widest uppercase text-[#5a554f] mb-1">{t.aptDetail.priceLabel}</p>
            <p className="font-['Cormorant_Garamond'] text-4xl text-[#c9a96e]">{formatPrice(apt.price)}</p>
          </div>
        </motion.div>
      </section>

      {/* Gallery */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-20">
        {allImages.length > 0 ? (
          <ProjectGallery images={allImages} title={`${project.title} apartment`} />
        ) : (
          <div className="h-80 bg-[#0d1829] border border-[#2a2520] rounded-xl flex items-center justify-center">
            <p className="text-[#5a554f] text-sm">{t.aptDetail.noImages}</p>
          </div>
        )}
      </section>

      {/* Details + CTA */}
      <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Specs */}
          <div className="lg:col-span-2">
            <SectionTitle eyebrow={t.aptDetail.specsEyebrow} title={t.aptDetail.specsTitle} />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-5 mb-12">
              {[
                { icon: BedDouble, label: t.aptDetail.bedrooms, value: `${apt.rooms} BR` },
                { icon: Layers, label: t.aptDetail.floorSpec, value: `${apt.floor} of ${project.floors}` },
                { icon: Square, label: t.aptDetail.area, value: `${apt.area} m²` },
                { icon: Eye, label: t.aptDetail.viewSpec, value: apt.viewType },
                { icon: Calendar, label: t.aptDetail.completionSpec, value: project.completionDate },
                { icon: MapPin, label: t.aptDetail.locationSpec, value: project.city },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-5"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                >
                  <item.icon size={16} className="text-[#c9a96e] mb-3" />
                  <p className="text-xs text-[#5a554f] uppercase tracking-wider mb-1">{item.label}</p>
                  <p className="text-[#f0ece4] font-medium text-sm">{item.value}</p>
                </motion.div>
              ))}
            </div>

            {/* Floor plan */}
            {apt.floorPlanImage && (
              <div className="mb-12">
                <SectionTitle eyebrow={t.aptDetail.layoutEyebrow} title={t.aptDetail.layoutTitle} />
                <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-4">
                  <div className="relative w-full min-h-[200px] h-96 max-h-96">
                    <Image
                      src={apt.floorPlanImage}
                      alt="Floor plan"
                      fill
                      unoptimized
                      sizes="(max-width: 1024px) 100vw, 66vw"
                      className="object-contain rounded-lg"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* CTA Sidebar */}
          <div className="space-y-5">
            <div className="bg-[#0d1829] border border-[#2a2520] rounded-xl p-6 sticky top-24">
              <p className="font-['Cormorant_Garamond'] text-2xl text-[#f0ece4] mb-1">
                {t.aptDetail.interested}
              </p>
              <p className="text-sm text-[#9a9085] mb-6">
                {t.aptDetail.interestedDesc}
              </p>

              <div className="space-y-3">
                <a
                  href="tel:+37410123456"
                  className="flex items-center justify-center gap-2 w-full py-3.5 bg-[#c9a96e] text-[#0C1428] text-xs tracking-[0.2em] uppercase font-semibold hover:bg-[#e8d5b0] transition-all rounded-sm"
                >
                  <Phone size={14} />
                  {t.aptDetail.requestCall}
                </a>
                <Link href="/contact">
                  <span className="flex items-center justify-center gap-2 w-full py-3.5 border border-[#c9a96e] text-[#c9a96e] text-xs tracking-[0.2em] uppercase font-medium hover:bg-[#c9a96e]/10 transition-all rounded-sm cursor-pointer">
                    <Calendar size={14} />
                    {t.aptDetail.bookViewing}
                  </span>
                </Link>
              </div>

              <div className="mt-6 pt-6 border-t border-[#2a2520] space-y-3">
                {[
                  [t.aptDetail.price, formatPrice(apt.price)],
                  [t.aptDetail.areaShort, `${apt.area} m²`],
                  [t.aptDetail.floorShort, `${apt.floor}`],
                  [t.aptDetail.viewShort, apt.viewType],
                  [t.aptDetail.statusLabel, apt.status],
                  [t.aptDetail.balcony, apt.balcony ? t.aptDetail.yes : t.aptDetail.no],
                ].map(([label, val]) => (
                  <div key={label} className="flex justify-between">
                    <span className="text-xs text-[#5a554f] uppercase tracking-wider">{label}</span>
                    <span className="text-sm text-[#f0ece4]">{val}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Related apartments */}
      {relatedApartments.length > 0 && (
        <section className="max-w-7xl mx-auto px-6 lg:px-10 mb-24">
          <SectionTitle eyebrow={t.aptDetail.relatedEyebrow} title={t.aptDetail.relatedTitle} />
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2a2520]">
                  {[t.table.floor, t.table.rooms, t.table.area, t.table.price, t.table.view, t.table.status, ""].map((h, i) => (
                    <th key={i} className="text-left py-4 px-4 text-xs tracking-[0.2em] uppercase text-[#5a554f]">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {relatedApartments.map((a) => (
                  <tr key={a.id} className="border-b border-[#1e2d45] hover:bg-[#0d1829] transition-colors">
                    <td className="py-4 px-4 text-[#f0ece4] font-['DM_Mono'] text-sm">{a.floor}</td>
                    <td className="py-4 px-4 text-[#f0ece4] text-sm">{a.rooms} BR</td>
                    <td className="py-4 px-4 text-[#f0ece4] font-['DM_Mono'] text-sm">{a.area} m²</td>
                    <td className="py-4 px-4 text-[#c9a96e] font-['DM_Mono'] font-medium">{formatPrice(a.price)}</td>
                    <td className="py-4 px-4 text-[#9a9085] text-sm">{a.viewType}</td>
                    <td className="py-4 px-4"><StatusBadge status={a.status} /></td>
                    <td className="py-4 px-4">
                      <Link href={`/projects/${project.slug}/apartments/${a.id}`}>
                        <span className="text-xs tracking-widest uppercase text-[#c9a96e] cursor-pointer">{t.table.viewBtn}</span>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Inquiry form */}
      <section className="bg-[#0d1829] border-t border-[#2a2520] py-24">
        <div className="max-w-3xl mx-auto px-6 lg:px-10">
          <SectionTitle
            eyebrow={t.aptDetail.inquireEyebrow}
            title={t.aptDetail.inquireTitle}
            subtitle={t.aptDetail.inquireSubtitle}
            centered
          />
          <ContactForm defaultProject={project.title} />
        </div>
      </section>
    </main>
  );
}
