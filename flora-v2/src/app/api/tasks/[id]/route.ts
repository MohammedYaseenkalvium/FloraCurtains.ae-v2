import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  title: z.string().min(1).optional(),
  assignedTo: z.string().nullable().optional(),
  done: z.boolean().optional(),
  dueDate: z.string().nullable().optional(),
  priority: z.enum(["LOW", "MEDIUM", "HIGH"]).optional(),
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, patchSchema);

  const data: Record<string, unknown> = {};
  if (v.title !== undefined) data.title = v.title;
  if (v.assignedTo !== undefined) data.assignedTo = v.assignedTo;
  if (v.priority !== undefined) data.priority = v.priority;
  if (v.dueDate !== undefined) data.dueDate = v.dueDate ? new Date(v.dueDate) : null;
  if (v.done !== undefined) {
    data.done = v.done;
    data.doneAt = v.done ? new Date() : null;
  }

  const task = await db.task.update({ where: { id }, data });
  return NextResponse.json(task);
});

export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;

  await db.task.delete({ where: { id } });

  await logActivity({
    session,
    action: "DELETE",
    entityType: "Task",
    entityId: id,
    summary: "Deleted task",
  });

  return NextResponse.json({ success: true });
});
