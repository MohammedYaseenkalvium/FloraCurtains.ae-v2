import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import {
  requireAuth,
  parseBody,
  parseQuery,
  withErrorHandling,
  notFound,
} from "@/lib/api";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/activity";

const createMeasurementSchema = z.object({
  siteVisitId: z.string().min(1, "Site visit is required"),

  roomName: z
    .string()
    .trim()
    .min(1, "Room name is required"),

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
    .positive("Width must be greater than 0"),

  height: z.coerce
    .number()
    .positive("Height must be greater than 0"),

  unit: z.enum([
  "MM",
  "CM",
  "M",
  "FT",
  "IN",
]),

  quantity: z.coerce
    .number()
    .int()
    .positive()
    .default(1),

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

const listQuerySchema = z.object({
  siteVisitId: z.string().min(1, "siteVisitId is required"),
});

/**
 * GET /api/measurements?siteVisitId=...
 */
export const GET = withErrorHandling(
  async (req: NextRequest) => {
    await requireAuth();

    const { siteVisitId } = parseQuery(req, listQuerySchema);

    const measurements =
      await db.measurementSheet.findMany({
        where: {
          siteVisitId,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

    return NextResponse.json(measurements);
  }
);

/**
 * POST /api/measurements
 */
export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const session = await requireAuth();

    const data = await parseBody(
      req,
      createMeasurementSchema
    );

    const siteVisit =
      await db.siteVisit.findUnique({
        where: {
          id: data.siteVisitId,
        },
        include: {
          enquiry: {
            include: {
              contact: true,
            },
          },
          project: true,
        },
      });

    if (!siteVisit) {
      throw notFound("Site visit not found");
    }

    const measurement =
      await db.$transaction(async (tx) => {
        const created =
          await tx.measurementSheet.create({
            data: {
              siteVisitId: data.siteVisitId,
              roomName: data.roomName,
              openingName:
                data.openingName ?? null,
              openingType:
                data.openingType ?? null,
              width: data.width,
              height: data.height,
              unit: data.unit,
              quantity: data.quantity,
              curtainType:
                data.curtainType ?? null,
              trackType:
                data.trackType ?? null,
              remarks: data.remarks ?? null,
            },
          });

        await logActivity(
          {
            session,
            action: "CREATE",
            entityType: "MeasurementSheet",
            entityId: created.id,
            summary: `Added measurement for ${siteVisit.enquiry.contact.name}`,
            meta: {
              siteVisitId: data.siteVisitId,
              projectId:
                siteVisit.projectId ?? null,
              roomName: data.roomName,
              openingName:
                data.openingName ?? null,
              width: data.width,
              height: data.height,
              unit: data.unit,
              quantity: data.quantity,
            },
          },
          tx
        );

        return created;
      });

    return NextResponse.json(measurement, {
      status: 201,
    });
  }
);