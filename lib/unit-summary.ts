import type { Lang } from "@/lib/i18n";

export function formatUnitLine(
  lang: Lang,
  entrance: number,
  floor: number,
  area: number,
  rooms: number,
  options?: { isHouse?: boolean; landArea?: number },
): string {
  if (options?.isHouse) {
    const land = options.landArea && options.landArea > 0 ? options.landArea : undefined;
    if (lang === "hy") {
      return land
        ? `${area} քմ | հող ${land} քմ | ${rooms} սենյակ`
        : `${area} քմ | ${rooms} սենյակ`;
    }
    if (lang === "ru") {
      return land
        ? `${area} м² | участок ${land} м² | ${rooms} комн.`
        : `${area} м² | ${rooms} комн.`;
    }
    return land
      ? `${area} m² | land ${land} m² | ${rooms} rooms`
      : `${area} m² | ${rooms} rooms`;
  }

  if (lang === "hy") {
    return `${entrance} մուտք | ${floor} հարկ | ${area} քմ | ${rooms} սենյակ`;
  }
  if (lang === "ru") {
    return `${entrance} подъезд | ${floor} этаж | ${area} м² | ${rooms} комн.`;
  }
  return `Entrance ${entrance} | Floor ${floor} | ${area} m² | ${rooms} rooms`;
}
