import L from "leaflet";

/** Free OpenStreetMap basemap — no API key required. */
export const TILE_URL = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
export const TILE_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

export const TILE_OPTIONS: L.TileLayerOptions = {
  attribution: TILE_ATTRIBUTION,
  maxZoom: 19,
};

export function addBasemapLayer(map: L.Map): L.TileLayer {
  return L.tileLayer(TILE_URL, TILE_OPTIONS).addTo(map);
}

/** Branded navy/gold pin. Replaces default Leaflet marker whose image assets break under bundlers. */
export function brandMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: `<svg width="38" height="48" viewBox="0 0 38 48" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter:drop-shadow(0 3px 6px rgba(12,20,40,0.35))">
      <path d="M19 2C10.16 2 3 9.16 3 18c0 11.25 16 28 16 28s16-16.75 16-28C35 9.16 27.84 2 19 2z" fill="#0c1428" stroke="#ffffff" stroke-width="2"/>
      <circle cx="19" cy="18" r="6.5" fill="#c9a96e"/>
    </svg>`,
    iconSize: [38, 48],
    iconAnchor: [19, 46],
    popupAnchor: [0, -42],
  });
}
