"use client";

import { Suspense } from "react";
import PropertiesPage from "@/components/pages/properties-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F7FB]" />}>
      <PropertiesPage />
    </Suspense>
  );
}
