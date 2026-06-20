import { BookOpen } from "lucide-react";
import { PageHero } from "@/components/sales/PageHero";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function BlogPage() {
  const { t, lang } = useI18n();

  return (
    <main className="bg-[#F6F7FB] min-h-screen">
      <Seo title={t.seo.blog.title} description={t.seo.blog.description} path="/blog" lang={lang} />

      <PageHero title={t.blog.title} subtitle={t.blog.subtitle} />

      <section className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-wrap gap-2 mb-10">
          {t.blog.categories.map((cat) => (
            <span
              key={cat}
              className="text-xs font-medium text-[#57534E] border border-[#E7E0D5] bg-white rounded-full px-3 py-1.5"
            >
              {cat}
            </span>
          ))}
        </div>

        <div className="max-w-xl mx-auto text-center py-16 border border-dashed border-[#E7E0D5] rounded-xl bg-white">
          <BookOpen size={36} className="text-[#c9a96e]/50 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-[#1C1917]">{t.blog.comingSoon}</h2>
          <p className="mt-2 text-sm text-[#57534E]">{t.blog.comingSoonDesc}</p>
        </div>
      </section>
    </main>
  );
}
