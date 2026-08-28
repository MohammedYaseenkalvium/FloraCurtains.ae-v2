import { db } from "@/lib/db";
import type { Prisma } from "@prisma/client";

export type SiteVisitWithDetails = Prisma.SiteVisitGetPayload<{
  include: {
    enquiry: {
      include: {
        contact: true;
        company: true;
      };
    };
    project: true;
    measurements: true;
    attachments: true;
  };
}>;

/**
 * Get one site visit with its enquiry, project,
 * measurement sheets, and attachments.
 */
export async function getSiteVisit(id: string) {
  const visit = await db.siteVisit.findUnique({
    where: { id },
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

  if (!visit) {
    throw new Error("Site visit not found");
  }

  return visit;
}

/**
 * Get all site visits.
 *
 * Can optionally filter by enquiry or project.
 */
export async function getSiteVisits(options?: {
  enquiryId?: string;
  projectId?: string;
}) {
  const where: Prisma.SiteVisitWhereInput = {
    ...(options?.enquiryId
      ? { enquiryId: options.enquiryId }
      : {}),
    ...(options?.projectId
      ? { projectId: options.projectId }
      : {}),
  };

  return db.siteVisit.findMany({
    where,
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
    orderBy: {
      scheduledAt: "desc",
    },
  });
}

/**
 * Get all site visits for an enquiry.
 */
export async function getEnquirySiteVisits(enquiryId: string) {
  return getSiteVisits({ enquiryId });
}

/**
 * Get all site visits for a project.
 */
export async function getProjectSiteVisits(projectId: string) {
  return getSiteVisits({ projectId });
}