export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const paymentSchema = z.object({
  amount:    z.coerce.number().positive(),
  type:      z.enum(["ADVANCE","INSTALLMENT","BALANCE","RETENTION"]),
  method:    z.enum(["CASH","CARD","BANK_TRANSFER","CHEQUE"]),
  reference: z.string().optional(),
  notes:     z.string().optional(),
  paidAt:    z.string().optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body   = await req.json();
  const parsed = paymentSchema.safeParse(body);
  if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten() }, { status: 422 });

  const payment = await db.payment.create({
    data: {
      projectId: id,
      ...parsed.data,
      paidAt: parsed.data.paidAt ? new Date(parsed.data.paidAt) : new Date(),
    },
  });

  return NextResponse.json(payment, { status: 201 });
}