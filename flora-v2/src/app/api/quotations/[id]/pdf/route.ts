import { NextRequest, NextResponse } from "next/server";
import React from "react";
import { renderToStream } from "@react-pdf/renderer";
import { db } from "@/lib/db";
import { QuotationPDF } from "@/lib/pdf";
import { requireAuth, notFound, withErrorHandling } from "@/lib/api";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_req: NextRequest, { params }: Ctx) => {
  await requireAuth();
  const { id } = await params;

  const quotation = await db.quotation.findUnique({
    where: { id },
    include: { enquiry: { include: { contact: true, company: true } } },
  });
  if (!quotation) throw notFound();

  const element = React.createElement(QuotationPDF, { quotation });
  const stream = await renderToStream(
    element as unknown as Parameters<typeof renderToStream>[0]
  );

  return new NextResponse(stream as unknown as ReadableStream, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${quotation.quoteNumber}.pdf"`,
    },
  });
});
