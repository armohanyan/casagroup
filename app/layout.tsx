import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import { Cormorant_Garamond, DM_Sans, Noto_Sans_Armenian } from "next/font/google";
import { GoogleAnalytics } from "@/components/analytics/GoogleAnalytics";
import { Provider } from "@/components/provider";
import { SiteChrome } from "@/components/SiteChrome";
import { LANG_COOKIE, resolveLang } from "@/lib/i18n-config";
import "./globals.css";

const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext", "cyrillic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-dm-sans",
  display: "swap",
});

const notoArmenian = Noto_Sans_Armenian({
  subsets: ["armenian"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-armenian",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") ?? "https://casagroup.am";

const DEFAULT_TITLE = "CASA GROUP - նոր բնակարաններ Երևանում կառուցապատողից";
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
    images: [{ url: "/yerevan.png", width: 1536, height: 1024, alt: "CasaGroup - Yerevan" }],
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

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const lang = resolveLang(cookieStore.get(LANG_COOKIE)?.value);

  return (
    <html
      lang={lang}
      suppressHydrationWarning
      className={`${cormorant.variable} ${dmSans.variable} ${notoArmenian.variable}`}
    >
      <body>
        <GoogleAnalytics />
        <Provider initialLang={lang}>
          <SiteChrome>{children}</SiteChrome>
        </Provider>
      </body>
    </html>
  );
}
