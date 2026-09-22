import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireRole, notFound, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

/**
 * DELETE /api/attachments/:id — unlink a file from its site visit (ADMIN).
 */
export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Ctx) => {
  const session = await requireRole("ADMIN");
  const { id } = await params;

  await db.$transaction(async (tx) => {
    const existing = await tx.siteVisitAttachment.findUnique({
      where: { id },
      select: { id: true, fileName: true, siteVisitId: true },
    });
    if (!existing) throw notFound("Attachment not found.");

    await tx.siteVisitAttachment.delete({ where: { id } });
    await logActivity(
      {
        session,
        action: "DELETE",
        entityType: "SiteVisitAttachment",
        entityId: id,
        summary: `Removed attachment ${existing.fileName}.`,
        meta: { siteVisitId: existing.siteVisitId },
      },
      tx
    );
  });

  return NextResponse.json({ success: true });
});
