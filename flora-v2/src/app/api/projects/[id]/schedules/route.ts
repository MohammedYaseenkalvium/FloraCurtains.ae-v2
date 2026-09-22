import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import {
  requireAuth,
  parseBody,
  notFound,
  badRequest,
  conflict,
  withErrorHandling,
} from "@/lib/api";
import { logActivity } from "@/lib/activity";
import { validatePaymentSchedule } from "@/lib/payment-schedule";

type Ctx = { params: Promise<{ id: string }> };

const milestoneSchema = z.object({
  description: z.string().trim().min(1, "Description is required."),
  percentage: z.coerce.number().positive().max(100).optional(),
  amount: z.coerce.number().positive("Amount must be greater than zero."),
  dueType: z.enum([
    "EXACT_DATE",
    "ON_APPROVAL",
    "BEFORE_PRODUCTION",
    "BEFORE_INSTALLATION",
    "ON_INSTALLATION",
    "ON_COMPLETION",
  ]),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
});

const replaceSchema = z.object({
  schedules: z.array(milestoneSchema).min(1, "At least one milestone is required."),
});

/**
 * GET /api/projects/:id/schedules — list milestones for a project.
 */
export const GET = withErrorHandling(async (_req: NextRequest, { params }: Ctx) => {
  await requireAuth();
  const { id } = await params;
  const project = await db.project.findFirst({
    where: { id, deletedAt: null },
    select: { id: true },
  });
  if (!project) throw notFound("Project not found.");

  const schedules = await db.paymentSchedule.findMany({
    where: { projectId: id },
    orderBy: { sequence: "asc" },
  });
  return NextResponse.json(schedules);
});

/**
 * POST /api/projects/:id/schedules — replace the full milestone plan.
 * Body: { schedules: [{ description, percentage?, amount, dueType, dueDate?, notes? }] }
 * Business rules (src/lib/payment-schedule.ts): total must equal contract
 * value; percentages all-or-none and summing to 100; EXACT_DATE requires a date.
 */
export const POST = withErrorHandling(async (req: NextRequest, { params }: Ctx) => {
  const session = await requireAuth();
  const { id } = await params;
  const v = await parseBody(req, replaceSchema);

  const created = await db.$transaction(async (tx) => {
    const project = await tx.project.findFirst({
      where: { id, deletedAt: null },
      select: { id: true, totalContractValue: true },
    });
    if (!project) throw notFound("Project not found.");

    const blocking = await tx.paymentSchedule.findFirst({
      where: { projectId: id, status: { in: ["PARTIALLY_PAID", "PAID"] } },
      select: { id: true },
    });
    if (blocking) {
      throw conflict("Schedule cannot be replaced once a milestone is being paid.");
    }

    const check = validatePaymentSchedule(project.totalContractValue, v.schedules);
    if (!check.valid) throw badRequest(check.error);

    await tx.paymentSchedule.deleteMany({ where: { projectId: id } });
    await tx.paymentSchedule.createMany({
      data: v.schedules.map((s, i) => ({
        projectId: id,
        sequence: i + 1,
        description: s.description,
        percentage: s.percentage ?? null,
        amount: s.amount,
        dueType: s.dueType,
        dueDate: s.dueDate ? new Date(s.dueDate) : null,
        notes: s.notes || null,
      })),
    });

    await logActivity(
      {
        session,
        action: "UPDATE",
        entityType: "PaymentSchedule",
        entityId: id,
        summary: `Set ${v.schedules.length} payment milestone(s) for project.`,
      },
      tx
    );

    return tx.paymentSchedule.findMany({
      where: { projectId: id },
      orderBy: { sequence: "asc" },
    });
  });

  return NextResponse.json(created, { status: 201 });
});
