import { prisma } from "../db.js";

export async function getAdminDashboardStats() {
  const [projects, apartments, inquiries, views, recentInquiries] = await Promise.all([
    prisma.project.count(),
    prisma.apartment.groupBy({
      by: ["status"],
      _count: { _all: true },
    }),
    prisma.inquiry.count(),
    prisma.projectView.count(),
    prisma.inquiry.findMany({
      orderBy: { createdAt: "desc" },
      take: 5,
      select: {
        id: true,
        fullName: true,
        phone: true,
        message: true,
        interestedProject: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  const byStatus = Object.fromEntries(apartments.map((row) => [row.status, row._count._all]));

  return {
    projects,
    available: byStatus.Available ?? 0,
    sold: byStatus.Sold ?? 0,
    reserved: byStatus.Reserved ?? 0,
    inquiries,
    views,
    recentInquiries,
  };
}
