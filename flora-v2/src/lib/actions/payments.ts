"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";

interface CreatePaymentInput {
    quotationId: string;
    amount: number;
    method: "CASH" | "CARD" | "BANK_TRANSFER" | "CHEQUE";
    reference?: string;
    notes?: string;
}

export async function createPayment(input: CreatePaymentInput) {
  const session = await auth();
  if (!session) throw new Error("Unauthorized");

  const payment = await db.payment.create({
    data: {
      quotationId: input.quotationId,
      amount: input.amount,
      method: input.method,
      reference: input.reference || null,
      notes: input.notes || null,
    } as any, // temporary cast to bypass type check
  });

  revalidatePath(`/dashboard/quotations/${input.quotationId}`);
  return payment;
}

export async function getPayments(quotationId: string) {
    const session = await auth();
    if (!session) throw new Error("Unauthorized");

    return db.payment.findMany({
        where: { quotationId },
        orderBy: { paidAt: "desc" },
    });
}