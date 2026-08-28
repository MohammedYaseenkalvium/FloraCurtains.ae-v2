import { NextRequest, NextResponse } from "next/server";

import { requireAuth, withErrorHandling, notFound } from "@/lib/api";
import { getSiteVisit } from "@/lib/site-visits";

type Context = {
  params: Promise<{ id: string }>;
};

/**
 * GET /api/site-visits/:id
 *
 * Returns one site visit including:
 * - enquiry
 * - contact
 * - company
 * - project
 * - measurement sheets
 * - attachments
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