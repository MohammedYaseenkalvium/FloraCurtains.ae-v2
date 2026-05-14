import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { quotationFormSchema } from "@/types";
import type { QuotationLineItem } from "@/types";

function calcTotals(items: QuotationLineItem[], vatRate: number) {
  const subtotal = items.reduce((sum, it) => {
    return sum + it.qty * it.unitPrice * (1 - it.discount / 100);
  }, 0);
  const vatAmount   = subtotal * (vatRate / 100);
  const totalAmount = subtotal + vatAmount;
  return { subtotal, vatAmount, totalAmount };
}

let quoteCounter = 1000; // In production, store this in DB

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = quotationFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const v       = parsed.data;
  const totals  = calcTotals(v.items, v.vatRate);
  quoteCounter++;
  const quoteNumber = `FLR-${new Date().getFullYear()}-${String(quoteCounter).padStart(4, "0")}`;

  const quotation = await db.quotation.create({
    data: {
      enquiryId:     v.enquiryId,
      quoteNumber,
      items:         v.items,
      vatRate:       v.vatRate,
      ...totals,
      validUntil:    v.validUntil ? new Date(v.validUntil) : undefined,
      notes:         v.notes,
      internalNotes: v.internalNotes,
      billedToName:  v.billedToName,
      billedToTrn:   v.billedToTrn,
      billedToAddr:  v.billedToAddr,
      status:        "DRAFT",
    },
  });

  // Also bump enquiry status to QUOTED
  await db.enquiry.update({ where: { id: v.enquiryId }, data: { status: "QUOTED" } });

  return NextResponse.json(quotation, { status: 201 });
}