import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Armenian, Playfair_Display } from "next/font/google";
import { Provider } from "@/components/provider";
import { SiteChrome } from "@/components/SiteChrome";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "cyrillic"],
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

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://casagroup.am";

const DEFAULT_TITLE = "CASA GROUP — նոր բնակարաններ Երևանում կառուցապատողից";
const DEFAULT_DESCRIPTION =
  "CASA GROUP-ը օգնում է գնել նորակառույց բնակարան Երևանում՝ ստուգված նախագծեր, թափանցիկ գներ, դիտումներ և մասնագիտական աջակցություն՝ ընտրությունից մինչև գործարքի ավարտ։";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: DEFAULT_TITLE,
    template: "%s | CasaGroup",
  },
  description: DEFAULT_DESCRIPTION,
  keywords: [
    "CasaGroup",
    "նոր բնակարաններ Երևանում",
    "նորակառույց բնակարան",
    "բնակարան կառուցապատողից",
    "բնակարան գնել Երևանում",
    "apartments in Yerevan",
    "new apartments Yerevan",
    "квартиры в Ереване",
    "новостройки Ереван",
    "купить квартиру Ереван",
    "new developments Armenia",
    "buy apartment Armenia",
    "new construction apartments",
    "primary market real estate",
    "investment property Armenia",
    "premium apartments Armenia",
  ],
  authors: [{ name: "CasaGroup" }],
  robots: "index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1",
  applicationName: "CasaGroup",
  appleWebApp: { title: "CasaGroup" },
  formatDetection: { telephone: false },
  alternates: { canonical: "/" },
  openGraph: {
    siteName: "CasaGroup",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    type: "website",
    locale: "hy_AM",
    url: "/",
    images: [{ url: "/yerevan.png", width: 1536, height: 1024, alt: "CasaGroup — Yerevan" }],
  },
  twitter: {
    card: "summary_large_image",
    title: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    images: ["/yerevan.png"],
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
