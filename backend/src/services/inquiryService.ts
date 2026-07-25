import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";
import { ensureDefaultLeadStatuses } from "./leadStatusService.js";

export async function createInquiry(input: {
  fullName: string;
  phone: string;
  email?: string;
  interestedProject?: string;
  message?: string;
  kind?: string;
}) {
  await ensureDefaultLeadStatuses();
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

export async function updateInquiry(
  id: string,
  input: {
    status?: string;
    fullName?: string;
    phone?: string;
    email?: string;
    interestedProject?: string;
    message?: string;
    kind?: string | null;
  }
) {
  const existing = await prisma.inquiry.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Inquiry not found");

  if (input.status !== undefined) {
    await ensureDefaultLeadStatuses();
    const status = String(input.status).trim();
    const allowed = await prisma.leadStatus.findFirst({
      where: { value: status, active: true },
    });
    if (!allowed) throw httpError(400, "Invalid or inactive status");
  }

  return prisma.inquiry.update({
    where: { id },
    data: {
      status: input.status !== undefined ? String(input.status).trim() : undefined,
      fullName: input.fullName !== undefined ? String(input.fullName).trim() : undefined,
      phone: input.phone !== undefined ? String(input.phone).trim() : undefined,
      email: input.email !== undefined ? String(input.email).trim() : undefined,
      interestedProject:
        input.interestedProject !== undefined ? String(input.interestedProject).trim() : undefined,
      message: input.message !== undefined ? String(input.message) : undefined,
      kind:
        input.kind === undefined
          ? undefined
          : input.kind === null || input.kind === ""
            ? null
            : String(input.kind).trim(),
    },
  });
}
