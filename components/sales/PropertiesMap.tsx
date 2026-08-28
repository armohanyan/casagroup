"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { addBasemapLayer } from "@/components/site/map-style";
import { formatPrice } from "@/lib/format-price";
import { getMarkerCoords } from "@/lib/map-coords";
import type { PropertyListing } from "@/lib/properties";

interface Props {
  listings: PropertyListing[];
  selectedId: string | null;
  onSelect: (apartmentId: string) => void;
}

function priceMarkerHtml(price: number, selected: boolean): string {
  const label = formatPrice(price);
  return `<div class="property-map-marker${selected ? " is-selected" : ""}"><span>${label}</span></div>`;
}

export function PropertiesMap({ listings, selectedId, onSelect }: Props) {
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
      scrollWheelZoom: true,
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

    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (listings.length === 0) return;

    const bounds = L.latLngBounds([]);

    for (const listing of listings) {
      const { lat, lng } = getMarkerCoords(listing);
      const id = listing.apartment.id;
      const selected = id === selectedId;

      const icon = L.divIcon({
        className: "",
        html: priceMarkerHtml(listing.apartment.price, selected),
        iconSize: [0, 0],
        iconAnchor: [0, 0],
      });

      const marker = L.marker([lat, lng], { icon }).addTo(map);
      marker.on("click", () => onSelectRef.current(id));
      markersRef.current.push(marker);
      bounds.extend([lat, lng]);
    }

    map.fitBounds(bounds, { padding: [48, 48], maxZoom: 14 });
  }, [listings, selectedId]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map || !selectedId) return;

    const listing = listings.find((item) => item.apartment.id === selectedId);
    if (!listing) return;

    const { lat, lng } = getMarkerCoords(listing);
    map.flyTo([lat, lng], Math.max(map.getZoom(), 14), { duration: 0.45 });
  }, [selectedId, listings]);

  return <div ref={containerRef} className="h-full w-full min-h-[320px]" />;
}
