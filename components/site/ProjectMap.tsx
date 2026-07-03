"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

interface Props {
  lat: number;
  lng: number;
  title: string;
}

export function ProjectMap({ lat, lng, title }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const map = L.map(ref.current, { center: [lat, lng], zoom: 15, scrollWheelZoom: false });
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);
    L.marker([lat, lng]).addTo(map).bindPopup(title);
    return () => {
      map.remove();
    };
  }, [lat, lng, title]);

  return <div ref={ref} className="h-full w-full min-h-[256px]" />;
}
