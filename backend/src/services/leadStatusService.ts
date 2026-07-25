import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";

const DEFAULT_STATUSES: { value: string; label: string; sortOrder: number }[] = [
  { value: "new", label: "Նոր", sortOrder: 0 },
  { value: "read", label: "Կարդացված", sortOrder: 1 },
  { value: "archived", label: "Արխիվ", sortOrder: 2 },
];

function slugifyValue(input: string): string {
  const base = input
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48);
  return base || `status-${Date.now().toString(36)}`;
}

export async function ensureDefaultLeadStatuses() {
  const count = await prisma.leadStatus.count();
  if (count > 0) return;
  await prisma.leadStatus.createMany({ data: DEFAULT_STATUSES });
}

export async function listLeadStatuses(opts?: { activeOnly?: boolean }) {
  await ensureDefaultLeadStatuses();
  return prisma.leadStatus.findMany({
    where: opts?.activeOnly ? { active: true } : undefined,
    orderBy: [{ sortOrder: "asc" }, { label: "asc" }],
  });
}

export async function createLeadStatus(input: {
  label: string;
  value?: string;
  sortOrder?: number;
  active?: boolean;
}) {
  const label = input.label.trim();
  if (!label) throw httpError(400, "Label is required");

  let value = (input.value || slugifyValue(label)).trim().toLowerCase();
  if (!value) value = slugifyValue(label);

  const existing = await prisma.leadStatus.findUnique({ where: { value } });
  if (existing) throw httpError(409, "Status value already exists");

  const maxSort = await prisma.leadStatus.aggregate({ _max: { sortOrder: true } });
  const sortOrder =
    input.sortOrder !== undefined ? Number(input.sortOrder) : (maxSort._max.sortOrder ?? -1) + 1;

  return prisma.leadStatus.create({
    data: {
      label,
      value,
      sortOrder,
      active: input.active !== false,
    },
  });
}

export async function updateLeadStatus(
  id: string,
  input: { label?: string; value?: string; sortOrder?: number; active?: boolean }
) {
  const existing = await prisma.leadStatus.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Status not found");

  const data: {
    label?: string;
    value?: string;
    sortOrder?: number;
    active?: boolean;
  } = {};

  if (input.label !== undefined) {
    const label = String(input.label).trim();
    if (!label) throw httpError(400, "Label is required");
    data.label = label;
  }

  if (input.value !== undefined) {
    const value = String(input.value).trim().toLowerCase();
    if (!value) throw httpError(400, "Value is required");
    if (value !== existing.value) {
      const clash = await prisma.leadStatus.findUnique({ where: { value } });
      if (clash) throw httpError(409, "Status value already exists");
      data.value = value;
      // Keep inquiry rows in sync when renaming the machine value
      await prisma.inquiry.updateMany({
        where: { status: existing.value },
        data: { status: value },
      });
    }
  }

  if (input.sortOrder !== undefined) data.sortOrder = Number(input.sortOrder);
  if (input.active !== undefined) data.active = Boolean(input.active);

  return prisma.leadStatus.update({ where: { id }, data });
}

export async function deleteLeadStatus(id: string) {
  const existing = await prisma.leadStatus.findUnique({ where: { id } });
  if (!existing) throw httpError(404, "Status not found");

  const inUse = await prisma.inquiry.count({ where: { status: existing.value } });
  if (inUse > 0) {
    throw httpError(400, "Cannot delete a status that is used by leads. Deactivate it instead.");
  }

  await prisma.leadStatus.delete({ where: { id } });
  return { ok: true };
}
