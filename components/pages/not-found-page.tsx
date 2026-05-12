import { Link, useLocation } from "wouter";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function NotFoundPage() {
  const { t, lang } = useI18n();
  const [loc] = useLocation();
  const path = loc && loc !== "*" ? loc : "/404";
  return (
    <main className="bg-[#0C1428] min-h-screen pt-32 flex flex-col items-center justify-center px-6">
      <Seo
        title={t.seo.notFound.title}
        description={t.seo.notFound.description}
        path={path}
        lang={lang}
        noindex
      />
      <p className="font-['Cormorant_Garamond'] text-5xl text-[#f0ece4] mb-4">404</p>
      <p className="text-[#9a9085] mb-10 text-center max-w-md">{t.notFound}</p>
      <Link href="/">
        <span className="text-[#c9a96e] text-sm tracking-widest uppercase cursor-pointer border border-[#c9a96e]/40 px-6 py-3 rounded-sm hover:bg-[#c9a96e]/10 transition-colors">
          {t.backHome}
        </span>
      </Link>
    </main>
  );
}
