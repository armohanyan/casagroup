import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const FLOOR_PLATE = "/seed/floor-plate-4unit.svg";
const PLAN_2BR = "/seed/unit-2br.svg";
const PLAN_3BR = "/seed/unit-3br.svg";
const PLAN_4BR = "/seed/unit-4br.svg";

/** Hotspot polygons as % of floor-plate image (matches public/seed/floor-plate-4unit.svg). */
const HS = {
  A: [
    [4, 6],
    [42, 6],
    [42, 49],
    [4, 49],
  ] as [number, number][],
  B: [
    [4, 51],
    [42, 51],
    [42, 94],
    [4, 94],
  ] as [number, number][],
  C: [
    [58, 6],
    [96, 6],
    [96, 49],
    [58, 49],
  ] as [number, number][],
  D: [
    [58, 51],
    [96, 51],
    [96, 94],
    [58, 94],
  ] as [number, number][],
};

const GALLERY_INTERIOR = [
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85",
  "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1400&q=85",
  "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1400&q=85",
];

type SeedApt = {
  id: string;
  buildingId: string;
  apartmentNumber: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: string;
  viewType: string;
  floorPlanImage: string;
  gallery: string[];
  balcony: boolean;
  description?: string;
};

type SeedFloor = {
  id: string;
  label: string;
  sortOrder: number;
  imageUrl: string;
  hotspots: { apartmentId: string; points: [number, number][] }[];
};

type SeedBuilding = {
  id: string;
  name: string;
  sortOrder: number;
  floors: SeedFloor[];
};

type SeedProject = {
  id: string;
  title: string;
  slug: string;
  location: string;
  city: string;
  description: string;
  descriptionHy: string;
  longDescription: string;
  longDescriptionHy: string;
  images: string[];
  gallery: { url: string; category: string }[] | null;
  droneVideos: { title: string; url: string; thumbnail: string }[] | null;
  videoUrl?: string | null;
  startingPrice: number;
  completionDate: string;
  status: string;
  availableApartmentsCount: number;
  totalApartments: number;
  floors: number;
  developer: string;
  architect?: string | null;
  managementCompany?: string | null;
  partnerBank?: string | null;
  constructionStart?: string | null;
  exclusiveSalesRights?: string | null;
  lat: number;
  lng: number;
  tags: string[];
  featured: boolean;
  amenities: { icon: string; label: string }[];
  nearbyPlaces: { name: string; distance: string; category: string }[];
  paymentOptions: { title: string; description: string }[];
  buildings: SeedBuilding[];
  apartments: SeedApt[];
};

const MOCK_PROJECTS: SeedProject[] = [
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
    droneVideos: [
      {
        title: "Cascade District Overview",
        url: "https://www.youtube.com/embed/nFm7n9B9nf0",
        thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      },
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
    lat: 40.192,
    lng: 44.51,
    tags: ["ready to move", "cultural district", "rooftop terrace"],
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
      { title: "Installment", description: "Up to 24 months interest-free for ready units" },
    ],
    buildings: [
      {
        id: "bldg-2-a",
        name: "4A",
        sortOrder: 0,
        floors: [
          {
            id: "floor-2a-4",
            label: "4",
            sortOrder: 0,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-2-1", points: HS.A },
              { apartmentId: "apt-2-4", points: HS.B },
              { apartmentId: "apt-2-5", points: HS.C },
              { apartmentId: "apt-2-6", points: HS.D },
            ],
          },
          {
            id: "floor-2a-14",
            label: "14",
            sortOrder: 1,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-2-3", points: HS.A },
              { apartmentId: "apt-2-7", points: HS.C },
            ],
          },
        ],
      },
      {
        id: "bldg-2-b",
        name: "5A",
        sortOrder: 1,
        floors: [
          {
            id: "floor-2b-8",
            label: "8",
            sortOrder: 0,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-2-2", points: HS.C },
              { apartmentId: "apt-2-8", points: HS.A },
              { apartmentId: "apt-2-9", points: HS.D },
            ],
          },
        ],
      },
    ],
    apartments: [
      {
        id: "apt-2-1",
        buildingId: "bldg-2-a",
        apartmentNumber: "401",
        floor: 4,
        rooms: 2,
        area: 82,
        price: 145000,
        status: "Available",
        viewType: "Cascade",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Bright 2-bedroom with Cascade views, open kitchen, and covered balcony.",
      },
      {
        id: "apt-2-2",
        buildingId: "bldg-2-b",
        apartmentNumber: "802",
        floor: 8,
        rooms: 3,
        area: 112,
        price: 225000,
        status: "Available",
        viewType: "City",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Spacious 3-bedroom corner unit with city skyline views and dual balconies.",
      },
      {
        id: "apt-2-3",
        buildingId: "bldg-2-a",
        apartmentNumber: "1405",
        floor: 14,
        rooms: 4,
        area: 155,
        price: 380000,
        status: "Reserved",
        viewType: "Panoramic",
        floorPlanImage: PLAN_4BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Penthouse-level 4-bedroom with panoramic terrace and premium finishes.",
      },
      {
        id: "apt-2-4",
        buildingId: "bldg-2-a",
        apartmentNumber: "402",
        floor: 4,
        rooms: 2,
        area: 78,
        price: 138000,
        status: "Available",
        viewType: "Courtyard",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Quiet courtyard-facing 2-bedroom, ideal for first-time buyers.",
      },
      {
        id: "apt-2-5",
        buildingId: "bldg-2-a",
        apartmentNumber: "403",
        floor: 4,
        rooms: 3,
        area: 105,
        price: 198000,
        status: "Sold",
        viewType: "Cascade",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Sold — 3-bedroom with Cascade outlook.",
      },
      {
        id: "apt-2-6",
        buildingId: "bldg-2-a",
        apartmentNumber: "404",
        floor: 4,
        rooms: 1,
        area: 52,
        price: 98000,
        status: "Available",
        viewType: "City",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR.slice(0, 2),
        balcony: false,
        description: "Compact studio-style 1-bedroom for diaspora investors.",
      },
      {
        id: "apt-2-7",
        buildingId: "bldg-2-a",
        apartmentNumber: "1406",
        floor: 14,
        rooms: 3,
        area: 118,
        price: 265000,
        status: "Available",
        viewType: "Panoramic",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "High-floor 3-bedroom with floor-to-ceiling windows.",
      },
      {
        id: "apt-2-8",
        buildingId: "bldg-2-b",
        apartmentNumber: "801",
        floor: 8,
        rooms: 2,
        area: 88,
        price: 168000,
        status: "Available",
        viewType: "City",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "2-bedroom mid-rise unit with smart-home package included.",
      },
      {
        id: "apt-2-9",
        buildingId: "bldg-2-b",
        apartmentNumber: "804",
        floor: 8,
        rooms: 3,
        area: 120,
        price: 240000,
        status: "Reserved",
        viewType: "Mountain",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Corner 3-bedroom reserved — mountain glimpse on clear days.",
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
      "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1200&q=80",
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1400&q=85", category: "entrance" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1590674899484-d5640e854abe?w=1400&q=85", category: "parking" },
      { url: "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1400&q=85", category: "green" },
      { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85", category: "construction" },
    ],
    droneVideos: [
      {
        title: "Arabkir Hillside Flyover",
        url: "https://www.youtube.com/embed/nFm7n9B9nf0",
        thumbnail: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80",
      },
    ],
    startingPrice: 185000,
    completionDate: "Q2 2027",
    status: "Under Construction",
    availableApartmentsCount: 24,
    totalApartments: 64,
    floors: 18,
    developer: "CasaGroup",
    architect: "CasaGroup Architecture",
    managementCompany: "CasaGroup",
    partnerBank: "Ameriabank / ACBA",
    constructionStart: "Q3 2025",
    exclusiveSalesRights: "CasaGroup",
    lat: 40.205,
    lng: 44.518,
    tags: ["panoramic views", "family living", "under construction"],
    featured: true,
    amenities: [
      { icon: "Car", label: "Underground Parking" },
      { icon: "Dumbbell", label: "Fitness Center" },
      { icon: "Shield", label: "24/7 Security" },
      { icon: "Leaf", label: "Playground" },
      { icon: "Wifi", label: "Fiber Ready" },
    ],
    nearbyPlaces: [
      { name: "Komitas Metro", distance: "300m", category: "transport" },
      { name: "Arabkir Park", distance: "500m", category: "leisure" },
      { name: "YSMU Clinic", distance: "800m", category: "health" },
      { name: "School №55", distance: "450m", category: "education" },
    ],
    paymentOptions: [
      { title: "Installment Plan", description: "Flexible payment schedule during construction" },
      { title: "Mortgage", description: "Pre-approved partner bank programs" },
      { title: "Early Bird", description: "Discounted pricing for foundation-stage buyers" },
    ],
    buildings: [
      {
        id: "bldg-3-a",
        name: "A",
        sortOrder: 0,
        floors: [
          {
            id: "floor-3a-6",
            label: "6",
            sortOrder: 0,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-3-1", points: HS.A },
              { apartmentId: "apt-3-2", points: HS.B },
              { apartmentId: "apt-3-3", points: HS.C },
              { apartmentId: "apt-3-4", points: HS.D },
            ],
          },
          {
            id: "floor-3a-12",
            label: "12",
            sortOrder: 1,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-3-5", points: HS.A },
              { apartmentId: "apt-3-6", points: HS.C },
            ],
          },
        ],
      },
      {
        id: "bldg-3-b",
        name: "B",
        sortOrder: 1,
        floors: [
          {
            id: "floor-3b-9",
            label: "9",
            sortOrder: 0,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-3-7", points: HS.B },
              { apartmentId: "apt-3-8", points: HS.D },
            ],
          },
        ],
      },
    ],
    apartments: [
      {
        id: "apt-3-1",
        buildingId: "bldg-3-a",
        apartmentNumber: "601",
        floor: 6,
        rooms: 2,
        area: 78,
        price: 185000,
        status: "Available",
        viewType: "City",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Family 2-bedroom with city views; delivery Q2 2027.",
      },
      {
        id: "apt-3-2",
        buildingId: "bldg-3-a",
        apartmentNumber: "602",
        floor: 6,
        rooms: 3,
        area: 108,
        price: 248000,
        status: "Available",
        viewType: "Park",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "3-bedroom facing Arabkir Park side.",
      },
      {
        id: "apt-3-3",
        buildingId: "bldg-3-a",
        apartmentNumber: "603",
        floor: 6,
        rooms: 2,
        area: 74,
        price: 176000,
        status: "Reserved",
        viewType: "Courtyard",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Reserved courtyard 2-bedroom.",
      },
      {
        id: "apt-3-4",
        buildingId: "bldg-3-a",
        apartmentNumber: "604",
        floor: 6,
        rooms: 1,
        area: 48,
        price: 125000,
        status: "Available",
        viewType: "City",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR.slice(0, 1),
        balcony: false,
        description: "Efficient 1-bedroom for rental investors.",
      },
      {
        id: "apt-3-5",
        buildingId: "bldg-3-a",
        apartmentNumber: "1201",
        floor: 12,
        rooms: 3,
        area: 115,
        price: 275000,
        status: "Available",
        viewType: "Panoramic",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "High-floor panoramic 3-bedroom.",
      },
      {
        id: "apt-3-6",
        buildingId: "bldg-3-a",
        apartmentNumber: "1203",
        floor: 12,
        rooms: 4,
        area: 148,
        price: 355000,
        status: "Available",
        viewType: "Panoramic",
        floorPlanImage: PLAN_4BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Large 4-bedroom family layout with terrace.",
      },
      {
        id: "apt-3-7",
        buildingId: "bldg-3-b",
        apartmentNumber: "902",
        floor: 9,
        rooms: 2,
        area: 81,
        price: 192000,
        status: "Available",
        viewType: "City",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Building B mid-rise 2-bedroom.",
      },
      {
        id: "apt-3-8",
        buildingId: "bldg-3-b",
        apartmentNumber: "904",
        floor: 9,
        rooms: 3,
        area: 110,
        price: 255000,
        status: "Sold",
        viewType: "Mountain",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Sold — mountain-view 3-bedroom.",
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
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1400&q=85", category: "lobby" },
      { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85", category: "rooftop" },
      { url: "https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=85", category: "night" },
    ],
    droneVideos: null,
    startingPrice: 320000,
    completionDate: "Q1 2026",
    status: "Ready",
    availableApartmentsCount: 4,
    totalApartments: 32,
    floors: 12,
    developer: "CasaGroup",
    architect: "Studio Yerevan",
    managementCompany: "CasaGroup",
    partnerBank: "Inecobank",
    constructionStart: "Q1 2023",
    exclusiveSalesRights: "CasaGroup",
    lat: 40.181,
    lng: 44.514,
    tags: ["ready to move", "city center", "turnkey"],
    featured: true,
    amenities: [
      { icon: "Wifi", label: "Smart Home" },
      { icon: "Car", label: "Valet Parking" },
      { icon: "Shield", label: "Concierge" },
      { icon: "Dumbbell", label: "Gym" },
    ],
    nearbyPlaces: [
      { name: "Northern Avenue", distance: "100m", category: "shopping" },
      { name: "Opera House", distance: "800m", category: "leisure" },
      { name: "Republic Square", distance: "1.1km", category: "leisure" },
    ],
    paymentOptions: [
      { title: "Full Payment", description: "Immediate move-in available" },
      { title: "Mortgage", description: "Partner bank refinancing support" },
    ],
    buildings: [
      {
        id: "bldg-4-a",
        name: "Main",
        sortOrder: 0,
        floors: [
          {
            id: "floor-4a-10",
            label: "10",
            sortOrder: 0,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-4-1", points: HS.A },
              { apartmentId: "apt-4-2", points: HS.C },
              { apartmentId: "apt-4-3", points: HS.D },
            ],
          },
          {
            id: "floor-4a-7",
            label: "7",
            sortOrder: 1,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-4-4", points: HS.B },
              { apartmentId: "apt-4-5", points: HS.A },
            ],
          },
        ],
      },
    ],
    apartments: [
      {
        id: "apt-4-1",
        buildingId: "bldg-4-a",
        apartmentNumber: "1001",
        floor: 10,
        rooms: 3,
        area: 125,
        price: 320000,
        status: "Available",
        viewType: "Opera",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Turnkey 3-bedroom with Opera district views; furniture package optional.",
      },
      {
        id: "apt-4-2",
        buildingId: "bldg-4-a",
        apartmentNumber: "1003",
        floor: 10,
        rooms: 2,
        area: 92,
        price: 265000,
        status: "Available",
        viewType: "Avenue",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "2-bedroom overlooking Northern Avenue.",
      },
      {
        id: "apt-4-3",
        buildingId: "bldg-4-a",
        apartmentNumber: "1004",
        floor: 10,
        rooms: 4,
        area: 160,
        price: 445000,
        status: "Reserved",
        viewType: "Panoramic",
        floorPlanImage: PLAN_4BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Reserved corner 4-bedroom penthouse-adjacent.",
      },
      {
        id: "apt-4-4",
        buildingId: "bldg-4-a",
        apartmentNumber: "702",
        floor: 7,
        rooms: 2,
        area: 85,
        price: 248000,
        status: "Available",
        viewType: "Courtyard",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Quiet courtyard 2-bedroom, ready to move.",
      },
      {
        id: "apt-4-5",
        buildingId: "bldg-4-a",
        apartmentNumber: "701",
        floor: 7,
        rooms: 3,
        area: 118,
        price: 298000,
        status: "Sold",
        viewType: "City",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Sold.",
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
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1400&q=85", category: "green" },
      { url: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?w=1400&q=85", category: "rooftop" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1400&q=85", category: "construction" },
      { url: "https://images.unsplash.com/photo-1477959854737-0bf3c97c3b63?w=1400&q=85", category: "drone" },
    ],
    droneVideos: [
      {
        title: "Victory Park & Ararat Views",
        url: "https://www.youtube.com/embed/nFm7n9B9nf0",
        thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      },
    ],
    startingPrice: 450000,
    completionDate: "Q3 2028",
    status: "Under Construction",
    availableApartmentsCount: 18,
    totalApartments: 48,
    floors: 20,
    developer: "CasaGroup",
    architect: "CasaGroup Architecture",
    managementCompany: "CasaGroup Concierge",
    partnerBank: "By invitation",
    constructionStart: "Q1 2026",
    exclusiveSalesRights: "CasaGroup",
    lat: 40.195,
    lng: 44.488,
    tags: ["coming soon", "exclusive", "panoramic"],
    featured: true,
    amenities: [
      { icon: "Waves", label: "Infinity Pool" },
      { icon: "Leaf", label: "Private Gardens" },
      { icon: "Shield", label: "Private Security" },
      { icon: "Car", label: "Private Garage" },
      { icon: "Dumbbell", label: "Spa & Gym" },
    ],
    nearbyPlaces: [
      { name: "Victory Park", distance: "200m", category: "leisure" },
      { name: "Matenadaran", distance: "1.2km", category: "leisure" },
      { name: "Cascade", distance: "1.5km", category: "leisure" },
    ],
    paymentOptions: [
      { title: "Early Bird Pricing", description: "Special rates for pre-launch reservations" },
      { title: "Custom Schedule", description: "Bespoke payment plans for collection residences" },
    ],
    buildings: [
      {
        id: "bldg-5-a",
        name: "Villa Wing",
        sortOrder: 0,
        floors: [
          {
            id: "floor-5a-18",
            label: "18",
            sortOrder: 0,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-5-1", points: HS.A },
              { apartmentId: "apt-5-2", points: HS.C },
            ],
          },
          {
            id: "floor-5a-15",
            label: "15",
            sortOrder: 1,
            imageUrl: FLOOR_PLATE,
            hotspots: [
              { apartmentId: "apt-5-3", points: HS.B },
              { apartmentId: "apt-5-4", points: HS.D },
            ],
          },
        ],
      },
    ],
    apartments: [
      {
        id: "apt-5-1",
        buildingId: "bldg-5-a",
        apartmentNumber: "1801",
        floor: 18,
        rooms: 4,
        area: 185,
        price: 520000,
        status: "Available",
        viewType: "Ararat",
        floorPlanImage: PLAN_4BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Collection residence with Ararat vista — pre-launch pricing.",
      },
      {
        id: "apt-5-2",
        buildingId: "bldg-5-a",
        apartmentNumber: "1803",
        floor: 18,
        rooms: 3,
        area: 142,
        price: 450000,
        status: "Available",
        viewType: "Park",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Park-facing 3-bedroom collection unit.",
      },
      {
        id: "apt-5-3",
        buildingId: "bldg-5-a",
        apartmentNumber: "1502",
        floor: 15,
        rooms: 3,
        area: 135,
        price: 425000,
        status: "Reserved",
        viewType: "City",
        floorPlanImage: PLAN_3BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Reserved mid-collection 3-bedroom.",
      },
      {
        id: "apt-5-4",
        buildingId: "bldg-5-a",
        apartmentNumber: "1504",
        floor: 15,
        rooms: 2,
        area: 98,
        price: 380000,
        status: "Available",
        viewType: "Garden",
        floorPlanImage: PLAN_2BR,
        gallery: GALLERY_INTERIOR,
        balcony: true,
        description: "Garden-side 2-bedroom entry collection unit.",
      },
    ],
  },
];

async function main() {
  console.log("Seeding database...");

  await prisma.mediaAsset.deleteMany();
  await prisma.projectView.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.buildingFloor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.project.deleteMany();

  for (const p of MOCK_PROJECTS) {
    const { apartments, buildings, ...project } = p;
    await prisma.project.create({
      data: {
        id: project.id,
        title: project.title,
        slug: project.slug,
        location: project.location,
        city: project.city,
        description: project.description,
        descriptionHy: project.descriptionHy,
        longDescription: project.longDescription,
        longDescriptionHy: project.longDescriptionHy,
        images: project.images,
        gallery: project.gallery ?? undefined,
        droneVideos: project.droneVideos ?? undefined,
        videoUrl: project.videoUrl ?? null,
        startingPrice: project.startingPrice,
        completionDate: project.completionDate,
        status: project.status,
        availableApartmentsCount: project.availableApartmentsCount,
        totalApartments: project.totalApartments,
        floors: project.floors,
        amenities: project.amenities,
        nearbyPlaces: project.nearbyPlaces,
        paymentOptions: project.paymentOptions,
        developer: project.developer,
        architect: project.architect ?? null,
        managementCompany: project.managementCompany ?? null,
        partnerBank: project.partnerBank ?? null,
        constructionStart: project.constructionStart ?? null,
        exclusiveSalesRights: project.exclusiveSalesRights ?? null,
        lat: project.lat,
        lng: project.lng,
        tags: project.tags,
        featured: project.featured,
        buildings: {
          create: buildings.map((b) => ({
            id: b.id,
            name: b.name,
            sortOrder: b.sortOrder,
            floors: {
              create: b.floors.map((f) => ({
                id: f.id,
                label: f.label,
                sortOrder: f.sortOrder,
                imageUrl: f.imageUrl,
                hotspots: f.hotspots,
              })),
            },
          })),
        },
        apartments: {
          create: apartments.map((a) => ({
            id: a.id,
            buildingId: a.buildingId,
            apartmentNumber: a.apartmentNumber,
            floor: a.floor,
            rooms: a.rooms,
            area: a.area,
            price: a.price,
            status: a.status,
            viewType: a.viewType,
            floorPlanImage: a.floorPlanImage,
            description: a.description ?? null,
            gallery: a.gallery,
            balcony: a.balcony,
          })),
        },
      },
    });
    console.log(`  ✓ ${project.title} (${apartments.length} apts, ${buildings.length} buildings)`);
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
