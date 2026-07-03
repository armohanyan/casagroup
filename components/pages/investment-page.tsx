import Link from "next/link";
import { PageIntro } from "@/components/site/PageIntro";
import { Container } from "@/components/site/Container";
import { ProjectCard } from "@/components/site/ProjectCard";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";
import { useProjects } from "@/lib/projects-context";

export default function InvestmentPage() {
  const { t, lang } = useI18n();
  const { projects } = useProjects();
  const picks = projects.filter((p) => p.featured).slice(0, 3);

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.investment.title} description={t.seo.investment.description} path="/investment" lang={lang} />
      <PageIntro title={t.investment.title} subtitle={t.investment.subtitle} />
      <Container className="py-10">
        <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
          {picks.map((p) => (
            <ProjectCard key={p.id} project={p} />
          ))}
        </div>
        <div className="mt-10">
          <Link href="/contact" className="inline-flex h-12 items-center px-6 rounded-lg bg-[#111827] text-white text-sm font-semibold">
            {t.investment.ctaButton}
          </Link>
        </div>
      </Container>
    </main>
  );
}
