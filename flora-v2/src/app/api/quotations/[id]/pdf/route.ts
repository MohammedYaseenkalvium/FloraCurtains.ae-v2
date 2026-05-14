import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationPDF } from "@/lib/pdf";
import React from "react";

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const quotation = await db.quotation.findUnique({
    where:   { id: params.id },
    include: { enquiry: { include: { contact: true, company: true } } },
  });
  if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const stream = await renderToStream(React.createElement(QuotationPDF, { quotation } as any) as any);

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type":        "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.quoteNumber}.pdf"`,
    },
  });
}