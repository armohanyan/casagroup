import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Armenian, Playfair_Display } from "next/font/google";
import { Provider } from "@/components/provider";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-armenian",
  display: "swap",
});

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
  themeColor: "#FAF8F5",
  colorScheme: "light",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="hy" suppressHydrationWarning className={`${inter.variable} ${notoArmenian.variable} ${playfair.variable}`}>
      <body>
        <Provider>
          <SiteChrome>{children}</SiteChrome>
        </Provider>
      </body>
    </html>
  );
}
