import L from "leaflet";

/** Brand pin using CSS (avoids broken Leaflet default icon asset paths in Next.js). */
export function createMapPinIcon(): L.DivIcon {
  return L.divIcon({
    className: "",
    html: '<div class="project-map-pin"><span></span></div>',
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}
