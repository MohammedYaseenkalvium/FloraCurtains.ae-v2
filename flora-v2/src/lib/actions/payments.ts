"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { logActivity } from "@/lib/activity";
import type { PaymentMethod, PaymentType } from "@prisma/client";

interface CreatePaymentInput {
  quotationId: string;
  amount: number;
  type: PaymentType;
  method: PaymentMethod;
  reference?: string;
  notes?: string;
  paidAt?: string;
}

export async function createPayment(input: CreatePaymentInput) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  if (!(input.amount > 0)) throw new Error("Amount must be greater than zero");

  const payment = await db.$transaction(async (tx) => {
    const quotation = await tx.quotation.findUnique({
      where: { id: input.quotationId },
      include: { payments: true },
    });
    if (!quotation) throw new Error("Quotation not found");

    const alreadyPaid = quotation.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = quotation.totalAmount - alreadyPaid;
    if (input.amount > remaining + 0.01) {
      throw new Error(
        `Payment exceeds the outstanding balance of AED ${remaining.toLocaleString()}`
      );
    }

    const created = await tx.payment.create({
      data: {
        quotationId: input.quotationId,
        amount: input.amount,
        type: input.type,
        method: input.method,
        reference: input.reference || null,
        notes: input.notes || null,
        paidAt: input.paidAt ? new Date(input.paidAt) : new Date(),
        createdById: session.user.id,
      },
    });

    await logActivity(
      {
        session,
        action: "CREATE",
        entityType: "Payment",
        entityId: created.id,
        summary: `Recorded ${input.type} payment of AED ${input.amount.toLocaleString()} on ${quotation.quoteNumber}`,
      },
      tx
    );

    return created;
  });

  revalidatePath(`/quotations/${input.quotationId}`);
  revalidatePath("/payments");
  return payment;
}

export async function getPayments(quotationId: string) {
  const session = await auth();
  if (!session?.user) throw new Error("Unauthorized");

  return db.payment.findMany({
    where: { quotationId },
    orderBy: { paidAt: "desc" },
  });
}
