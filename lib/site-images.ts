/** Curated real-estate imagery — premium, non-generic stock. */
export const siteImages = {
  hero: {
    home: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=90&auto=format&fit=crop",
    properties: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=1920&q=85&auto=format&fit=crop",
    projects: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1920&q=85&auto=format&fit=crop",
    investment: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=85&auto=format&fit=crop",
    calculator: "https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=1920&q=85&auto=format&fit=crop",
    contact: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=1920&q=85&auto=format&fit=crop",
    about: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=85&auto=format&fit=crop",
    faq: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=1920&q=85&auto=format&fit=crop",
    blog: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1920&q=85&auto=format&fit=crop",
    default: "/yerevan.png",
  },
  lifestyle: {
    family: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80&auto=format&fit=crop",
    interior: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80&auto=format&fit=crop",
    cityscape: "https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&q=80&auto=format&fit=crop",
    building: "https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&q=80&auto=format&fit=crop",
  },
  empty: {
    noResults: "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=600&q=80&auto=format&fit=crop",
    noImages: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=600&q=80&auto=format&fit=crop",
  },
} as const;

/** Fallback homepage slider images when the API has not loaded yet. */
export const DEFAULT_HERO_SLIDES = [
  siteImages.hero.home,
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1920&q=90&auto=format&fit=crop",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1920&q=90&auto=format&fit=crop",
] as const;

export function getHeroImage(pathname: string): string {
  if (pathname === "/") return siteImages.hero.home;
  if (pathname.startsWith("/properties")) return siteImages.hero.properties;
  if (pathname.startsWith("/projects")) return siteImages.hero.projects;
  if (pathname === "/investment") return siteImages.hero.investment;
  if (pathname === "/calculator") return siteImages.hero.calculator;
  if (pathname === "/contact") return siteImages.hero.contact;
  if (pathname === "/about") return siteImages.hero.about;
  if (pathname === "/faq") return siteImages.hero.faq;
  if (pathname === "/blog") return siteImages.hero.blog;
  return siteImages.hero.default;
}
