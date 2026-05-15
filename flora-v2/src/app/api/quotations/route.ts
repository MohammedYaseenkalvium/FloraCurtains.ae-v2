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

async function generateQuoteNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = `FLR-${year}-`;

  const latest = await db.quotation.findFirst({
    where: { quoteNumber: { startsWith: prefix } },
    orderBy: { quoteNumber: "desc" },
  });

  let counter = 1000;
  if (latest) {
    const match = latest.quoteNumber.match(/-\d{4}$/);
    if (match) {
      counter = Math.max(counter, parseInt(match[0].slice(1)));
    }
  }
  counter++;

  return `${prefix}${String(counter).padStart(4, "0")}`;
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body   = await req.json();
  const parsed = quotationFormSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const v       = parsed.data;
  const totals  = calcTotals(v.items, v.vatRate);
  const quoteNumber = await generateQuoteNumber();

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

  await db.enquiry.update({ where: { id: v.enquiryId }, data: { status: "QUOTED" } });

  return NextResponse.json(quotation, { status: 201 });
}