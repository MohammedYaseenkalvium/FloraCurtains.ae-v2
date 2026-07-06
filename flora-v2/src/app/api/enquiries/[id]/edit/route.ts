import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

const editSchema = z.object({
  serviceWanted: z.string().min(3).optional(),
  remarks: z.string().optional(),
  desiredBudget: z.coerce.number().optional(),
  interestLevel: z.coerce.number().min(1).max(5).optional(),
  assignedTo: z.string().optional(),
  followUpDate: z.string().optional(),
  status: z.enum(["NEW","CONTACTED","VISIT_SCHEDULED","QUOTED","NEGOTIATING","WON","LOST"]).optional(),
  siteAddress: z.string().optional(),
  projectName: z.string().optional(),
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, editSchema);

  const data: Record<string, unknown> = { updatedById: session.user.id };
  if (v.serviceWanted !== undefined) data.serviceWanted = v.serviceWanted;
  if (v.remarks !== undefined) data.remarks = v.remarks;
  if (v.desiredBudget !== undefined) data.desiredBudget = v.desiredBudget;
  if (v.interestLevel !== undefined) data.interestLevel = v.interestLevel;
  if (v.assignedTo !== undefined) data.assignedTo = v.assignedTo;
  if (v.followUpDate !== undefined) data.followUpDate = v.followUpDate ? new Date(v.followUpDate) : null;
  if (v.status !== undefined) data.status = v.status;
  if (v.siteAddress !== undefined) data.siteAddress = v.siteAddress;
  if (v.projectName !== undefined) data.projectName = v.projectName;

  const enquiry = await db.enquiry.update({
    where: { id },
    data,
    include: { contact: true, company: true },
  });

  await logActivity({
    session,
    action: "UPDATE",
    entityType: "Enquiry",
    entityId: id,
    summary: "Edited enquiry",
  });

  return NextResponse.json(enquiry);
});
