"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { addBasemapLayer } from "@/components/site/map-style";
import type { Project } from "@/types";

interface Props {
  projects: Project[];
  selectedId: string | null;
  onSelect: (project: Project) => void;
}

function markerHtml(selected: boolean): string {
  return `<div class="property-map-marker${selected ? " is-selected" : ""}"><span>●</span></div>`;
}

export function HomeMapCanvas({ projects, selectedId, onSelect }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const onSelectRef = useRef(onSelect);

  useEffect(() => {
    onSelectRef.current = onSelect;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40.1776, 44.5126],
      zoom: 12,
      scrollWheelZoom: false,
    });

    addBasemapLayer(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    if (projects.length === 0) return;

    const bounds = L.latLngBounds([]);

    for (const project of projects) {
      const { lat, lng } = project.coordinates;
      const selected = project.id === selectedId;

      const icon = L.divIcon({
        className: "",
        html: markerHtml(selected),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.on("click", () => onSelectRef.current(project));
      marker.on("mouseover", () => onSelectRef.current(project));
      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    }

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [projects, selectedId]);

  return <div ref={containerRef} className="h-full w-full" />;
}
