import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAuth, parseBody, notFound, badRequest, withErrorHandling } from "@/lib/api";
import { logActivity } from "@/lib/activity";

type Ctx = { params: Promise<{ id: string }> };

const paymentSchema = z.object({
  amount: z.coerce.number().positive(),
  type: z.enum(["ADVANCE", "INSTALLMENT", "BALANCE", "RETENTION"]),
  method: z.enum(["CASH", "CARD", "BANK_TRANSFER", "CHEQUE"]),
  reference: z.string().optional(),
  notes: z.string().optional(),
  paidAt: z.string().optional(),
});

export const POST = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, paymentSchema);

  const payment = await db.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: { id, deletedAt: null },
      include: { payments: true },
    });
    if (!project) throw notFound("Project not found");

    const alreadyPaid = project.payments.reduce((sum, p) => sum + p.amount, 0);
    const remaining = project.totalContractValue - alreadyPaid;
    if (v.amount > remaining + 0.01) {
      throw badRequest(
        `Payment exceeds the outstanding balance of AED ${remaining.toLocaleString()}`
      );
    }

    const created = await tx.payment.create({
      data: {
        projectId: id,
        amount: v.amount,
        type: v.type,
        method: v.method,
        reference: v.reference || null,
        notes: v.notes || null,
        paidAt: v.paidAt ? new Date(v.paidAt) : new Date(),
        createdById: session.user.id,
      },
    });

    await logActivity(
      {
        session,
        action: "CREATE",
        entityType: "Payment",
        entityId: created.id,
        summary: `Recorded ${v.type} payment of AED ${v.amount.toLocaleString()} on project`,
      },
      tx
    );

    return created;
  });

  return NextResponse.json(payment, { status: 201 });
});
