import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, notFound, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

const createAttachmentSchema = z.object({
  fileName: z.string().trim().min(1, "File name is required.").max(200),
  fileUrl: z.string().trim().url("A valid file URL is required.").max(2000),
  fileType: z.string().trim().min(1, "File type is required.").max(50),
  mimeType: z.string().trim().max(100).optional(),
  caption: z.string().trim().max(500).optional(),
});

/**
 * POST /api/site-visits/:id/attachments — link a file (drive/cloud URL) to a visit.
 * Link-based by design: the app has no object-storage backend, so binary
 * uploads are out of scope; staff paste a shared-drive URL with metadata.
 */
export const POST = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, createAttachmentSchema);

  const created = await db.$transaction(async (tx) => {
    const visit = await tx.siteVisit.findUnique({
      where: { id },
      include: { enquiry: { include: { contact: true } } },
    });
    if (!visit) throw notFound("Site visit not found.");

    const attachment = await tx.siteVisitAttachment.create({
      data: {
        siteVisitId: id,
        fileName: v.fileName,
        fileUrl: v.fileUrl,
        fileType: v.fileType,
        mimeType: v.mimeType || null,
        caption: v.caption || null,
        uploadedById: session.user.id,
      },
    });

    await logActivity(
      {
        session,
        action: "CREATE",
        entityType: "SiteVisitAttachment",
        entityId: attachment.id,
        summary: `Attached ${v.fileName} to site visit for ${visit.enquiry.contact.name}.`,
        meta: { siteVisitId: id },
      },
      tx
    );

    return attachment;
  });

  return NextResponse.json(created, { status: 201 });
});
