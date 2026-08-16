import type { Apartment, Project } from "@/types";
import { formatPrice } from "@/lib/format-price";
import { getApartmentViewType, getProjectCity, getProjectCompletionDate, getProjectLocation, getProjectTitle } from "@/lib/project-i18n";
import type { Lang } from "@/lib/i18n";

export interface ProjectInfoPdfLabels {
  title: string;
  project: string;
  location: string;
  city: string;
  status: string;
  developer: string;
  completion: string;
  floors: string;
  apartment: string;
  price: string;
  bedrooms: string;
  area: string;
  floor: string;
  view: string;
  description: string;
  generated: string;
}

interface ProjectInfoPdfInput {
  project: Project;
  apartment?: Apartment;
  statusLabel: string;
  description: string;
  labels: ProjectInfoPdfLabels;
  lang?: Lang;
}

function esc(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** Opens a print-ready document so the user can save project info as PDF. */
export function downloadProjectInfoPdf(input: ProjectInfoPdfInput): void {
  const { project, apartment, statusLabel, description, labels, lang = "hy" } = input;
  const htmlLang = lang === "en" ? "en" : lang === "ru" ? "ru" : "hy";
  const title = getProjectTitle(project, lang);
  const rows: { label: string; value: string }[] = [
    { label: labels.project, value: title },
    { label: labels.location, value: getProjectLocation(project, lang) },
    { label: labels.city, value: getProjectCity(project, lang) },
    { label: labels.status, value: statusLabel },
    { label: labels.developer, value: project.developer },
    { label: labels.completion, value: getProjectCompletionDate(project, lang) || "—" },
    { label: labels.floors, value: String(project.floors || "—") },
  ];

  if (apartment) {
    rows.push(
      { label: labels.apartment, value: `#${apartment.id}` },
      {
        label: labels.price,
        value: apartment.status === "Sold" ? "—" : formatPrice(apartment.price),
      },
      { label: labels.bedrooms, value: String(apartment.rooms) },
      { label: labels.area, value: `${apartment.area} m²` },
      { label: labels.floor, value: String(apartment.floor) },
      { label: labels.view, value: getApartmentViewType(apartment, lang) || "—" },
    );
  }

  const html = `<!DOCTYPE html>
<html lang="${htmlLang}">
<head>
  <meta charset="utf-8" />
  <title>${esc(labels.title)} — ${esc(title)}</title>
  <style>
    @page { margin: 18mm; }
    body {
      font-family: "Segoe UI", "Noto Sans Armenian", Arial, sans-serif;
      color: #0c1428;
      line-height: 1.5;
      margin: 0;
      padding: 24px;
    }
    h1 { font-size: 22px; margin: 0 0 8px; }
    .meta { color: #6b7280; font-size: 12px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th, td { text-align: left; padding: 8px 0; border-bottom: 1px solid #e5e7eb; font-size: 13px; vertical-align: top; }
    th { width: 38%; color: #6b7280; font-weight: 500; }
    .desc { font-size: 13px; white-space: pre-wrap; }
    .desc-title { font-size: 14px; font-weight: 600; margin: 0 0 8px; }
  </style>
</head>
<body>
  <h1>${esc(title)}</h1>
  <p class="meta">${esc(labels.generated)} · CasaGroup</p>
  <table>
    ${rows
      .map(
        (row) =>
          `<tr><th>${esc(row.label)}</th><td>${esc(row.value)}</td></tr>`,
      )
      .join("")}
  </table>
  ${
    description
      ? `<p class="desc-title">${esc(labels.description)}</p><p class="desc">${esc(description)}</p>`
      : ""
  }
  <script>
    window.onload = function () {
      window.focus();
      window.print();
    };
  </script>
</body>
</html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.open();
  win.document.write(html);
  win.document.close();
}
