import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();

  const updateData: any = {};
  if (body.assignedTo !== undefined) updateData.assignedTo = body.assignedTo;
  if (body.done !== undefined) {
    updateData.done = body.done;
    updateData.doneAt = body.done ? new Date() : null;
  }
  if (body.dueDate !== undefined) updateData.dueDate = body.dueDate ? new Date(body.dueDate) : null;
  if (body.priority !== undefined) updateData.priority = body.priority;
  if (body.title !== undefined) updateData.title = body.title;

  const task = await db.task.update({ where: { id }, data: updateData });
  return NextResponse.json(task);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  await db.task.delete({ where: { id } });
  return NextResponse.json({ success: true });
}