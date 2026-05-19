import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const taskSchema = z.object({
  title:       z.string().min(1),
  description: z.string().optional(),
  enquiryId:   z.string().optional(),
  projectId:   z.string().optional(),
  assignedTo:  z.string().optional(),
  dueDate:     z.string().optional(),
  priority:    z.enum(["LOW","MEDIUM","HIGH"]).default("MEDIUM"),
});

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const enquiryId = searchParams.get("enquiryId") || undefined;
  const projectId = searchParams.get("projectId") || undefined;

  const tasks = await db.task.findMany({
    where: { enquiryId: enquiryId || undefined, projectId: projectId || undefined },
    orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
    include: { enquiry: { include: { contact: true } }, project: true },
  });

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = taskSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const task = await db.task.create({
    data: {
      ...parsed.data,
      dueDate: parsed.data.dueDate ? new Date(parsed.data.dueDate) : null,
    },
  });

  return NextResponse.json(task, { status: 201 });
}