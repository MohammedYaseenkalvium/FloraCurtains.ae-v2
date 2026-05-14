import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const enquiry = await db.enquiry.findUnique({
    where:   { id: params.id },
    include: { contact: true, company: true, quotations: true, project: { include: { payments: true } }, tasks: true },
  });
  if (!enquiry) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(enquiry);
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const enquiry = await db.enquiry.update({ where: { id: params.id }, data: body });
  return NextResponse.json(enquiry);
}