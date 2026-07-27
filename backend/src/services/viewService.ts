import { prisma } from "../db.js";
import { httpError } from "../middleware/error.js";

export async function recordProjectView(projectId: string, sessionId: string) {
  const id = projectId.trim();
  const session = sessionId.trim().slice(0, 128);
  if (!id || !session) throw httpError(400, "projectId and sessionId are required");

  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) throw httpError(404, "Project not found");

  await prisma.projectView.upsert({
    where: { projectId_sessionId: { projectId: id, sessionId: session } },
    create: { projectId: id, sessionId: session },
    update: {},
  });

  const views = await prisma.projectView.count({ where: { projectId: id } });
  return { projectId: id, views, recorded: true };
}

export async function getProjectViewCount(projectId: string) {
  const id = projectId.trim();
  if (!id) throw httpError(400, "projectId is required");
  const project = await prisma.project.findUnique({ where: { id }, select: { id: true } });
  if (!project) throw httpError(404, "Project not found");
  const views = await prisma.projectView.count({ where: { projectId: id } });
  return { projectId: id, views };
}

export async function getTotalViewCount() {
  return prisma.projectView.count();
}
