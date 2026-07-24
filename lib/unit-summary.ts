import type { Lang } from "@/lib/i18n";

export function formatUnitLine(
  lang: Lang,
  entrance: number,
  floor: number,
  area: number,
  rooms: number,
): string {
  if (lang === "hy") {
    return `${entrance} մուտք | ${floor} հարկ | ${area} քմ | ${rooms} սենյակ`;
  }
  return `Entrance ${entrance} | Floor ${floor} | ${area} m² | ${rooms} rooms`;
}
