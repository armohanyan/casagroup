import type { Lang } from "@/lib/i18n";
import type { Amenity, Apartment, Project } from "@/types";

const AMENITY_LABELS_HY: Record<string, string> = {
  "Rooftop Pool": "Տանիքի լողավազան",
  "Fitness Center": "Ֆիթնես կենտրոն",
  Parking: "Կայանատեղի",
  Security: "Անվտանգություն",
  "Terrace Gardens": "Տեռասային այգիներ",
  "Smart Home": "Խելացի տուն",
  "Underground Parking": "Ստորգետնյա կայանատեղի",
  "24/7 Security": "24/7 անվտանգություն",
  "Valet Parking": "Վալետ կայանատեղի",
  Concierge: "Կոնսիերժ ծառայություն",
  "Infinity Pool": "Ինֆինիտի լողավազան",
  "Private Gardens": "Մասնավոր այգիներ",
  "Private Security": "Մասնավոր անվտանգություն",
  Pool: "Լողավազան",
  Gym: "Մարզասրահ",
  Garden: "Այգի",
  Restaurant: "Ռեստորան",
  "Wi-Fi": "Wi-Fi",
  "Լողավազան": "Լողավազան",
};

const AMENITY_LABELS_RU: Record<string, string> = {
  "Rooftop Pool": "Бассейн на крыше",
  "Fitness Center": "Фитнес-центр",
  Parking: "Парковка",
  Security: "Охрана",
  "Terrace Gardens": "Террасные сады",
  "Smart Home": "Умный дом",
  "Underground Parking": "Подземная парковка",
  "24/7 Security": "Охрана 24/7",
  "Valet Parking": "Парковка с валетом",
  Concierge: "Консьерж",
  "Infinity Pool": "Бассейн инфинити",
  "Private Gardens": "Приватные сады",
  "Private Security": "Частная охрана",
  Pool: "Бассейн",
  Gym: "Спортзал",
  Garden: "Сад",
  Restaurant: "Ресторан",
  "Wi-Fi": "Wi-Fi",
  "Լողավազան": "Бассейн",
};

const AMENITY_LABELS_EN: Record<string, string> = Object.fromEntries(
  Object.entries(AMENITY_LABELS_HY).map(([enLabel, hyLabel]) => [hyLabel, enLabel]),
);

function firstNonEmpty(...vals: Array<string | undefined | null>): string {
  for (const v of vals) {
    const trimmed = v?.trim() ?? "";
    if (trimmed) return trimmed;
  }
  return "";
}

function pick(
  en: string | undefined | null,
  hy: string | undefined | null,
  ru: string | undefined | null,
  lang: Lang,
): string {
  if (lang === "hy") return firstNonEmpty(hy, en, ru);
  if (lang === "ru") return firstNonEmpty(ru, en, hy);
  return firstNonEmpty(en, hy, ru);
}

export function getProjectTitle(project: Project, lang: Lang): string {
  return pick(project.title, project.titleHy, project.titleRu, lang);
}

export function getProjectLocation(project: Project, lang: Lang): string {
  return pick(project.location, project.locationHy, project.locationRu, lang);
}

export function getProjectCity(project: Project, lang: Lang): string {
  return pick(project.city, project.cityHy, project.cityRu, lang);
}

export function getProjectDescription(project: Project, lang: Lang): string {
  return pick(project.description, project.descriptionHy, project.descriptionRu, lang);
}

export function getProjectLongDescription(project: Project, lang: Lang): string {
  return pick(project.longDescription, project.longDescriptionHy, project.longDescriptionRu, lang);
}

export function getAmenityLabel(amenity: Amenity, lang: Lang): string {
  if (lang === "hy") {
    return amenity.labelHy?.trim() || AMENITY_LABELS_HY[amenity.label] || amenity.label;
  }
  if (lang === "ru") {
    return (
      amenity.labelRu?.trim() ||
      AMENITY_LABELS_RU[amenity.label] ||
      AMENITY_LABELS_RU[amenity.labelHy ?? ""] ||
      amenity.label?.trim() ||
      amenity.labelHy ||
      amenity.label
    );
  }
  return (
    amenity.label?.trim() ||
    AMENITY_LABELS_EN[amenity.labelHy ?? ""] ||
    AMENITY_LABELS_EN[amenity.label] ||
    amenity.labelHy ||
    amenity.label
  );
}

export function getApartmentDescription(apt: Apartment, project: Project, lang: Lang): string {
  return pick(apt.description, apt.descriptionHy, apt.descriptionRu, lang) || getProjectDescription(project, lang);
}

export function getApartmentViewType(apt: Apartment, lang: Lang): string {
  return pick(apt.viewType, apt.viewTypeHy, apt.viewTypeRu, lang);
}

export function getDroneVideoTitle(
  video: { title: string; titleHy?: string; titleRu?: string },
  lang: Lang,
): string {
  return pick(video.title, video.titleHy, video.titleRu, lang);
}

export function getCityDisplayName(city: string, projects: Project[], lang: Lang): string {
  const match = projects.find((p) => p.city === city);
  return match ? getProjectCity(match, lang) : city;
}

export function projectMatchesQuery(project: Project, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  const hay = [
    project.title,
    project.titleHy,
    project.titleRu,
    project.location,
    project.locationHy,
    project.locationRu,
    project.city,
    project.cityHy,
    project.cityRu,
    project.developer,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
