import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  requireAuth,
  parseBody,
  withErrorHandling,
  notFound,
} from "@/lib/api";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

type Context = {
  params: Promise<{ id: string }>;
};

const updateMeasurementSchema = z.object({
  roomName: z
    .string()
    .trim()
    .min(1)
    .optional(),

  openingName: z
    .string()
    .trim()
    .optional()
    .nullable(),

  openingType: z
    .string()
    .trim()
    .optional()
    .nullable(),

  width: z.coerce
    .number()
    .positive()
    .optional(),

  height: z.coerce
    .number()
    .positive()
    .optional(),

  
   unit: z
  .enum([
    "MM",
    "CM",
    "M",
    "FT",
    "IN",
  ])
  .optional(),

  quantity: z.coerce
    .number()
    .int()
    .positive()
    .optional(),

  curtainType: z
    .string()
    .trim()
    .optional()
    .nullable(),

  trackType: z
    .string()
    .trim()
    .optional()
    .nullable(),

  remarks: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

/**
 * PATCH /api/measurements/:id
 */
export const PATCH = withErrorHandling(
  async (
    req: NextRequest,
    { params }: Context
  ) => {
    const session = await requireAuth();
    const { id } = await params;

    const data = await parseBody(
      req,
      updateMeasurementSchema
    );

    const existing =
      await db.measurementSheet.findUnique({
        where: { id },
        include: {
          siteVisit: {
            include: {
              enquiry: {
                include: {
                  contact: true,
                },
              },
            },
          },
        },
      });

    if (!existing) {
      throw notFound("Measurement not found");
    }

    const measurement =
      await db.$transaction(async (tx) => {
        const updated =
          await tx.measurementSheet.update({
            where: { id },

            data: {
              ...(data.roomName !== undefined
                ? {
                    roomName: data.roomName,
                  }
                : {}),

              ...(data.openingName !== undefined
                ? {
                    openingName:
                      data.openingName,
                  }
                : {}),

              ...(data.openingType !== undefined
                ? {
                    openingType:
                      data.openingType,
                  }
                : {}),

              ...(data.width !== undefined
                ? {
                    width: data.width,
                  }
                : {}),

              ...(data.height !== undefined
                ? {
                    height: data.height,
                  }
                : {}),

              ...(data.unit !== undefined
                ? {
                    unit: data.unit,
                  }
                : {}),

              ...(data.quantity !== undefined
                ? {
                    quantity: data.quantity,
                  }
                : {}),

              ...(data.curtainType !== undefined
                ? {
                    curtainType:
                      data.curtainType,
                  }
                : {}),

              ...(data.trackType !== undefined
                ? {
                    trackType:
                      data.trackType,
                  }
                : {}),

              ...(data.remarks !== undefined
                ? {
                    remarks: data.remarks,
                  }
                : {}),
            },
          });

        await logActivity(
          {
            session,
            action: "UPDATE",
            entityType: "MeasurementSheet",
            entityId: updated.id,
            summary: `Updated measurement for ${existing.siteVisit.enquiry.contact.name}`,
            meta: {
              siteVisitId:
                existing.siteVisitId,
            },
          },
          tx
        );

        return updated;
      });

    return NextResponse.json(measurement);
  }
);

/**
 * DELETE /api/measurements/:id
 */
export const DELETE = withErrorHandling(
  async (
    _req: NextRequest,
    { params }: Context
  ) => {
    const session = await requireAuth();
    const { id } = await params;

    const existing =
      await db.measurementSheet.findUnique({
        where: { id },
        include: {
          siteVisit: {
            include: {
              enquiry: {
                include: {
                  contact: true,
                },
              },
            },
          },
        },
      });

    if (!existing) {
      throw notFound("Measurement not found");
    }

    await db.$transaction(async (tx) => {
      await tx.measurementSheet.delete({
        where: { id },
      });

      await logActivity(
        {
          session,
          action: "DELETE",
          entityType: "MeasurementSheet",
          entityId: id,
          summary: `Deleted measurement for ${existing.siteVisit.enquiry.contact.name}`,
          meta: {
            siteVisitId:
              existing.siteVisitId,
          },
        },
        tx
      );
    });

    return NextResponse.json({
      success: true,
    });
  }
);