import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { enquiryFormSchema } from "@/types";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(req.url);
  const status    = searchParams.get("status")   || undefined;
  const page      = parseInt(searchParams.get("page") ?? "1");
  const pageSize  = 20;

  const [data, total] = await Promise.all([
    db.enquiry.findMany({
      where:   status ? { status: status as any } : undefined,
      include: { contact: true, company: true, quotations: true, project: true, tasks: true },
      orderBy: { createdAt: "desc" },
      skip:    (page - 1) * pageSize,
      take:    pageSize,
    }),
    db.enquiry.count({ where: status ? { status: status as any } : undefined }),
  ]);

  return NextResponse.json({ data, total, page, pageSize });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const parsed = enquiryFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const v = parsed.data;

  // Upsert company (B2B only)
  let companyId: string | undefined;
  if (v.customerType === "B2B" && v.companyName) {
    const company = await db.company.upsert({
      where:  { tradeName: v.companyName } as any,
      update: {},
      create: {
        tradeName:  v.companyName,
        type:       v.companyType ?? "OTHER",
        trn:        v.companyTrn,
      },
    });
    companyId = company.id;
  }

  // Upsert contact (by phone)
  const contact = await db.contact.upsert({
    where:  { phone: v.contactPhone } as any,
    update: { name: v.contactName, email: v.contactEmail || undefined, companyId },
    create: {
      name:      v.contactName,
      phone:     v.contactPhone,
      email:     v.contactEmail || undefined,
      source:    v.contactSource,
      role:      v.contactRole ?? "OTHER",
      companyId,
    },
  });

  const enquiry = await db.enquiry.create({
    data: {
      contactId:     contact.id,
      companyId,
      customerType:  v.customerType,
      serviceWanted: v.serviceWanted,
      remarks:       v.remarks,
      desiredBudget: v.desiredBudget,
      interestLevel: v.interestLevel,
      projectName:   v.projectName,
      siteAddress:   v.siteAddress,
      assignedTo:    v.assignedTo,
      followUpDate:  v.followUpDate ? new Date(v.followUpDate) : undefined,
      status:        "NEW",
    },
    include: { contact: true, company: true },
  });

  return NextResponse.json(enquiry, { status: 201 });
}