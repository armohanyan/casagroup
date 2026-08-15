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

const AMENITY_LABELS_EN: Record<string, string> = Object.fromEntries(
  Object.entries(AMENITY_LABELS_HY).map(([enLabel, hyLabel]) => [hyLabel, enLabel]),
);

function pick(en: string | undefined | null, hy: string | undefined | null, lang: Lang): string {
  const enVal = en?.trim() ?? "";
  const hyVal = hy?.trim() ?? "";
  if (lang === "hy") return hyVal || enVal;
  return enVal || hyVal;
}

export function getProjectTitle(project: Project, lang: Lang): string {
  return pick(project.title, project.titleHy, lang);
}

export function getProjectLocation(project: Project, lang: Lang): string {
  return pick(project.location, project.locationHy, lang);
}

export function getProjectCity(project: Project, lang: Lang): string {
  return pick(project.city, project.cityHy, lang);
}

export function getProjectDescription(project: Project, lang: Lang): string {
  return pick(project.description, project.descriptionHy, lang);
}

export function getProjectLongDescription(project: Project, lang: Lang): string {
  return pick(project.longDescription, project.longDescriptionHy, lang);
}

export function getAmenityLabel(amenity: Amenity, lang: Lang): string {
  if (lang === "hy") {
    return amenity.labelHy?.trim() || AMENITY_LABELS_HY[amenity.label] || amenity.label;
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
  return pick(apt.description, apt.descriptionHy, lang) || getProjectDescription(project, lang);
}

export function getApartmentViewType(apt: Apartment, lang: Lang): string {
  return pick(apt.viewType, apt.viewTypeHy, lang);
}

export function getDroneVideoTitle(video: { title: string; titleHy?: string }, lang: Lang): string {
  return pick(video.title, video.titleHy, lang);
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
    project.location,
    project.locationHy,
    project.city,
    project.cityHy,
    project.developer,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
  return hay.includes(q);
}
