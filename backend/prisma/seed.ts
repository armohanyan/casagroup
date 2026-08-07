import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/** Seed data mirrored from frontend data/mock.ts */
const MOCK_PROJECTS = [
  {
    id: "2",
    title: "Cascade Residences",
    slug: "cascade-residences",
    location: "Tamanyan St 8, Yerevan",
    city: "Yerevan",
    description: "Contemporary luxury residences nestled beside the iconic Cascade complex.",
    descriptionHy: "Ժամանակակից շքեղ բնակարաններ՝ Կասկադ համալիրի կողքին։",
    longDescription:
      "Positioned steps from one of Yerevan's most celebrated cultural landmarks, Cascade Residences offers a rare combination of architectural heritage and contemporary comfort.",
    longDescriptionHy:
      "Երևանի ամենահայտնի մշակութային կոթողներից մեկի կողքին՝ Cascade Residences-ը համատեղում է ճարտարապետական ժառանգությունը և ժամանակակից հարմարավետությունը։",
    images: [
      "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=1200&q=80",
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=1200&q=80",
      "https://images.unsplash.com/photo-1600573472592-401b489a3cdc?w=1200&q=80",
    ],
    gallery: [
      { url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1400&q=85", category: "exterior" },
      { url: "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1400&q=85", category: "interior" },
      { url: "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1400&q=85", category: "interior" },
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
    droneVideos: [
      {
        title: "Cascade District Overview",
        url: "https://www.youtube.com/embed/nFm7n9B9nf0",
        thumbnail: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80",
      },
    ],
    featured: true,
    amenities: [
      { icon: "Waves", label: "Rooftop Pool" },
      { icon: "Dumbbell", label: "Fitness Center" },
      { icon: "Car", label: "Parking" },
      { icon: "Shield", label: "Security" },
    ],
    nearbyPlaces: [
      { name: "Cascade Complex", distance: "50m", category: "leisure" },
      { name: "Vernissage Market", distance: "400m", category: "shopping" },
    ],
    paymentOptions: [
      { title: "Full Payment", description: "Ready to move in immediately" },
      { title: "Mortgage", description: "Available through all major Armenian banks" },
    ],
    buildings: [
      { id: "bldg-2-a", name: "4A", sortOrder: 0, floors: [] },
      { id: "bldg-2-b", name: "5A", sortOrder: 1, floors: [] },
    ],
    apartments: [
      {
        id: "apt-2-1",
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
      "Arabkir Heights offers panoramic city views from a prime hillside location.",
    longDescriptionHy:
      "Arabkir Heights-ը առաջարկում է համայնապատկերային տեսարաններ քաղաքի վրա՝ բլրի վրա գտնվող հարմարավետ վայրից։",
    images: [
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1200&q=80",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=1200&q=80",
    ],
    gallery: null,
    droneVideos: null,
    startingPrice: 185000,
    completionDate: "Q2 2027",
    status: "Under Construction",
    availableApartmentsCount: 24,
    totalApartments: 64,
    floors: 18,
    developer: "CasaGroup",
    architect: "CasaGroup Architecture",
    lat: 40.205,
    lng: 44.518,
    tags: ["panoramic views", "family living"],
    featured: true,
    amenities: [
      { icon: "Car", label: "Underground Parking" },
      { icon: "Dumbbell", label: "Fitness Center" },
    ],
    nearbyPlaces: [
      { name: "Komitas Metro", distance: "300m", category: "transport" },
    ],
    paymentOptions: [
      { title: "Installment Plan", description: "Flexible payment schedule during construction" },
    ],
    apartments: [
      {
        id: "apt-3-1",
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
    longDescription: "Northern Residences delivers turnkey luxury in the heart of Yerevan.",
    longDescriptionHy: "Northern Residences-ը տրամադրում է պատրաստ շքեղություն Երևանի սրտում։",
    images: [
      "https://images.unsplash.com/photo-1600607687644-c7171b42498f?w=1200&q=80",
      "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=1200&q=80",
    ],
    gallery: null,
    droneVideos: null,
    startingPrice: 320000,
    completionDate: "Q1 2026",
    status: "Ready",
    availableApartmentsCount: 4,
    totalApartments: 32,
    floors: 12,
    developer: "CasaGroup",
    lat: 40.181,
    lng: 44.514,
    tags: ["ready to move", "city center"],
    featured: true,
    amenities: [
      { icon: "Wifi", label: "Smart Home" },
      { icon: "Car", label: "Valet Parking" },
    ],
    nearbyPlaces: [{ name: "Northern Avenue", distance: "100m", category: "shopping" }],
    paymentOptions: [{ title: "Full Payment", description: "Immediate move-in available" }],
    apartments: [
      {
        id: "apt-4-1",
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
    longDescription: "Victory Park Estates represents the pinnacle of Casa Group's portfolio.",
    longDescriptionHy: "Victory Park Estates-ը Casa Group-ի պորտֆելի գագաթնակետն է։",
    images: [
      "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=1200&q=80",
      "https://images.unsplash.com/photo-1600047509807-ba8f64d4e676?w=1200&q=80",
    ],
    gallery: null,
    droneVideos: null,
    startingPrice: 450000,
    completionDate: "Q3 2028",
    status: "Under Construction",
    availableApartmentsCount: 18,
    totalApartments: 48,
    floors: 20,
    developer: "CasaGroup",
    lat: 40.195,
    lng: 44.488,
    tags: ["coming soon", "exclusive", "panoramic"],
    featured: true,
    amenities: [
      { icon: "Waves", label: "Infinity Pool" },
      { icon: "Leaf", label: "Private Gardens" },
    ],
    nearbyPlaces: [{ name: "Victory Park", distance: "200m", category: "leisure" }],
    paymentOptions: [
      { title: "Early Bird Pricing", description: "Special rates for pre-launch reservations" },
    ],
    apartments: [],
  },
] as const;

async function main() {
  console.log("Seeding database...");

  await prisma.mediaAsset.deleteMany();
  await prisma.inquiry.deleteMany();
  await prisma.apartment.deleteMany();
  await prisma.buildingFloor.deleteMany();
  await prisma.building.deleteMany();
  await prisma.project.deleteMany();

  for (const p of MOCK_PROJECTS) {
    const { apartments, buildings = [], ...project } = p as typeof p & {
      buildings?: {
        id: string;
        name: string;
        sortOrder?: number;
        floors?: {
          id?: string;
          label: string;
          sortOrder?: number;
          imageUrl?: string;
          hotspots?: { apartmentId: string; points: [number, number][] }[];
        }[];
      }[];
    };
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
        images: [...project.images],
        gallery: project.gallery ? [...project.gallery] : undefined,
        droneVideos: project.droneVideos ? [...project.droneVideos] : undefined,
        startingPrice: project.startingPrice,
        completionDate: project.completionDate,
        status: project.status,
        availableApartmentsCount: project.availableApartmentsCount,
        totalApartments: project.totalApartments,
        floors: project.floors,
        amenities: [...project.amenities],
        nearbyPlaces: [...project.nearbyPlaces],
        paymentOptions: [...project.paymentOptions],
        developer: project.developer,
        architect: "architect" in project ? project.architect : null,
        managementCompany: "managementCompany" in project ? project.managementCompany : null,
        partnerBank: "partnerBank" in project ? project.partnerBank : null,
        constructionStart: "constructionStart" in project ? project.constructionStart : null,
        exclusiveSalesRights: "exclusiveSalesRights" in project ? project.exclusiveSalesRights : null,
        lat: project.lat,
        lng: project.lng,
        tags: [...project.tags],
        featured: project.featured,
        buildings: {
          create: buildings.map((b, i) => ({
            id: b.id,
            name: b.name,
            sortOrder: b.sortOrder ?? i,
            floors: {
              create: (b.floors ?? []).map((f, fi) => ({
                ...(f.id ? { id: f.id } : {}),
                label: f.label,
                sortOrder: f.sortOrder ?? fi,
                imageUrl: f.imageUrl ?? "",
                hotspots: f.hotspots ?? [],
              })),
            },
          })),
        },
        apartments: {
          create: apartments.map((a) => ({
            id: a.id,
            buildingId: "buildingId" in a ? (a.buildingId as string | undefined) ?? null : null,
            floor: a.floor,
            rooms: a.rooms,
            area: a.area,
            price: a.price,
            status: a.status,
            viewType: a.viewType,
            floorPlanImage: a.floorPlanImage,
            gallery: [...a.gallery],
            balcony: a.balcony,
          })),
        },
      },
    });
    console.log(`  ✓ ${project.title}`);
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
