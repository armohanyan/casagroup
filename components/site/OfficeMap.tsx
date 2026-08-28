"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { addBasemapLayer, brandMarkerIcon } from "@/components/site/map-style";

/** Sayat-Nova Ave 40, Yerevan (OSM way 472376826) */
const OFFICE = { lat: 40.17731, lng: 44.52626 };

export function OfficeMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { center: [OFFICE.lat, OFFICE.lng], zoom: 15, scrollWheelZoom: false });
    addBasemapLayer(map);
    L.marker([OFFICE.lat, OFFICE.lng], { icon: brandMarkerIcon() })
      .addTo(map)
      .bindPopup("CasaGroup — Սայաթ-Նովա 40");
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={ref} className="h-full w-full min-h-[224px]" />;
}
