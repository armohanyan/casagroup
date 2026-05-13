import Link from "next/link";
import { Phone, Mail, MapPin, Instagram, Facebook, Linkedin } from "lucide-react";
import { useI18n } from "@/lib/i18n";

export function Footer() {
  const { t } = useI18n();
  const navLinks = [
    { label: t.footer.links.home, href: "/" },
    { label: t.footer.links.about, href: "/about" },
    { label: t.footer.links.services, href: "/services" },
    { label: t.footer.links.projects, href: "/projects" },
    { label: t.footer.links.academy, href: "/#academy" },
    { label: t.footer.links.faq, href: "/#faq" },
    { label: t.footer.links.contact, href: "/contact" },
  ];

  return (
    <footer className="bg-[#060d1a] border-t border-[#2a2520]">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-20">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/">
              <span className="font-['Cormorant_Garamond'] text-3xl font-light tracking-widest text-[#f0ece4] cursor-pointer">
                Casa<span className="text-[#c9a96e]">Group</span>
              </span>
            </Link>
            <p className="mt-5 text-[#9a9085] font-light leading-relaxed max-w-sm text-sm">
              {t.footer.tagline}
            </p>
            <div className="flex gap-4 mt-8">
              {[Instagram, Facebook, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-10 h-10 border border-[#2a2520] flex items-center justify-center text-[#9a9085] hover:border-[#c9a96e] hover:text-[#c9a96e] transition-all rounded-sm"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </div>

          {/* Navigation */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#c9a96e] mb-6 font-medium">{t.footer.navigation}</p>
            <nav className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <span className="text-sm text-[#9a9085] hover:text-[#f0ece4] transition-colors cursor-pointer">
                    {link.label}
                  </span>
                </Link>
              ))}
            </nav>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs tracking-[0.25em] uppercase text-[#c9a96e] mb-6 font-medium">{t.footer.contact}</p>
            <div className="flex flex-col gap-4">
              <a href="tel:+37496799733" className="flex items-center gap-3 text-sm text-[#9a9085] hover:text-[#f0ece4] transition-colors group">
                <Phone size={14} className="text-[#c9a96e]" />
                +374 96 799733
              </a>
              <a href="mailto:casagroup@gmail.com" className="flex items-center gap-3 text-sm text-[#9a9085] hover:text-[#f0ece4] transition-colors group">
                <Mail size={14} className="text-[#c9a96e]" />
                casagroup@gmail.com
              </a>
              <div className="flex items-start gap-3 text-sm text-[#9a9085]">
                <MapPin size={14} className="text-[#c9a96e] mt-0.5 shrink-0" />
                <span className="leading-relaxed break-words">{t.contact.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-[#2a2520] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[#5a554f] text-center md:text-left">
            © {new Date().getFullYear()} CasaGroup. {t.footer.rights}{" "}
            <span className="text-[#5a554f]/80">{t.footer.thankYou}</span>
          </p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-[#5a554f] hover:text-[#9a9085] transition-colors">{t.footer.privacy}</a>
            <a href="#" className="text-xs text-[#5a554f] hover:text-[#9a9085] transition-colors">{t.footer.terms}</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
