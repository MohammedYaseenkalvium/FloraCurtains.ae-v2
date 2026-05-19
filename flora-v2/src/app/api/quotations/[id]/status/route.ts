import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const statusSchema = z.object({
  status: z.enum(["DRAFT","SENT","APPROVED","REJECTED","REVISED"]),
});

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const parsed = statusSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const quotation = await db.quotation.update({
    where: { id },
    data: { status: parsed.data.status },
  });

  if (parsed.data.status === "APPROVED") {
    await db.enquiry.update({
      where: { id: quotation.enquiryId },
      data: { status: "NEGOTIATING" },
    });
  }

  if (parsed.data.status === "REJECTED") {
    await db.enquiry.update({
      where: { id: quotation.enquiryId },
      data: { status: "QUOTED" },
    });
  }

  return NextResponse.json(quotation);
}