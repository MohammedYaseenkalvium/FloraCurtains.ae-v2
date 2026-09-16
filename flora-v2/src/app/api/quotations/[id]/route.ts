import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { quotationFormSchema } from "@/types";
import {
  conflict,
  notFound,
  parseBody,
  requireAuth,
  withErrorHandling,
} from "@/lib/api";
import { calcTotals } from "@/lib/quotation";
import { logActivity } from "@/lib/activity";

type Ctx = {
  params: Promise<{ id: string }>;
};

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const session = await requireAuth();
    const { id } = await params;

    const v = await parseBody(req, quotationFormSchema);

    const quotation = await db.quotation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!quotation) {
      throw notFound("Quotation not found");
    }

    /*
     * Approved quotations are locked.
     * They must go through the revision workflow instead.
     */
    if (quotation.status === "APPROVED") {
      throw conflict(
        "Approved quotations cannot be edited. Create a revision instead."
      );
    }

    /*
     * The enquiry belonging to the quotation cannot be changed.
     */
    if (v.enquiryId !== quotation.enquiryId) {
      throw conflict(
        "Quotation enquiry cannot be changed."
      );
    }

    /*
     * Always calculate financial values on the server.
     * Never trust totals sent by the browser.
     */
    const totals = calcTotals(
      v.items,
      v.vatRate
    );

    const updated = await db.$transaction(
      async (tx) => {
        /*
         * Re-check the quotation inside the transaction
         * to avoid updating a record that may have changed
         * between the initial read and the update.
         */
        const current = await tx.quotation.findFirst({
          where: {
            id,
            deletedAt: null,
          },
        });

        if (!current) {
          throw notFound("Quotation not found");
        }

        if (current.status === "APPROVED") {
          throw conflict(
            "Approved quotations cannot be edited. Create a revision instead."
          );
        }

        const result = await tx.quotation.update({
          where: {
            id,
          },
          data: {
            /*
             * enquiryId and quoteNumber intentionally remain
             * unchanged.
             */
            items: v.items,
            vatRate: v.vatRate,

            ...totals,

            validUntil: v.validUntil
              ? new Date(v.validUntil)
              : null,

            notes: v.notes,
            internalNotes: v.internalNotes,

            billedToName: v.billedToName,
            billedToTrn: v.billedToTrn,
            billedToAddr: v.billedToAddr,

            updatedById: session.user.id,
          },
        });

        await logActivity(
          {
            session,
            action: "UPDATE",
            entityType: "Quotation",
            entityId: result.id,
            summary: `Updated quotation ${result.quoteNumber} (AED ${totals.totalAmount.toLocaleString()})`,
          },
          tx
        );

        return result;
      }
    );

    return NextResponse.json(updated);
  }
);