import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";

export async function createInquiry(input: {
  fullName: string;
  phone: string;
  email?: string;
  interestedProject?: string;
  message?: string;
  kind?: string;
}) {
  const inquiry = await prisma.inquiry.create({
    data: {
      fullName: input.fullName.trim(),
      phone: input.phone.trim(),
      email: (input.email || "").trim(),
      interestedProject: (input.interestedProject || "").trim(),
      message: (input.message || "").trim(),
      kind: input.kind || null,
      status: "new",
    },
  });
  return inquiry;
}

export async function listInquiries(status?: string) {
  return prisma.inquiry.findMany({
    where: status ? { status } : undefined,
    orderBy: { createdAt: "desc" },
  });
}

export async function updateInquiry(id: string, input: { status?: string }) {
  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Inquiry not found");
  return prisma.inquiry.update({
    where: { id },
    data: {
      status: input.status !== undefined ? String(input.status) : undefined,
    },
  });
}
