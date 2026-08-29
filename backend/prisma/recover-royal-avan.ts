/**
 * Recover ROYAL AVAN RESIDENCE + apartment plans from cached HTML cards.
 *
 * Safe: does NOT wipe other projects. Upserts this project by slug only.
 * With --replace-plans, replaces apartments for this project only.
 *
 * Usage (on the server, from backend/):
 *   npx tsx prisma/recover-royal-avan.ts --replace-plans
 */
import "dotenv/config";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const publicBase = (process.env.PUBLIC_BASE_URL || "https://casagroup.am").replace(/\/$/, "");
const replacePlans = process.argv.includes("--replace-plans");

const COVER = `${publicBase}/uploads/images/1785238891300-f578f2d0.webp`;

/** Plan images still hosted on norakaruyc CDN (from original cards). */
const IMG = {
  /** ~58 m² layout */
  s58: "https://api.norakaruyc.am/api/images/69a54d6a1d2509032c4615a2/3",
  /** ~59 m² layout */
  a: "https://api.norakaruyc.am/api/images/69a54d901d2509032c4615ab/3",
  a2: "https://api.norakaruyc.am/api/images/69a54d901d2509032c4615ab/2",
  b: "https://api.norakaruyc.am/api/images/69a54dc61d2509032c4615bd/3",
  c: "https://api.norakaruyc.am/api/images/69a54dae1d2509032c4615b4/3",
  d: "https://api.norakaruyc.am/api/images/69a54de41d2509032c4615c6/3",
  e: "https://api.norakaruyc.am/api/images/69a54dff1d2509032c4615cf/3",
  f: "https://api.norakaruyc.am/api/images/69a54e4c1d2509032c4615e1/3",
  g: "https://api.norakaruyc.am/api/images/69a54e221d2509032c4615d8/3",
  h: "https://api.norakaruyc.am/api/images/69a54e761d2509032c4615ea/3",
} as const;

type Plan = {
  id: string;
  floor: number;
  rooms: number;
  area: number;
  price: number;
  status: "Available" | "Reserved" | "Sold";
  floorPlanImage: string;
};

/** Parsed from apartment cards HTML (entrance 1) - all pages. */
const PLANS: Plan[] = [
  // --- page 1 (missed earlier): 58 / 59.2 m² ---
  { id: "cms0bktlq00157t8ck79fokz7", floor: 1, rooms: 2, area: 58, price: 35_960_000, status: "Available", floorPlanImage: IMG.s58 },
  { id: "cms0c05wq001n7t8ctjqlzy9e", floor: 2, rooms: 2, area: 58, price: 36_540_000, status: "Available", floorPlanImage: IMG.s58 },
  { id: "cms0a2gba000p7t8cbnvziyqa", floor: 1, rooms: 2, area: 59.2, price: 36_890_000, status: "Available", floorPlanImage: IMG.a },
  { id: "cms-sold-58-f3", floor: 3, rooms: 2, area: 58, price: 0, status: "Sold", floorPlanImage: IMG.s58 },
  { id: "cms0d1lqk002n7t8cvhwyo7x1", floor: 4, rooms: 2, area: 58, price: 37_700_000, status: "Available", floorPlanImage: IMG.s58 },
  { id: "cms0c05vb00177t8cvy0fdhja", floor: 2, rooms: 2, area: 59.2, price: 38_080_000, status: "Available", floorPlanImage: IMG.a },
  { id: "cms0cjiai001p7t8c3mrhppxa", floor: 3, rooms: 2, area: 59.2, price: 38_675_000, status: "Available", floorPlanImage: IMG.a2 },
  { id: "cms-sold-58-f5", floor: 5, rooms: 2, area: 58, price: 0, status: "Sold", floorPlanImage: IMG.s58 },
  { id: "cms0d1lpe00277t8ciu9jjm26", floor: 4, rooms: 2, area: 59.2, price: 39_270_000, status: "Available", floorPlanImage: IMG.a },

  // --- page 2+ ---
  { id: "cms-sold-59-5-f5", floor: 5, rooms: 2, area: 59.5, price: 0, status: "Sold", floorPlanImage: IMG.a },

  { id: "cms0b81qr000v7t8c9d4h0ct5", floor: 1, rooms: 2, area: 75.9, price: 46_299_000, status: "Available", floorPlanImage: IMG.b },
  { id: "cms0bdpqo000z7t8chwh11zrz", floor: 1, rooms: 2, area: 75, price: 46_500_000, status: "Available", floorPlanImage: IMG.c },
  { id: "cms0c05wa001h7t8c6cmrqo9z", floor: 2, rooms: 2, area: 75, price: 47_250_000, status: "Available", floorPlanImage: IMG.c },
  { id: "cms0d1lq4002h7t8cg0xx8grx", floor: 4, rooms: 2, area: 75, price: 47_250_000, status: "Available", floorPlanImage: IMG.c },
  { id: "cms0c05vs001d7t8cjh7haf19", floor: 2, rooms: 2, area: 75.9, price: 47_817_000, status: "Available", floorPlanImage: IMG.b },
  { id: "cms0cjib9001z7t8cxhx9miqd", floor: 3, rooms: 2, area: 75, price: 48_000_000, status: "Available", floorPlanImage: IMG.c },
  { id: "cms0cjiay001v7t8cygojadti", floor: 3, rooms: 2, area: 75.9, price: 48_576_000, status: "Available", floorPlanImage: IMG.b },
  { id: "cms0as1bt000r7t8cizwqwen5", floor: 1, rooms: 2, area: 79, price: 48_980_000, status: "Available", floorPlanImage: IMG.d },

  { id: "cms0d1lpu002d7t8c2tm23327", floor: 4, rooms: 2, area: 75.9, price: 49_335_000, status: "Available", floorPlanImage: IMG.b },
  { id: "cms0dg0oo002z7t8cczzumy5b", floor: 5, rooms: 2, area: 75, price: 49_500_000, status: "Available", floorPlanImage: IMG.c },
  { id: "cms0dg0oe002v7t8cbj7l5s1n", floor: 5, rooms: 2, area: 75.9, price: 50_094_000, status: "Available", floorPlanImage: IMG.b },
  { id: "cms0bjjjd00137t8coadpqp48", floor: 1, rooms: 2, area: 80.2, price: 50_526_000, status: "Available", floorPlanImage: IMG.e },
  { id: "cms0c05vh00197t8cdu9lzvq1", floor: 2, rooms: 2, area: 79, price: 50_560_000, status: "Available", floorPlanImage: IMG.d },
  { id: "cms0c05wm001l7t8co922fodj", floor: 2, rooms: 2, area: 80.2, price: 51_328_000, status: "Available", floorPlanImage: IMG.e },
  { id: "cms0cjiao001r7t8c2debu7gi", floor: 3, rooms: 2, area: 79, price: 51_350_000, status: "Available", floorPlanImage: IMG.d },
  { id: "cms0cjibk00237t8c1bdl55wy", floor: 3, rooms: 2, area: 80.2, price: 52_130_000, status: "Available", floorPlanImage: IMG.e },
  { id: "cms0d1lpj00297t8chpwjgq1i", floor: 4, rooms: 2, area: 79, price: 52_140_000, status: "Available", floorPlanImage: IMG.d },

  { id: "cms0dg0o4002r7t8c3sy57wju", floor: 5, rooms: 2, area: 79, price: 52_930_000, status: "Available", floorPlanImage: IMG.d },
  { id: "cms0d1lqe002l7t8c67esuit5", floor: 4, rooms: 2, area: 80.2, price: 52_932_000, status: "Available", floorPlanImage: IMG.e },
  { id: "cms0dg0oy00337t8cv6vv36z2", floor: 5, rooms: 2, area: 80.2, price: 53_734_000, status: "Available", floorPlanImage: IMG.e },

  { id: "cms0b81ql000t7t8cel2lcv1n", floor: 1, rooms: 3, area: 98.5, price: 60_085_000, status: "Available", floorPlanImage: IMG.f },
  { id: "cms-sold-100-f5", floor: 5, rooms: 3, area: 100, price: 0, status: "Sold", floorPlanImage: IMG.g },

  { id: "cms0c05vn001b7t8cuh5je6fs", floor: 2, rooms: 3, area: 98.5, price: 62_055_000, status: "Available", floorPlanImage: IMG.f },
  { id: "cms0bdpqt00117t8cpxxpg72r", floor: 1, rooms: 3, area: 100, price: 63_000_000, status: "Available", floorPlanImage: IMG.g },
  { id: "cms0d1lq9002j7t8cjiuj0c9m", floor: 4, rooms: 3, area: 100, price: 63_000_000, status: "Available", floorPlanImage: IMG.g },
  { id: "cms0cjiat001t7t8cosjyyg09", floor: 3, rooms: 3, area: 98.5, price: 63_040_000, status: "Available", floorPlanImage: IMG.f },
  { id: "cms0c05wf001j7t8c25j7g1uf", floor: 2, rooms: 3, area: 100, price: 64_000_000, status: "Available", floorPlanImage: IMG.g },
  { id: "cms0d1lpo002b7t8cwqb1kdjq", floor: 4, rooms: 3, area: 98.5, price: 64_025_000, status: "Available", floorPlanImage: IMG.f },
  { id: "cms0cjibe00217t8c8ndfibyl", floor: 3, rooms: 3, area: 100, price: 65_000_000, status: "Available", floorPlanImage: IMG.g },
  { id: "cms0dg0oa002t7t8cit5ryx34", floor: 5, rooms: 3, area: 98.5, price: 65_010_000, status: "Available", floorPlanImage: IMG.f },

  { id: "cms0b81qw000x7t8cl3zgql41", floor: 1, rooms: 3, area: 112.2, price: 68_442_000, status: "Available", floorPlanImage: IMG.h },
  { id: "cms0cjib3001x7t8cwj9e5xno", floor: 3, rooms: 3, area: 112.2, price: 68_442_000, status: "Available", floorPlanImage: IMG.h },
  { id: "cms0c05w2001f7t8cx0z80kxl", floor: 1, rooms: 2, area: 112.2, price: 70_686_000, status: "Available", floorPlanImage: IMG.h },
  { id: "cms0d1lpz002f7t8cis16aqwb", floor: 4, rooms: 3, area: 112.2, price: 72_930_000, status: "Available", floorPlanImage: IMG.h },
  { id: "cms0dg0oj002x7t8ch5ohy72h", floor: 5, rooms: 3, area: 112.2, price: 74_052_000, status: "Available", floorPlanImage: IMG.h },
];

const available = PLANS.filter((p) => p.status === "Available");
const startingPrice = Math.min(...available.map((p) => p.price));

const PROJECT = {
  slug: "royal-avan-residence",
  title: "ROYAL AVAN RESIDENCE",
  titleHy: "ROYAL AVAN RESIDENCE",
  location: "Avan, Yerevan",
  locationHy: "Ավան, Երևան",
  city: "Yerevan",
  cityHy: "Երևան",
  description:
    "Apartments in a completed building in Avan, starting from only 610,000 AMD.",
  descriptionHy:
    "ԱՎԱՆՈՒՄ ԱՎԱՐՏՎԱԾ ՇԵՆՔՈՒՄ ԲՆԱԿԱՐԱՆՆԵՐ՝ ՍԿՍԱԾ ԸՆԴԱՄԵՆԸ 610,000 ԴՐԱՄԻՑ",
  longDescription:
    "ROYAL AVAN RESIDENCE - apartments in a completed building in Avan, Yerevan.",
  longDescriptionHy:
    "ROYAL AVAN RESIDENCE - Ավանում ավարտված շենքում բնակարաններ։ Սկսած ընդամենը 610,000 դրամից։",
  images: [COVER],
  gallery: [{ url: COVER, category: "exterior" }],
  startingPrice,
  completionDate: "Ready",
  status: "Ready",
  floors: 5,
  amenities: [
    { icon: "Shield", label: "Security" },
    { icon: "Car", label: "Parking" },
  ],
  nearbyPlaces: [] as { name: string; distance: string; category: string }[],
  paymentOptions: [
    { title: "Full Payment", description: "Ready to move in" },
    { title: "Mortgage", description: "Available through major Armenian banks" },
  ],
  developer: "CasaGroup",
  lat: 40.22,
  lng: 44.57,
  tags: ["ready to move", "avan", "completed"],
  featured: true,
};

async function main() {
  console.log(`Recovering ${PROJECT.slug} with ${PLANS.length} plans…`);
  console.log(`startingPrice=${startingPrice}  available=${available.length}  sold=${PLANS.length - available.length}`);
  console.log(`replacePlans=${replacePlans}`);

  const existing = await prisma.project.findUnique({ where: { slug: PROJECT.slug } });

  let projectId: string;
  if (existing) {
    projectId = existing.id;
    await prisma.project.update({
      where: { id: projectId },
      data: {
        title: PROJECT.title,
        titleHy: PROJECT.titleHy,
        location: PROJECT.location,
        locationHy: PROJECT.locationHy,
        city: PROJECT.city,
        cityHy: PROJECT.cityHy,
        description: PROJECT.description,
        descriptionHy: PROJECT.descriptionHy,
        longDescription: PROJECT.longDescription,
        longDescriptionHy: PROJECT.longDescriptionHy,
        images: PROJECT.images,
        gallery: PROJECT.gallery,
        startingPrice: PROJECT.startingPrice,
        completionDate: PROJECT.completionDate,
        status: PROJECT.status,
        floors: PROJECT.floors,
        amenities: PROJECT.amenities,
        nearbyPlaces: PROJECT.nearbyPlaces,
        paymentOptions: PROJECT.paymentOptions,
        developer: PROJECT.developer,
        lat: PROJECT.lat,
        lng: PROJECT.lng,
        tags: PROJECT.tags,
        featured: PROJECT.featured,
        availableApartmentsCount: available.length,
        totalApartments: PLANS.length,
      },
    });
    console.log(`Updated project id=${projectId}`);
  } else {
    const created = await prisma.project.create({
      data: {
        title: PROJECT.title,
        titleHy: PROJECT.titleHy,
        slug: PROJECT.slug,
        location: PROJECT.location,
        locationHy: PROJECT.locationHy,
        city: PROJECT.city,
        cityHy: PROJECT.cityHy,
        description: PROJECT.description,
        descriptionHy: PROJECT.descriptionHy,
        longDescription: PROJECT.longDescription,
        longDescriptionHy: PROJECT.longDescriptionHy,
        images: PROJECT.images,
        gallery: PROJECT.gallery,
        startingPrice: PROJECT.startingPrice,
        completionDate: PROJECT.completionDate,
        status: PROJECT.status,
        availableApartmentsCount: available.length,
        totalApartments: PLANS.length,
        floors: PROJECT.floors,
        amenities: PROJECT.amenities,
        nearbyPlaces: PROJECT.nearbyPlaces,
        paymentOptions: PROJECT.paymentOptions,
        developer: PROJECT.developer,
        lat: PROJECT.lat,
        lng: PROJECT.lng,
        tags: PROJECT.tags,
        featured: PROJECT.featured,
      },
    });
    projectId = created.id;
    console.log(`Created project id=${projectId}`);
  }

  if (!replacePlans && existing) {
    const count = await prisma.apartment.count({ where: { projectId } });
    if (count > 0) {
      console.log(
        `Project already has ${count} apartments. Re-run with --replace-plans to recreate from cards.`,
      );
      return;
    }
  }

  if (replacePlans && existing) {
    await prisma.apartment.deleteMany({ where: { projectId } });
    console.log("Removed previous apartments for this project only.");
  }

  for (const p of PLANS) {
    await prisma.apartment.create({
      data: {
        id: p.id,
        projectId,
        floor: p.floor,
        rooms: p.rooms,
        area: p.area,
        price: p.price,
        status: p.status,
        viewType: "",
        floorPlanImage: p.floorPlanImage,
        gallery: [],
        balcony: false,
      },
    });
    console.log(
      `  ✓ ${p.id}  F${p.floor}  ${p.rooms}BR  ${p.area}m²  ${p.price || "-"}  ${p.status}`,
    );
  }

  await prisma.project.update({
    where: { id: projectId },
    data: {
      availableApartmentsCount: available.length,
      totalApartments: PLANS.length,
      startingPrice,
    },
  });

  console.log("Done.");
  console.log(`https://casagroup.am/projects/${PROJECT.slug}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
