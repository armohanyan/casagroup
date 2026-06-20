import Link from "next/link";
import { usePathname } from "next/navigation";
import { Seo } from "@/components/seo/Seo";
import { useI18n } from "@/lib/i18n";

export default function NotFoundPage() {
  const { t, lang } = useI18n();
  const pathname = usePathname();
  const path = pathname && pathname !== "" ? pathname : "/404";
  return (
    <main className="bg-[#FAF8F5] min-h-screen pt-32 flex flex-col items-center justify-center px-6">
      <Seo
        title={t.seo.notFound.title}
        description={t.seo.notFound.description}
        path={path}
        lang={lang}
        noindex
      />
      <p className="font-sans font-semibold text-5xl text-[#1C1917] mb-4">404</p>
      <p className="text-[#57534E] mb-10 text-center max-w-md">{t.notFound}</p>
      <Link href="/">
        <span className="btn-outline text-sm tracking-widest uppercase cursor-pointer px-6 py-3 rounded-sm">
          {t.backHome}
        </span>
      </Link>
    </main>
  );
}
