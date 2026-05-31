import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { renderToStream } from "@react-pdf/renderer";
import { QuotationPDF } from "@/lib/pdf";
import React from "react";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth();
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await params;

    const quotation = await db.quotation.findUnique({
      where:   { id },
      include: { enquiry: { include: { contact: true, company: true } } },
    });
    if (!quotation) return NextResponse.json({ error: "Not found" }, { status: 404 });

    console.log("Rendering PDF for quotation:", quotation.quoteNumber);
    console.log("Items:", JSON.stringify(quotation.items)?.slice(0, 200));

    const stream = await renderToStream(React.createElement(QuotationPDF, { quotation } as any) as any);

    return new NextResponse(stream as any, {
      headers: {
        "Content-Type":        "application/pdf",
        "Content-Disposition": `inline; filename="${quotation.quoteNumber}.pdf"`,
      },
    });
  } catch (error: any) {
    console.error("PDF generation error:", error);
    console.error("Stack:", error.stack);
    return NextResponse.json(
      { error: "PDF generation failed", message: error.message, stack: error.stack },
      { status: 500 }
    );
  }
}