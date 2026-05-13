"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { GlobalJsonLd } from "@/components/seo/GlobalJsonLd";

const ADMIN_PREFIX = "/admin-lx9k2m";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname === ADMIN_PREFIX || pathname.startsWith(`${ADMIN_PREFIX}/`);
  if (isAdmin) return <>{children}</>;
  return (
    <>
      <GlobalJsonLd />
      <Navbar />
      {children}
      <Footer />
    </>
  );
}
