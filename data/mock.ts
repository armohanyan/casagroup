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
    descriptionHy: "Ժամանակակից շքեղ բնակարաններ՝ Կասկադ համալիրի կողքին։",
    longDescription:
      "Positioned steps from one of Yerevan's most celebrated cultural landmarks, Cascade Residences offers a rare combination of architectural heritage and contemporary comfort. The building's facade draws inspiration from the stepped terraces of the Cascade itself, while interiors reflect a modern minimalist sensibility.",
    longDescriptionHy:
      "Երևանի ամենահայտնի մշակութային կոթողներից մեկի կողքին՝ Cascade Residences-ը համատեղում է ճարտարապետական ժառանգությունը և ժամանակակից հարմարավետությունը։ Շենքի ճակատը ոգեշնչված է Կասկադի աստիճանաձև տեռասներից, իսկ ինտերիերը արտացոլում է ժամանակակից մինիմալիստական ոճը։",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&q=80",
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85", category: "entrance" },
      { url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1400&q=85", category: "lobby" },
      { url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1400&q=85", category: "lobby" },
      { url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1400&q=85", category: "parking" },
      { url: "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1400&q=85", category: "green" },
      { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85", category: "rooftop" },
      { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85", category: "construction" },
      { url: "https://images.unsplash.com/photo-1477959854737-0bf3c97c3b63?w=1400&q=85", category: "drone" },
      { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=85", category: "night" },
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
    buildings: [
      { id: "bldg-2-a", projectId: "2", name: "4A", sortOrder: 0, floors: [] },
      { id: "bldg-2-b", projectId: "2", name: "5A", sortOrder: 1, floors: [] },
    ],
    apartments: [
      {
        id: "apt-2-1",
        projectId: "2",
        buildingId: "bldg-2-a",
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
        buildingId: "bldg-2-b",
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
        buildingId: "bldg-2-a",
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
  },
  {
    id: "3",
    title: "Arabkir Heights",
    slug: "arabkir-heights",
    location: "Komitas Ave 42, Yerevan",
    city: "Yerevan",
    description: "Elevated living in one of Yerevan's most sought-after residential districts.",
    descriptionHy: "Բարձրակարգ կյանք Երևանի ամենապահանջված բնակելի թաղամասերից մեկում։",
    longDescription:
      "Arabkir Heights offers panoramic city views from a prime hillside location. Contemporary architecture meets family-friendly design with generous layouts and premium finishes throughout.",
    longDescriptionHy:
      "Arabkir Heights-ը առաջարկում է համայնապատկերային տեսարաններ քաղաքի վրա՝ բլրի վրա գտնվող հարմարավետ վայրից։ Ժամանակակից ճարտարապետությունը համատեղվում է ընտանեկան դիզայնի հետ՝ ընդարձակ հատակագծերով և պրեմիում հարդարանքով։",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    ],
    startingPrice: 185000,
    completionDate: "Q2 2027",
    status: "Under Construction",
    availableApartmentsCount: 24,
    totalApartments: 64,
    floors: 18,
    developer: "CasaGroup",
    architect: "CasaGroup Architecture",
    coordinates: { lat: 40.2050, lng: 44.5180 },
    tags: ["panoramic views", "family living"],
    featured: true,
    amenities: [
      { icon: "Car", label: "Underground Parking" },
      { icon: "Dumbbell", label: "Fitness Center" },
      { icon: "Shield", label: "24/7 Security" },
    ],
    nearbyPlaces: [
      { name: "Komitas Metro", distance: "300m", category: "transport" },
      { name: "Arabkir Park", distance: "500m", category: "leisure" },
    ],
    paymentOptions: [
      { title: "Installment Plan", description: "Flexible payment schedule during construction" },
    ],
    buildings: [],
    apartments: [
      {
        id: "apt-3-1",
        projectId: "3",
        floor: 6,
        rooms: 2,
        area: 78,
        price: 185000,
        status: "Available",
        viewType: "City",
        floorPlanImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        gallery: [],
        balcony: true,
      },
    ],
  },
  {
    id: "4",
    title: "Northern Residences",
    slug: "northern-residences",
    location: "Azatutyan Ave 12, Yerevan",
    city: "Yerevan",
    description: "Move-in ready luxury apartments in the prestigious Northern Avenue district.",
    descriptionHy: "Պատրաստ շքեղ բնակարաններ Հյուսիսային պողոտայի հեղինակավոր թաղամասում։",
    longDescription:
      "Northern Residences delivers turnkey luxury in the heart of Yerevan's most vibrant neighborhood. Walk to cafes, galleries, and the city's finest dining.",
    longDescriptionHy:
      "Northern Residences-ը տրամադրում է պատրաստ շքեղություն Երևանի ամենակենսունակ թաղամասի սրտում։ Քայլելու հեռավորության վրա՝ սրճարաններ, պատկերասրահներ և քաղաքի լավագույն ռեստորաններ։",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    ],
    startingPrice: 320000,
    completionDate: "Q1 2026",
    status: "Ready",
    availableApartmentsCount: 4,
    totalApartments: 32,
    floors: 12,
    developer: "CasaGroup",
    coordinates: { lat: 40.1810, lng: 44.5140 },
    tags: ["ready to move", "city center"],
    featured: true,
    amenities: [
      { icon: "Wifi", label: "Smart Home" },
      { icon: "Car", label: "Valet Parking" },
      { icon: "Shield", label: "Concierge" },
    ],
    nearbyPlaces: [
      { name: "Northern Avenue", distance: "100m", category: "shopping" },
      { name: "Opera House", distance: "800m", category: "leisure" },
    ],
    paymentOptions: [
      { title: "Full Payment", description: "Immediate move-in available" },
    ],
    buildings: [],
    apartments: [
      {
        id: "apt-4-1",
        projectId: "4",
        floor: 10,
        rooms: 3,
        area: 125,
        price: 320000,
        status: "Available",
        viewType: "Opera",
        floorPlanImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
        gallery: [],
        balcony: true,
      },
    ],
  },
  {
    id: "5",
    title: "Victory Park Estates",
    slug: "victory-park-estates",
    location: "Baghramyan Ave 24, Yerevan",
    city: "Yerevan",
    description: "An exclusive hillside development overlooking Victory Park and Mount Ararat.",
    descriptionHy: "Բացառիկ բլրային նախագիծ՝ Հաղթանակի այգու և Արարատ լեռան տեսարանով։",
    longDescription:
      "Victory Park Estates represents the pinnacle of Casa Group's portfolio — limited collection residences with unmatched views and bespoke interiors.",
    longDescriptionHy:
      "Victory Park Estates-ը Casa Group-ի պորտֆելի գագաթնակետն է՝ սահմանափակ քանակությամբ բնակարաններ անզուգական տեսարաններով և անհատական ինտերիերով։",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1200&q=80",
    ],
    startingPrice: 450000,
    completionDate: "Q3 2028",
    status: "Under Construction",
    availableApartmentsCount: 18,
    totalApartments: 48,
    floors: 20,
    developer: "CasaGroup",
    coordinates: { lat: 40.1950, lng: 44.4880 },
    tags: ["coming soon", "exclusive", "panoramic"],
    featured: true,
    amenities: [
      { icon: "Waves", label: "Infinity Pool" },
      { icon: "Leaf", label: "Private Gardens" },
      { icon: "Shield", label: "Private Security" },
    ],
    nearbyPlaces: [
      { name: "Victory Park", distance: "200m", category: "leisure" },
      { name: "Matenadaran", distance: "1.2km", category: "leisure" },
    ],
    paymentOptions: [
      { title: "Early Bird Pricing", description: "Special rates for pre-launch reservations" },
    ],
    buildings: [],
    apartments: [],
  },
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
