import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  conflict,
  notFound,
  requireAuth,
  withErrorHandling,
} from "@/lib/api";
import { calcTotals, generateQuoteNumber } from "@/lib/quotation";
import { logActivity } from "@/lib/activity";
import type { QuotationLineItem } from "@/types";

type Ctx = {
  params: Promise<{ id: string }>;
};

export const POST = withErrorHandling(
  async (_req: NextRequest, { params }: Ctx) => {
    const session = await requireAuth();
    const { id } = await params;

    const newQuotation = await db.$transaction(async (tx) => {
      const original = await tx.quotation.findFirst({
        where: {
          id,
          deletedAt: null,
        },
      });

      if (!original) {
        throw notFound("Quotation not found");
      }

      /*
       * Only quotations that have been sent or rejected
       * can be revised.
       */
      if (
        original.status !== "SENT" &&
        original.status !== "REJECTED"
      ) {
        throw conflict(
          `Quotation cannot be revised from ${original.status} status`
        );
      }

      const items =
        original.items as unknown as QuotationLineItem[];

      const totals = calcTotals(
        items,
        original.vatRate
      );

      const quoteNumber =
        await generateQuoteNumber(tx);

      const created = await tx.quotation.create({
        data: {
          enquiryId: original.enquiryId,

          quoteNumber,

          items,

          vatRate: original.vatRate,

          ...totals,

          validUntil: original.validUntil,

          billedToName: original.billedToName,
          billedToTrn: original.billedToTrn,
          billedToAddr: original.billedToAddr,

          notes: original.notes,
          internalNotes: original.internalNotes,

          status: "REVISED",

          createdById: session.user.id,
          updatedById: session.user.id,
        },
      });

      /*
       * Keep the original quotation unchanged.
       * Only create an activity entry describing the revision.
       */
      await logActivity(
        {
          session,
          action: "CREATE",
          entityType: "Quotation",
          entityId: created.id,
          summary: `Created revised quotation ${quoteNumber} from ${original.quoteNumber} (AED ${totals.totalAmount.toLocaleString()})`,
          meta: {
            revisedFromQuotationId: original.id,
            revisedFromQuoteNumber: original.quoteNumber,
          },
        },
        tx
      );

      return created;
    });

    return NextResponse.json(
      newQuotation,
      { status: 201 }
    );
  }
);