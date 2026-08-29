import Link from "next/link";
import { useI18n } from "@/lib/i18n";

export function PartnerFooter() {
  const { t } = useI18n();

  return (
    <footer className="bg-brand text-white border-t border-white/10">
      <div className="max-w-7xl mx-auto py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <Link href="/partners" className="font-brand text-xl font-bold">
              Casa<span className="text-[#c9a96e]">Group</span>
              <span className="ml-2 text-xs text-white/50 font-normal uppercase tracking-wide">Partner</span>
            </Link>
            <p className="mt-3 text-sm text-white/55 max-w-md leading-relaxed">{t.footer.partnerPortal}</p>
          </div>
          <nav className="flex flex-wrap gap-x-6 gap-y-2 text-sm">
            <Link href="/partners/services" className="text-white/60 hover:text-[#c9a96e] transition-colors">
              {t.nav.services}
            </Link>
            <Link href="/partners#academy" className="text-white/60 hover:text-[#c9a96e] transition-colors">
              {t.nav.academy}
            </Link>
            <Link href="/partners#faq" className="text-white/60 hover:text-[#c9a96e] transition-colors">
              {t.nav.faq}
            </Link>
            <Link href="/partners#contact" className="text-white/60 hover:text-[#c9a96e] transition-colors">
              {t.nav.contact}
            </Link>
            <Link href="/" className="text-[#c9a96e] hover:text-[#e8d5b0] transition-colors font-medium">
              {t.partner.backToMain}
            </Link>
          </nav>
        </div>
        <p className="mt-8 pt-6 border-t border-white/10 text-xs text-white/40">
          © {new Date().getFullYear()} CasaGroup. {t.footer.rights}
        </p>
      </div>
    </footer>
  );
}
