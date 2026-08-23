/**
 * Backfill Project.salesMode for existing apartment (building) projects.
 * - Has floor plates → floors
 * - Otherwise → plans
 * Neighborhood projects stay at plans (default).
 *
 * Run: npx tsx prisma/backfill-sales-mode.ts
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const projects = await prisma.project.findMany({
    where: { kind: { not: "neighborhood" } },
    include: {
      buildings: {
        include: { floors: true },
      },
    },
  });

  let floors = 0;
  let plans = 0;

  for (const project of projects) {
    const hasPlates = project.buildings.some((b) =>
      b.floors.some((f) => Boolean(f.imageUrl?.trim()) || (Array.isArray(f.hotspots) && (f.hotspots as unknown[]).length > 0)),
    );
    const salesMode = hasPlates ? "floors" : "plans";
    if (project.salesMode === salesMode) continue;
    await prisma.project.update({
      where: { id: project.id },
      data: { salesMode },
    });
    if (salesMode === "floors") floors += 1;
    else plans += 1;
  }

  console.log(`Backfill done. Updated to floors=${floors}, plans=${plans} (of ${projects.length} building projects).`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
