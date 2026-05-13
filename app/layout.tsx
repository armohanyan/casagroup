import type { Metadata, Viewport } from "next";
import { Provider } from "@/components/provider";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "CASA GROUP — կառուցապատման նախագծերի զարգացում և վաճառք",
    template: "%s | CasaGroup",
  },
  description:
    "CASA GROUP — կառուցապատման նախագծերի զարգացման և վաճառքի ինստիտուցիոնալ հարթակ։ Նոր կառուցապատում, պրեմիում բնակարաններ և մասնագիտական ծառայություններ Հայաստանում։",
  keywords: [
    "CasaGroup",
    "Armenia real estate",
    "new construction Yerevan",
    "premium apartments",
    "residential complexes",
    "new build sales",
    "property buying",
  ],
  authors: [{ name: "CasaGroup" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  applicationName: "CasaGroup",
  appleWebApp: { title: "CasaGroup" },
  formatDetection: { telephone: false },
  openGraph: {
    siteName: "CASA GROUP",
    title: "CASA GROUP — կառուցապատման նախագծերի զարգացում և վաճառք",
    description:
      "Կառուցապատման նախագծերի զարգացման, վաճառքի և կառավարման ինստիտուցիոնալ հարթակ։ Նոր կառուցապատում և պրեմիում բնակարաններ Հայաստանում։",
    type: "website",
    locale: "hy_AM",
  },
  twitter: {
    card: "summary",
    title: "CASA GROUP — կառուցապատման նախագծերի զարգացում և վաճառք",
    description:
      "Կառուցապատման նախագծերի զարգացման, վաճառքի և կառավարման ինստիտուցիոնալ հարթակ։ Նոր կառուցապատում և պրեմիում բնակարաններ Հայաստանում։",
  },
  manifest: "/site.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#0C1428",
  colorScheme: "dark",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300&family=DM+Mono:wght@400;500&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&family=Noto+Sans+Armenian:wght@300;400;500&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        <Provider>
          <SiteChrome>{children}</SiteChrome>
        </Provider>
      </body>
    </html>
  );
}
