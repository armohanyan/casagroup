import Link from "next/link";
import { Building2, Home, Calculator, Phone } from "lucide-react";
import { useI18n } from "@/lib/i18n";

const ICONS = [Home, Building2, Calculator, Phone];

export function QuickAccess() {
  const { t } = useI18n();

  const links = [
    { href: "/properties", label: t.nav.properties, icon: ICONS[0] },
    { href: "/projects", label: t.nav.developments, icon: ICONS[1] },
    { href: "/calculator", label: t.nav.calculator, icon: ICONS[2] },
    { href: "/contact", label: t.nav.contact, icon: ICONS[3] },
  ];

  return (
    <div className="flex flex-wrap gap-2">
      {links.map(({ href, label, icon: Icon }) => (
        <Link
          key={href}
          href={href}
          className="btn-outline inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-brand shadow-sm shadow-black/[0.03]"
        >
          <Icon size={15} className="shrink-0 text-[#c9a96e]" aria-hidden />
          {label}
        </Link>
      ))}
    </div>
  );
}
