import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const convertSchema = z.object({
  totalContractValue: z.coerce.number().positive(),
  startDate:          z.string().optional(),
  endDate:            z.string().optional(),
  installationDate:   z.string().optional(),
  siteAddress:        z.string().optional(),
  poNumber:           z.string().optional(),
  poDate:             z.string().optional(),
  notes:              z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();
  const parsed = convertSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const enquiry = await db.enquiry.findUnique({
    where: { id },
    include: { company: true },
  });
  if (!enquiry) return NextResponse.json({ error: "Enquiry not found" }, { status: 404 });

  const existing = await db.project.findUnique({ where: { enquiryId: id } });
  if (existing) return NextResponse.json({ error: "Project already exists" }, { status: 409 });

  const v = parsed.data;

  const project = await db.project.create({
    data: {
      enquiryId:          id,
      companyId:          enquiry.companyId,
      totalContractValue: v.totalContractValue,
      status:             "NOT_STARTED",
      startDate:          v.startDate ? new Date(v.startDate) : null,
      endDate:            v.endDate ? new Date(v.endDate) : null,
      installationDate:   v.installationDate ? new Date(v.installationDate) : null,
      siteAddress:        v.siteAddress ?? enquiry.siteAddress,
      poNumber:           v.poNumber,
      poDate:             v.poDate ? new Date(v.poDate) : null,
      notes:              v.notes,
    },
  });

  await db.enquiry.update({ where: { id }, data: { status: "WON" } });

  return NextResponse.json(project, { status: 201 });
}