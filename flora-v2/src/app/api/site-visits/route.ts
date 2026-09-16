import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { db } from "@/lib/db";
import {
  requireAuth,
  parseBody,
  withErrorHandling,
  notFound,
} from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { getSiteVisits } from "@/lib/site-visits";

const createSiteVisitSchema = z.object({
  enquiryId: z.string().min(1, "Enquiry is required"),

  projectId: z
    .string()
    .min(1)
    .optional()
    .nullable(),

  scheduledAt: z
    .string()
    .datetime()
    .optional()
    .nullable(),

  assignedTo: z
    .string()
    .min(1)
    .optional()
    .nullable(),

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
 * GET /api/site-visits
 *
 * Optional filters:
 *   ?enquiryId=...
 *   ?projectId=...
 */
export const GET = withErrorHandling(
  async (req: NextRequest) => {
    await requireAuth();

    const { searchParams } = new URL(req.url);

    const enquiryId = searchParams.get("enquiryId") || undefined;
    const projectId = searchParams.get("projectId") || undefined;

    const siteVisits = await getSiteVisits({
      enquiryId,
      projectId,
    });

    return NextResponse.json(siteVisits);
  }
);

/**
 * POST /api/site-visits
 */
export const POST = withErrorHandling(
  async (req: NextRequest) => {
    const session = await requireAuth();

    const data = await parseBody(
      req,
      createSiteVisitSchema
    );

    /*
     * Make sure the enquiry exists and isn't deleted.
     */
    const enquiry = await db.enquiry.findFirst({
      where: {
        id: data.enquiryId,
        deletedAt: null,
      },
      include: {
        contact: true,
        company: true,
      },
    });

    if (!enquiry) {
      throw notFound("Enquiry not found");
    }

    /*
     * If a project was supplied, make sure it exists
     * and belongs to the same enquiry.
     */
    if (data.projectId) {
      const project = await db.project.findFirst({
        where: {
          id: data.projectId,
          enquiryId: data.enquiryId,
          deletedAt: null,
        },
      });

      if (!project) {
        throw notFound(
          "Project not found or does not belong to this enquiry"
        );
      }
    }

    /*
     * Use the enquiry's site address when one wasn't
     * explicitly supplied.
     */
    const siteAddress =
      data.siteAddress ?? enquiry.siteAddress ?? null;

    const siteVisit = await db.$transaction(async (tx) => {
      const created = await tx.siteVisit.create({
        data: {
          enquiryId: data.enquiryId,
          projectId: data.projectId ?? null,

          scheduledAt: data.scheduledAt
            ? new Date(data.scheduledAt)
            : null,

          assignedTo: data.assignedTo ?? null,

          siteAddress,

          notes: data.notes ?? null,

          status: "SCHEDULED",

          createdById: session.user.id,
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

          measurements: true,

          attachments: true,
        },
      });

      await logActivity(
        {
          session,
          action: "CREATE",
          entityType: "SiteVisit",
          entityId: created.id,
          summary: `Scheduled site visit for ${enquiry.contact.name}`,
          meta: {
            enquiryId: data.enquiryId,
            projectId: data.projectId ?? null,
            scheduledAt: data.scheduledAt ?? null,
          },
        },
        tx
      );

      return created;
    });

    return NextResponse.json(siteVisit, {
      status: 201,
    });
  }
);