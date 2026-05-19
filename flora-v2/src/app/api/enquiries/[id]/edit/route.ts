import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const editSchema = z.object({
  serviceWanted:  z.string().min(3).optional(),
  remarks:        z.string().optional(),
  desiredBudget:  z.coerce.number().optional(),
  interestLevel: z.coerce.number().min(1).max(5).optional(),
  assignedTo:     z.string().optional(),
  followUpDate:   z.string().optional(),
  status:         z.enum(["NEW","CONTACTED","VISIT_SCHEDULED","QUOTED","NEGOTIATING","WON","LOST"]).optional(),
  siteAddress:    z.string().optional(),
  projectName:    z.string().optional(),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = editSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const updateData: any = {};
  const v = parsed.data;
  if (v.serviceWanted !== undefined) updateData.serviceWanted = v.serviceWanted;
  if (v.remarks !== undefined) updateData.remarks = v.remarks;
  if (v.desiredBudget !== undefined) updateData.desiredBudget = v.desiredBudget;
  if (v.interestLevel !== undefined) updateData.interestLevel = v.interestLevel;
  if (v.assignedTo !== undefined) updateData.assignedTo = v.assignedTo;
  if (v.followUpDate !== undefined) updateData.followUpDate = v.followUpDate ? new Date(v.followUpDate) : null;
  if (v.status !== undefined) updateData.status = v.status;
  if (v.siteAddress !== undefined) updateData.siteAddress = v.siteAddress;
  if (v.projectName !== undefined) updateData.projectName = v.projectName;

  const enquiry = await db.enquiry.update({
    where: { id },
    data: updateData,
    include: { contact: true, company: true },
  });

  return NextResponse.json(enquiry);
}