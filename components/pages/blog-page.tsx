import { PageIntro } from "@/components/site/PageIntro";
import { Container } from "@/components/site/Container";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function BlogPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-white min-h-screen">
      <Seo title={t.seo.blog.title} description={t.seo.blog.description} path="/blog" lang={lang} />
      <PageIntro title={t.blog.title} subtitle={t.blog.subtitle} />
      <Container className="py-16 text-center max-w-lg">
        <p className="text-lg font-medium text-[#111827]">{t.blog.comingSoon}</p>
        <p className="mt-2 text-sm text-[#6B7280]">{t.blog.comingSoonDesc}</p>
      </Container>
    </main>
  );
}
