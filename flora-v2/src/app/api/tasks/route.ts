import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

const taskSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  enquiryId: z.string().optional(),
  projectId: z.string().optional(),
  assignedTo: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).default("MEDIUM"),
});

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth();

  const { searchParams } = new URL(req.url);
  const enquiryId = searchParams.get("enquiryId") || undefined;
  const projectId = searchParams.get("projectId") || undefined;

  const tasks = await db.task.findMany({
    where: { enquiryId, projectId },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: { enquiry: { include: { contact: true } }, project: true },
  });

  return NextResponse.json(tasks);
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  const data = await parseBody(req, taskSchema);

  const task = await db.task.create({
    data: {
      ...data,
      dueDate: data.dueDate ? new Date(data.dueDate) : null,
    },
  });

  await logActivity({
    session,
    action: "CREATE",
    entityType: "Task",
    entityId: task.id,
    summary: `Created task "${task.title}"`,
  });

  return NextResponse.json(task, { status: 201 });
});
