"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useI18n } from "@/lib/i18n";
import { getProjectTitle } from "@/lib/project-i18n";
import type { Project } from "@/types";

interface Props {
  projects: Project[];
  highlightId: string | null;
  centerId: string | null;
  onMarkerClick: (project: Project) => void;
  onMarkerHover: (projectId: string | null) => void;
}

function markerHtml(title: string, highlighted: boolean): string {
  const cls = highlighted ? "property-map-marker is-selected" : "property-map-marker";
  return `<div class="${cls}"><span>${title}</span></div>`;
}

export function ProjectsMapCanvas({ projects, highlightId, centerId, onMarkerClick, onMarkerHover }: Props) {
  const { lang } = useI18n();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<Map<string, L.Marker>>(new Map());
  const onClickRef = useRef(onMarkerClick);
  const onHoverRef = useRef(onMarkerHover);

  useEffect(() => {
    onClickRef.current = onMarkerClick;
    onHoverRef.current = onMarkerHover;
  });

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [40.1776, 44.5126],
      zoom: 12,
      scrollWheelZoom: true,
      zoomControl: false,
    });

    L.control.zoom({ position: "bottomright" }).addTo(map);

    L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      subdomains: "abcd",
      maxZoom: 19,
    }).addTo(map);

    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      markersRef.current.clear();
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((m) => m.remove());
    markersRef.current.clear();

    if (projects.length === 0) return;

    const bounds = L.latLngBounds([]);

    for (const project of projects) {
      const { lat, lng } = project.coordinates;
      const highlighted = project.id === highlightId;

      const icon = L.divIcon({
        className: "",
        html: markerHtml(getProjectTitle(project, lang), highlighted),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.on("click", () => onClickRef.current(project));
      marker.on("mouseover", () => onHoverRef.current(project.id));
      marker.on("mouseout", () => onHoverRef.current(null));
      markersRef.current.set(project.id, marker);
      bounds.extend([lat, lng]);
    }

    if (!centerId) {
      map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
    }
  }, [projects, highlightId, centerId, lang]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !centerId) return;
    const project = projects.find((p) => p.id === centerId);
    if (!project) return;
    map.flyTo([project.coordinates.lat, project.coordinates.lng], Math.max(map.getZoom(), 15), { duration: 0.6 });
  }, [centerId, projects]);

  return <div ref={containerRef} className="h-full w-full min-h-[320px]" />;
}
