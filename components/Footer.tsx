import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-brand text-white">
      <div className="max-w-[1320px] mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          <div className="lg:col-span-1">
            <Link href="/">
              <span className="text-2xl font-bold">
                Casa<span className="text-[#c9a96e]">Group</span>
              </span>
            </Link>
            <p className="mt-4 text-sm text-white/60 leading-relaxed">{t.footer.tagline}</p>
            <div className="flex gap-3 mt-6">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a key={i} href="#" className="w-9 h-9 flex items-center justify-center rounded border border-white/20 text-white/60 hover:border-[#c9a96e] hover:text-[#c9a96e] transition-colors">
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#c9a96e] mb-4">{t.sales.realty}</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/properties" className="text-sm text-white/60 hover:text-white transition-colors">{t.sales.realtyBuy}</Link>
              <Link href="/projects" className="text-sm text-white/60 hover:text-white transition-colors">{t.sales.realtyDevelopments}</Link>
              <Link href="/calculator" className="text-sm text-white/60 hover:text-white transition-colors">{t.sales.realtyCalculator}</Link>
              <Link href="/investment" className="text-sm text-white/60 hover:text-white transition-colors">{t.nav.investment}</Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#c9a96e] mb-4">{t.sales.aboutMenu}</p>
            <nav className="flex flex-col gap-2.5">
              <Link href="/about" className="text-sm text-white/60 hover:text-white transition-colors">{t.footer.links.about}</Link>
              <Link href="/blog" className="text-sm text-white/60 hover:text-white transition-colors">{t.footer.links.blog}</Link>
              <Link href="/contact" className="text-sm text-white/60 hover:text-white transition-colors">{t.nav.contact}</Link>
              <Link href="/partners" className="text-sm text-white/60 hover:text-white transition-colors">{t.footer.links.partner}</Link>
            </nav>
          </div>

          <div>
            <p className="text-sm font-semibold text-[#c9a96e] mb-4">{t.footer.contact}</p>
            <div className="flex flex-col gap-3">
              <a href="tel:+37496799733" className="flex items-center gap-2 text-sm text-white/60 hover:text-[#c9a96e] transition-colors">
                <Phone size={14} className="text-[#c9a96e] shrink-0" />
                +374 96 799733
              </a>
              <a href="mailto:casagroup@gmail.com" className="flex items-center gap-2 text-sm text-white/60 hover:text-[#c9a96e] transition-colors">
                <Mail size={14} className="text-[#c9a96e] shrink-0" />
                casagroup@gmail.com
              </a>
              <div className="flex items-start gap-2 text-sm text-white/60">
                <MapPin size={14} className="text-[#c9a96e] shrink-0 mt-0.5" />
                <span>{t.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/40">
          <p>© {new Date().getFullYear()} CasaGroup. {t.footer.rights}</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-white/70 transition-colors">{t.footer.privacy}</a>
            <a href="#" className="hover:text-white/70 transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
