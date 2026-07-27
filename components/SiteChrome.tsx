"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { PartnerChrome } from "@/components/partner/PartnerChrome";
import { StickyCallButton } from "@/components/site/StickyCallButton";
import { WhatsAppButton } from "@/components/WhatsAppButton";
import { ConsultationModal } from "@/components/ConsultationModal";
import { ConsultationModalProvider } from "@/lib/consultation-modal";
import { GlobalJsonLd } from "@/components/seo/GlobalJsonLd";
import { isPartnerPortalPath } from "@/lib/partner-portal";

const ADMIN_PREFIX = "/admin-lx9k2m";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  if (isAdmin) return <>{children}</>;

  if (isPartnerPortalPath(pathname)) {
    return <PartnerChrome>{children}</PartnerChrome>;
  }

  return (
    <ConsultationModalProvider>
      <GlobalJsonLd />
      <Navbar />
      {children}
      <Footer />
      <StickyCallButton />
      <WhatsAppButton />
      <ConsultationModal />
    </ConsultationModalProvider>
  );
}
