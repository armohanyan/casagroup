"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { TILE_URL, TILE_ATTRIBUTION, brandMarkerIcon } from "@/components/site/map-style";

interface Props {
  lat: number;
  lng: number;
  title: string;
  scrollWheelZoom?: boolean;
}

export function ProjectMap({ lat, lng, title, scrollWheelZoom = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const map = L.map(el, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom,
    });

    L.tileLayer(TILE_URL, { attribution: TILE_ATTRIBUTION }).addTo(map);

    L.marker([lat, lng], { icon: brandMarkerIcon() }).addTo(map).bindPopup(title);

    const invalidate = () => map.invalidateSize({ animate: false });
    const timers = [0, 50, 150, 300].map((ms) => window.setTimeout(invalidate, ms));

    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(invalidate) : null;
    ro?.observe(el);
    window.addEventListener("resize", invalidate);

    return () => {
      timers.forEach(clearTimeout);
      ro?.disconnect();
      window.removeEventListener("resize", invalidate);
      map.remove();
    };
  }, [lat, lng, title, scrollWheelZoom]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}
