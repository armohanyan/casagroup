import type { Project } from "@/types";

// ─── Mock data — replace with API calls when backend is ready ───────────────

export const MOCK_PROJECTS: Project[] = [
  {
    id: "2",
    title: "Cascade Residences",
    slug: "cascade-residences",
    location: "Tamanyan St 8, Yerevan",
    city: "Yerevan",
    description: "Contemporary luxury residences nestled beside the iconic Cascade complex.",
    longDescription:
      "Positioned steps from one of Yerevan's most celebrated cultural landmarks, Cascade Residences offers a rare combination of architectural heritage and contemporary comfort. The building's facade draws inspiration from the stepped terraces of the Cascade itself, while interiors reflect a modern minimalist sensibility.",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&q=80",
    ],
    startingPrice: 145000,
    completionDate: "Q4 2025",
    status: "Ready",
    availableApartmentsCount: 6,
    totalApartments: 28,
    floors: 16,
    developer: "CasaGroup",
    architect: "CasaGroup Architecture",
    managementCompany: "CasaGroup",
    partnerBank: "Major Armenian banks",
    constructionStart: "Q2 2025",
    exclusiveSalesRights: "CasaGroup",
    coordinates: { lat: 40.1920, lng: 44.5100 },
    tags: ["ready to move", "cultural district", "rooftop terrace"],
    droneVideos: [
      { title: "Cascade District Overview", url: "https://www.youtube.com/embed/nFm7n9B9nf0", thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80" },
    ],
    featured: true,
    amenities: [
      { icon: "Waves", label: "Rooftop Pool" },
      { icon: "Dumbbell", label: "Fitness Center" },
      { icon: "Car", label: "Parking" },
      { icon: "Shield", label: "Security" },
      { icon: "Leaf", label: "Terrace Gardens" },
      { icon: "Wifi", label: "Smart Home" },
    ],
    nearbyPlaces: [
      { name: "Cascade Complex", distance: "50m", category: "leisure" },
      { name: "Vernissage Market", distance: "400m", category: "shopping" },
      { name: "French University", distance: "600m", category: "education" },
    ],
    paymentOptions: [
      { title: "Full Payment", description: "Ready to move in immediately" },
      { title: "Mortgage", description: "Available through all major Armenian banks" },
    ],
    apartments: [
      {
        id: "apt-2-1",
        projectId: "2",
        floor: 4,
        rooms: 2,
        area: 82,
        price: 145000,
        status: "Available",
        viewType: "Cascade",
        floorPlanImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        gallery: [],
        balcony: true,
      },
      {
        id: "apt-2-2",
        projectId: "2",
        floor: 8,
        rooms: 3,
        area: 112,
        price: 225000,
        status: "Available",
        viewType: "City",
        floorPlanImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        gallery: [],
        balcony: true,
      },
      {
        id: "apt-2-3",
        projectId: "2",
        floor: 14,
        rooms: 4,
        area: 155,
        price: 380000,
        status: "Reserved",
        viewType: "Panoramic",
        floorPlanImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        gallery: [],
        balcony: true,
      },
    ],
  }
];

export const getProjectBySlug = (slug: string): Project | undefined =>
  MOCK_PROJECTS.find((p) => p.slug === slug);

export const getApartmentById = (id: string): { apartment: Apartment; project: Project } | undefined => {
  for (const project of MOCK_PROJECTS) {
    const apartment = project.apartments.find((a) => a.id === id);
    if (apartment) return { apartment, project };
  }
  return undefined;
};

// Re-export Apartment type for convenience
import type { Apartment } from "@/types";
export type { Apartment };
