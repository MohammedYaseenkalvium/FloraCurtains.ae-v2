import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  conflict,
  notFound,
  parseBody,
  requireAuth,
  withErrorHandling,
} from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = {
  params: Promise<{ id: string }>;
};

const statusSchema = z.object({
  status: z.enum([
    "DRAFT",
    "SENT",
    "APPROVED",
    "REJECTED",
    "REVISED",
  ]),
});

const allowedTransitions: Record<
  "DRAFT" | "SENT" | "APPROVED" | "REJECTED" | "REVISED",
  string[]
> = {
  DRAFT: ["SENT"],
  SENT: ["APPROVED", "REJECTED", "REVISED"],
  APPROVED: [],
  REJECTED: ["REVISED"],
  REVISED: ["SENT"],
};

export const PATCH = withErrorHandling(
  async (req: NextRequest, { params }: Ctx) => {
    const session = await requireAuth();
    const { id } = await params;
    const { status } = await parseBody(req, statusSchema);

    const quotation = await db.quotation.findFirst({
      where: {
        id,
        deletedAt: null,
      },
    });

    if (!quotation) {
      throw notFound("Quotation not found");
    }

    const allowed = allowedTransitions[quotation.status];

    if (!allowed.includes(status)) {
      throw conflict(
        `Quotation cannot be changed from ${quotation.status} to ${status}`
      );
    }

    const updated = await db.$transaction(async (tx) => {
      const result = await tx.quotation.update({
        where: {
          id,
        },
        data: {
          status,
          updatedById: session.user.id,
        },
      });

      if (status === "APPROVED") {
        await tx.enquiry.update({
          where: {
            id: result.enquiryId,
          },
          data: {
            status: "WON",
            updatedById: session.user.id,
          },
        });
      } else if (status === "REJECTED") {
        await tx.enquiry.update({
          where: {
            id: result.enquiryId,
          },
          data: {
            status: "QUOTED",
            updatedById: session.user.id,
          },
        });
      }

      await logActivity(
        {
          session,
          action: "STATUS_CHANGE",
          entityType: "Quotation",
          entityId: id,
          summary: `Quotation ${result.quoteNumber} marked ${status}`,
        },
        tx
      );

      return result;
    });

    return NextResponse.json(updated);
  }
);