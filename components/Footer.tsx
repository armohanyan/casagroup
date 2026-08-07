import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { useI18n } from "@/lib/i18n";
import { Container } from "@/components/site/Container";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="bg-white border-t border-[#E5E7EB] py-10 md:py-12">
      <Container>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-8">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="text-lg font-semibold text-[#0c1428]">
              Casa<span className="text-[#c9a96e]">Group</span>
            </Link>
            <div className="flex gap-3 mt-4">
              {[Instagram, Facebook].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 flex items-center justify-center rounded-lg border border-[#E5E7EB] text-[#6B7280] hover:text-[#0c1428]"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          <nav className="flex flex-col gap-2 text-sm text-[#6B7280]">
            <Link href="/projects" className="hover:text-[#0c1428]">{t.nav.projects}</Link>
            <Link href="/about" className="hover:text-[#0c1428]">{t.nav.about}</Link>
            <Link href="/faq" className="hover:text-[#0c1428]">{t.nav.faq}</Link>
            <Link href="/contact" className="hover:text-[#0c1428]">{t.nav.contact}</Link>
          </nav>

          <div className="space-y-2 text-sm text-[#6B7280]">
            <a href="tel:+37496799733" className="flex items-center gap-2 hover:text-[#0c1428]">
              <Phone size={14} className="shrink-0" /> +374 96 799733
            </a>
            <a href="mailto:info@casagroup.am" className="flex items-start gap-2 hover:text-[#0c1428] break-all">
              <Mail size={14} className="shrink-0 mt-0.5" /> info@casagroup.am
            </a>
            <p className="flex items-start gap-2">
              <MapPin size={14} className="shrink-0 mt-0.5" />
              {t.contact.address}
            </p>
          </div>
        </div>

        <p className="mt-8 pt-6 border-t border-[#E5E7EB] text-xs text-[#9CA3AF]">
          © {new Date().getFullYear()} CasaGroup. {t.footer.rights}
        </p>
      </Container>
    </footer>
  );
}
