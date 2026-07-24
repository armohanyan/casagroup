"use client";

import type { ReactNode } from "react";
import { PartnerNavbar } from "@/components/partner/PartnerNavbar";
import { PartnerFooter } from "@/components/partner/PartnerFooter";

export function PartnerChrome({ children }: { children: ReactNode }) {
  return (
    <>
      <PartnerNavbar />
      {children}
      <PartnerFooter />
    </>
  );
}
