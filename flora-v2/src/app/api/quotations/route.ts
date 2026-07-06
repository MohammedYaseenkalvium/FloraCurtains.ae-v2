import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotationFormSchema } from "@/types";
import { requireAuth, parseBody, notFound, withErrorHandling } from "@/lib/api";
import { calcTotals, generateQuoteNumber } from "@/lib/quotation";
import { logActivity } from "@/lib/activity";

export const POST = withErrorHandling(async (req: NextRequest) => {
  const session = await requireAuth();
  const v = await parseBody(req, quotationFormSchema);
  const totals = calcTotals(v.items, v.vatRate);

  const quotation = await db.$transaction(async (tx) => {
    const enquiry = await tx.enquiry.findFirst({
      where: { id: v.enquiryId, deletedAt: null },
    });
    if (!enquiry) throw notFound("Enquiry not found");

    const quoteNumber = await generateQuoteNumber(tx);

    const created = await tx.quotation.create({
      data: {
        enquiryId: v.enquiryId,
        quoteNumber,
        items: v.items,
        vatRate: v.vatRate,
        ...totals,
        validUntil: v.validUntil ? new Date(v.validUntil) : undefined,
        notes: v.notes,
        internalNotes: v.internalNotes,
        billedToName: v.billedToName,
        billedToTrn: v.billedToTrn,
        billedToAddr: v.billedToAddr,
        status: "DRAFT",
        createdById: session.user.id,
        updatedById: session.user.id,
      },
    });

    await tx.enquiry.update({
      where: { id: v.enquiryId },
      data: { status: "QUOTED", updatedById: session.user.id },
    });

    await logActivity(
      {
        session,
        action: "CREATE",
        entityType: "Quotation",
        entityId: created.id,
        summary: `Created quotation ${quoteNumber} (AED ${totals.totalAmount.toLocaleString()})`,
      },
      tx
    );

    return created;
  });

  return NextResponse.json(quotation, { status: 201 });
});
