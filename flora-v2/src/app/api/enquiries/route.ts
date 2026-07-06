import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiryFormSchema } from "@/types";
import { requireAuth, parseBody, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";
import type { EnquiryStatus } from "@prisma/client";

export const GET = withErrorHandling(async (req: NextRequest) => {
  await requireAuth();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") as EnquiryStatus | null;
  const page = Math.max(1, parseInt(searchParams.get("page") ?? "1", 10) || 1);
  const pageSize = 20;

  const where = {
    deletedAt: null,
    ...(status ? { status } : {}),
  };

  const [data, total] = await Promise.all([
    db.enquiry.findMany({
      where,
      include: { contact: true, company: true, quotations: true, project: true, tasks: true },
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
    db.enquiry.count({ where }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
});

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  const v = await parseBody(req, enquiryFormSchema);

  const enquiry = await db.$transaction(async (tx) => {
    let companyId: string | undefined;
    if (v.customerType === "B2B" && v.companyName) {
      const existingCompany = await tx.company.findFirst({
        where: { tradeName: v.companyName },
      });
      companyId = existingCompany
        ? existingCompany.id
        : (
            await tx.company.create({
              data: {
                tradeName: v.companyName,
                type: v.companyType ?? "OTHER",
                trn: v.companyTrn,
              },
            })
          ).id;
    }

    const existingContact = await tx.contact.findFirst({
      where: { phone: v.contactPhone },
    });

    const contact = existingContact
      ? await tx.contact.update({
          where: { id: existingContact.id },
          data: { name: v.contactName, email: v.contactEmail || undefined, companyId },
        })
      : await tx.contact.create({
          data: {
            name: v.contactName,
            phone: v.contactPhone,
            email: v.contactEmail || undefined,
            source: v.contactSource,
            role: v.contactRole ?? "OTHER",
            companyId,
          },
        });

    const created = await tx.enquiry.create({
      data: {
        contactId: contact.id,
        companyId,
        customerType: v.customerType,
        serviceWanted: v.serviceWanted,
        remarks: v.remarks,
        desiredBudget: v.desiredBudget,
        interestLevel: v.interestLevel,
        projectName: v.projectName,
        siteAddress: v.siteAddress,
        assignedTo: v.assignedTo,
        followUpDate: v.followUpDate ? new Date(v.followUpDate) : undefined,
        status: "NEW",
        createdById: session.user.id,
        updatedById: session.user.id,
      },
      include: { contact: true, company: true },
    });

    await logActivity(
      {
        session,
        action: "CREATE",
        entityType: "Enquiry",
        entityId: created.id,
        summary: `Logged enquiry for ${created.contact.name}`,
      },
      tx
    );

    return created;
  });

  return NextResponse.json(enquiry, { status: 201 });
});
