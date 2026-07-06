import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, notFound, conflict, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

const convertSchema = z.object({
  totalContractValue: z.coerce.number().positive(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  installationDate: z.string().optional(),
  siteAddress: z.string().optional(),
  poNumber: z.string().optional(),
  poDate: z.string().optional(),
  notes: z.string().optional(),
  quotationId: z.string().optional(),
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, convertSchema);

  const project = await db.$transaction(async (tx) => {
    const enquiry = await tx.enquiry.findFirst({
      where: { id, deletedAt: null },
      include: { company: true },
    });
    if (!enquiry) throw notFound("Enquiry not found");

    const existing = await tx.project.findUnique({ where: { enquiryId: id } });
    if (existing) throw conflict("Project already exists");

    const created = await tx.project.create({
      data: {
        enquiryId: id,
        companyId: enquiry.companyId,
        quotationId: v.quotationId,
        totalContractValue: v.totalContractValue,
        status: "NOT_STARTED",
        startDate: v.startDate ? new Date(v.startDate) : null,
        endDate: v.endDate ? new Date(v.endDate) : null,
        installationDate: v.installationDate ? new Date(v.installationDate) : null,
        siteAddress: v.siteAddress ?? enquiry.siteAddress,
        poNumber: v.poNumber,
        poDate: v.poDate ? new Date(v.poDate) : null,
        notes: v.notes,
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });

    await tx.enquiry.update({
      where: { id },
      data: { status: "WON", updatedById: session.user.id },
    });

    await logActivity(
      {
        session,
        action: "CREATE",
        entityType: "Project",
        entityId: created.id,
        summary: `Converted enquiry to project (AED ${v.totalContractValue.toLocaleString()})`,
      },
      tx
    );

    return created;
  });

  return NextResponse.json(project, { status: 201 });
});
