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
import { getSiteVisit } from "@/lib/site-visits";

type Context = {
  params: Promise<{ id: string }>;
};

const updateSiteVisitSchema = z.object({
  scheduledAt: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  completedAt: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  assignedTo: z
    .string()
    .min(1)
    .optional()
    .nullable(),

  status: z
    .enum([
      "SCHEDULED",
      "COMPLETED",
      "CANCELLED",
    ])
    .optional(),

  siteAddress: z
    .string()
    .trim()
    .optional()
    .nullable(),

  notes: z
    .string()
    .trim()
    .optional()
    .nullable(),
});

/**
 * GET /api/site-visits/:id
 */
export const GET = withErrorHandling(
  async (
    _req: NextRequest,
    { params }: Context
  ) => {
    await requireAuth();

    const { id } = await params;

    try {
      const siteVisit = await getSiteVisit(id);

      return NextResponse.json(siteVisit);
    } catch (error) {
      if (
        error instanceof Error &&
        error.message === "Site visit not found"
      ) {
        throw notFound("Site visit not found");
      }

      throw error;
    }
  }
);

/**
 * PATCH /api/site-visits/:id
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
      updateSiteVisitSchema
    );

    const existing = await db.siteVisit.findUnique({
      where: { id },
      include: {
        enquiry: {
          include: {
            contact: true,
          },
        },
      },
    });

    if (!existing) {
      throw notFound("Site visit not found");
    }

    /*
     * Automatically set completedAt when a visit
     * changes to COMPLETED.
     */
    let completedAt: Date | null | undefined =
      existing.completedAt;

    if (data.completedAt !== undefined) {
      completedAt = data.completedAt
        ? new Date(data.completedAt)
        : null;
    } else if (
      data.status === "COMPLETED" &&
      !existing.completedAt
    ) {
      completedAt = new Date();
    }

    /*
     * If the visit is moved away from COMPLETED,
     * clear completedAt unless explicitly supplied.
     */
    if (
      data.status &&
      data.status !== "COMPLETED" &&
      data.completedAt === undefined
    ) {
      completedAt = null;
    }

    const siteVisit = await db.$transaction(async (tx) => {
      const updated = await tx.siteVisit.update({
        where: { id },

        data: {
          ...(data.scheduledAt !== undefined
            ? {
                scheduledAt: data.scheduledAt
                  ? new Date(data.scheduledAt)
                  : null,
              }
            : {}),

          ...(data.completedAt !== undefined ||
          data.status !== undefined
            ? {
                completedAt,
              }
            : {}),

          ...(data.assignedTo !== undefined
            ? {
                assignedTo: data.assignedTo,
              }
            : {}),

          ...(data.status !== undefined
            ? {
                status: data.status,
              }
            : {}),

          ...(data.siteAddress !== undefined
            ? {
                siteAddress: data.siteAddress,
              }
            : {}),

          ...(data.notes !== undefined
            ? {
                notes: data.notes,
              }
            : {}),

          updatedById: session.user.id,
        },

        include: {
          enquiry: {
            include: {
              contact: true,
              company: true,
            },
          },

          project: true,

          measurements: {
            orderBy: {
              createdAt: "asc",
            },
          },

          attachments: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });

      await logActivity(
        {
          session,
          action:
            data.status &&
            data.status !== existing.status
              ? "STATUS_CHANGE"
              : "UPDATE",
          entityType: "SiteVisit",
          entityId: updated.id,
          summary:
            data.status &&
            data.status !== existing.status
              ? `Site visit status changed from ${existing.status} to ${data.status}`
              : `Updated site visit for ${existing.enquiry.contact.name}`,
          meta: {
            previousStatus: existing.status,
            newStatus: data.status ?? existing.status,
          },
        },
        tx
      );

      return updated;
    });

    return NextResponse.json(siteVisit);
  }
);