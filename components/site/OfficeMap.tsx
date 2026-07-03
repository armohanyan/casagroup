"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const OFFICE = { lat: 40.1776, lng: 44.5126 };

export function OfficeMap() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { center: [OFFICE.lat, OFFICE.lng], zoom: 15, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.marker([OFFICE.lat, OFFICE.lng]).addTo(map);
    return () => {
      map.remove();
    };
  }, []);

  return <div ref={ref} className="h-full w-full min-h-[224px]" />;
}
