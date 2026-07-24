import Link from "next/link";
import type { ReactNode } from "react";

interface Crumb {
  label: string;
  href?: string;
}

interface Props {
  title: string;
  description?: string;
  breadcrumbs?: Crumb[];
  actions?: ReactNode;
}

export function AdminPageHeader({ title, description, breadcrumbs, actions }: Props) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:mb-8 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0">
        {breadcrumbs && breadcrumbs.length > 0 && (
          <nav className="mb-2 flex flex-wrap items-center gap-1.5 text-xs text-[#9CA3AF]">
            {breadcrumbs.map((c, i) => (
              <span key={`${c.label}-${i}`} className="inline-flex items-center gap-1.5">
                {i > 0 && <span>/</span>}
                {c.href ? (
                  <Link href={c.href} className="hover:text-[#0c1428] transition-colors">
                    {c.label}
                  </Link>
                ) : (
                  <span className="text-[#6B7280]">{c.label}</span>
                )}
              </span>
            ))}
          </nav>
        )}
        <h1 className="font-display text-2xl tracking-tight text-[#0c1428] sm:text-3xl">{title}</h1>
        {description ? (
          <p className="mt-1.5 max-w-2xl text-sm text-[#6B7280] leading-relaxed">{description}</p>
        ) : null}
      </div>
      {actions ? <div className="flex flex-wrap items-center gap-2 shrink-0">{actions}</div> : null}
    </div>
  );
}
