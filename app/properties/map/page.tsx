"use client";

import { Suspense } from "react";
import PropertiesMapPage from "@/components/pages/properties-map-page";

export default function Page() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#F6F7FB]" />}>
      <PropertiesMapPage />
    </Suspense>
  );
}
