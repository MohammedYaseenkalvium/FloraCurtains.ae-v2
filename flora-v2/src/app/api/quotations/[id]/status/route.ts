import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

const statusSchema = z.object({
  status: z.enum(["DRAFT", "SENT", "APPROVED", "REJECTED", "REVISED"]),
});

export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const { status } = await parseBody(req, statusSchema);

  const quotation = await db.$transaction(async (tx) => {
    const updated = await tx.quotation.update({
      where: { id },
      data: { status, updatedById: session.user.id },
    });

    if (status === "APPROVED") {
      await tx.enquiry.update({
        where: { id: updated.enquiryId },
        data: { status: "NEGOTIATING" },
      });
    } else if (status === "REJECTED") {
      await tx.enquiry.update({
        where: { id: updated.enquiryId },
        data: { status: "QUOTED" },
      });
    }

    await logActivity(
      {
        session,
        action: "STATUS_CHANGE",
        entityType: "Quotation",
        entityId: id,
        summary: `Quotation ${updated.quoteNumber} marked ${status}`,
      },
      tx
    );

    return updated;
  });

  return NextResponse.json(quotation);
});
