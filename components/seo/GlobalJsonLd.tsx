import { JsonLd } from "@/components/seo/JsonLd";
import { SITE_NAME, getSiteUrl } from "@/lib/site-config";
import { useI18n } from "@/lib/i18n";

/** Organization + WebSite schema for every public page (admin should not render this). */
export function GlobalJsonLd() {
  const { t } = useI18n();
  const url = getSiteUrl();

  const organization = {
    "@context": "https://schema.org",
    "@type": ["Organization", "RealEstateAgent"],
    "@id": `${url}/#organization`,
    name: SITE_NAME,
    url,
    description: t.schema.organizationDescription,
    telephone: "+37496799733",
    email: "info@casagroup.am",
    areaServed: { "@type": "Country", name: "Armenia" },
    address: {
      "@type": "PostalAddress",
      streetAddress: "Sayat-Nova 40",
      addressLocality: "Yerevan",
      addressCountry: "AM",
    },
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "sales",
      telephone: "+37496799733",
      email: "info@casagroup.am",
      availableLanguage: ["hy", "en", "ru"],
    },
  };

  const website = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${url}/#website`,
    name: SITE_NAME,
    url,
    publisher: { "@id": `${url}/#organization` },
    inLanguage: ["hy-AM", "ru-RU", "en-US"],
  };

  return <JsonLd data={[organization, website]} />;
}
