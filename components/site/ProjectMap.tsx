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
    const el = ref.current;
    if (!el) return;

    const map = L.map(el, {
      center: [lat, lng],
      zoom: 15,
      scrollWheelZoom: false,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    L.marker([lat, lng]).addTo(map).bindPopup(title);

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
  }, [lat, lng, title]);

  return <div ref={ref} className="absolute inset-0 h-full w-full" />;
}
