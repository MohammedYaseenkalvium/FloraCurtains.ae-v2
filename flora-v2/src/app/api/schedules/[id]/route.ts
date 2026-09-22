import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireAuth,
  requireRole,
  parseBody,
  notFound,
  badRequest,
  withErrorHandling,
} from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { calculateScheduleTotal, roundMoney } from "@/lib/payment-schedule";

type Ctx = { params: Promise<{ id: string }> };

const patchSchema = z.object({
  description: z.string().trim().min(1).optional(),
  amount: z.coerce.number().positive().optional(),
  dueType: z
    .enum([
      "EXACT_DATE",
      "ON_APPROVAL",
      "BEFORE_PRODUCTION",
      "BEFORE_INSTALLATION",
      "ON_INSTALLATION",
      "ON_COMPLETION",
    ])
    .optional(),
  dueDate: z.string().nullable().optional(),
  status: z.enum(["PENDING", "PARTIALLY_PAID", "PAID", "OVERDUE", "CANCELLED"]).optional(),
  notes: z.string().nullable().optional(),
});

/**
 * PATCH /api/schedules/:id — edit one milestone.
 * Amount changes re-validate the plan total against the contract value so
 * schedules and contract value can never silently diverge.
 */
export const PATCH = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, patchSchema);

  const updated = await db.$transaction(async (tx) => {
    const existing = await tx.paymentSchedule.findUnique({
      where: { id },
      include: { project: { select: { id: true, totalContractValue: true, deletedAt: true } } },
    });
    if (!existing || existing.project.deletedAt) throw notFound("Payment schedule not found.");

    if (v.dueType === "EXACT_DATE" && !v.dueDate && !existing.dueDate) {
      throw badRequest("An exact due date is required for EXACT_DATE milestones.");
    }

    const next = await tx.paymentSchedule.update({
      where: { id },
      data: {
        ...(v.description !== undefined ? { description: v.description } : {}),
        ...(v.amount !== undefined ? { amount: v.amount } : {}),
        ...(v.dueType !== undefined ? { dueType: v.dueType } : {}),
        ...(v.dueDate !== undefined ? { dueDate: v.dueDate ? new Date(v.dueDate) : null } : {}),
        ...(v.status !== undefined ? { status: v.status } : {}),
        ...(v.notes !== undefined ? { notes: v.notes || null } : {}),
      },
    });

    if (v.amount !== undefined) {
      const siblings = await tx.paymentSchedule.findMany({
        where: { projectId: existing.projectId, status: { not: "CANCELLED" } },
        select: { amount: true },
      });
      const total = calculateScheduleTotal(siblings);
      if (Math.abs(total - roundMoney(existing.project.totalContractValue)) > 0.01) {
        throw badRequest(
          `Schedule total must equal the contract value after this change (now ${total.toLocaleString("en-AE", { minimumFractionDigits: 2 })}).`
        );
      }
    }

    await logActivity(
      {
        session,
        action: "UPDATE",
        entityType: "PaymentSchedule",
        entityId: id,
        summary: `Updated payment milestone "${next.description}".`,
      },
      tx
    );

    return next;
  });

  return NextResponse.json(updated);
});

/**
 * DELETE /api/schedules/:id — remove one milestone (ADMIN, never a PAID one).
 */
export const DELETE = withErrorHandling(async (_req: NextRequest, { params }: Ctx) => {
  const session = await requireRole("ADMIN");
  const { id } = await params;

  await db.$transaction(async (tx) => {
    const existing = await tx.paymentSchedule.findUnique({
      where: { id },
      select: { id: true, description: true, status: true, projectId: true },
    });
    if (!existing) throw notFound("Payment schedule not found.");
    if (existing.status === "PAID" || existing.status === "PARTIALLY_PAID") {
      throw badRequest("A milestone that is being paid cannot be deleted.");
    }

    await tx.paymentSchedule.delete({ where: { id } });
    await logActivity(
      {
        session,
        action: "DELETE",
        entityType: "PaymentSchedule",
        entityId: id,
        summary: `Deleted payment milestone "${existing.description}".`,
      },
      tx
    );

    // Keep sequences contiguous after a delete.
    const rest = await tx.paymentSchedule.findMany({
      where: { projectId: existing.projectId },
      orderBy: { sequence: "asc" },
      select: { id: true },
    });
    for (const [i, row] of rest.entries()) {
      await tx.paymentSchedule.update({ where: { id: row.id }, data: { sequence: i + 1 } });
    }
  });

  return NextResponse.json({ success: true });
});
