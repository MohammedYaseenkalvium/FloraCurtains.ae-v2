import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquiryFormSchema } from "@/types";
import { withErrorHandling, parseBody } from "@/lib/api";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const v = await parseBody(req, enquiryFormSchema);

  const enquiry = await db.$transaction(async (tx) => {
    const existingContact = await tx.contact.findFirst({
      where: { phone: v.contactPhone },
    });

    const contact = existingContact
      ? await tx.contact.update({
          where: { id: existingContact.id },
          data: {
            name: v.contactName,
            email: v.contactEmail || undefined,
          },
        })
      : await tx.contact.create({
          data: {
            name: v.contactName,
            phone: v.contactPhone,
            email: v.contactEmail || undefined,
            source: "WEBSITE",
            role: v.contactRole ?? "OTHER",
          },
        });

    return tx.enquiry.create({
      data: {
        contactId: contact.id,
        customerType: "B2C",
        serviceWanted: v.serviceWanted,
        remarks: v.remarks,
        desiredBudget: v.desiredBudget,
        interestLevel: v.interestLevel ?? 3,
        projectName: v.projectName,
        siteAddress: v.siteAddress,
        status: "NEW",
      },
      include: {
        contact: true,
        company: true,
      },
    });
  });

  return NextResponse.json(
    {
      success: true,
      enquiry,
    },
    { status: 201 }
  );
});