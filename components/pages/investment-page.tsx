import Link from "next/link";
import { TrendingUp, Shield, BarChart3, Globe } from "lucide-react";
import { ProjectCard } from "@/components/ProjectCard";
import { PageHero } from "@/components/sales/PageHero";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";

const HIGHLIGHT_ICONS = [TrendingUp, Shield, BarChart3, Globe];

export default function InvestmentPage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const investmentProjects = projects
    .filter((p) => p.tags.some((tag) => /invest/i.test(tag)) || p.featured)
    .slice(0, 3);

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo
        title={t.seo.investment.title}
        description={t.seo.investment.description}
        path="/investment"
        lang={lang}
      />

      <PageHero title={t.investment.title} subtitle={t.investment.subtitle} />

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <SectionTitle title={t.investment.highlightsTitle} />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-14">
          {t.investment.highlights.map((item, i) => {
            const Icon = HIGHLIGHT_ICONS[i];
            return (
              <div key={i} className="bg-white border border-[#E7E0D5] rounded-xl p-6 flex gap-4 shadow-sm shadow-black/[0.03]">
                <div className="w-10 h-10 border border-[#E7E0D5] rounded-lg flex items-center justify-center shrink-0">
                  <Icon size={18} className="text-[#c9a96e]" />
                </div>
                <div>
                  <h3 className="font-sans text-base font-semibold text-[#1C1917] mb-1">{item.title}</h3>
                  <p className="text-sm text-[#57534E]">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>

        <SectionTitle eyebrow={t.investment.districtsEyebrow} title={t.investment.districtsTitle} />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-14">
          {t.investment.districts.map((d, i) => (
            <div key={i} className="bg-white border border-[#E7E0D5] rounded-xl p-5 text-center">
              <p className="font-sans text-lg font-semibold text-[#1C1917]">{d.name}</p>
              <p className="text-[#c9a96e] font-bold tabular-nums my-1">{d.growth}</p>
              <p className="text-xs text-[#57534E]">{d.desc}</p>
            </div>
          ))}
        </div>

        {investmentProjects.length > 0 && (
          <>
            <SectionTitle eyebrow={t.home.featuredEyebrow} title={t.home.featuredTitle} />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-14">
              {investmentProjects.map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          </>
        )}

        <div className="text-center py-8 border-t border-[#E7E0D5]">
          <h2 className="font-sans text-xl font-bold text-[#1C1917] mb-4">{t.investment.ctaTitle}</h2>
          <Link href="/contact">
            <span className="btn-outline inline-block px-8 py-3 text-sm font-semibold rounded-lg">
              {t.investment.ctaButton}
            </span>
          </Link>
        </div>
      </section>
    </main>
  );
}
