import type { PaymentScheduleDueType } from "@prisma/client";

export type PaymentScheduleInput = {
  description: string;
  percentage?: number;
  amount: number;
  dueType: PaymentScheduleDueType;
  dueDate?: string;
  notes?: string;
};

export function roundMoney(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateScheduleAmount(
  contractValue: number,
  percentage: number
): number {
  return roundMoney(contractValue * (percentage / 100));
}

export function calculateScheduleTotal(
  schedules: Array<{ amount: number }>
): number {
  return roundMoney(
    schedules.reduce(
      (sum, schedule) => sum + Number(schedule.amount || 0),
      0
    )
  );
}

export function calculatePercentageTotal(
  schedules: Array<{ percentage?: number | null }>
): number {
  return roundMoney(
    schedules.reduce(
      (sum, schedule) =>
        sum + Number(schedule.percentage ?? 0),
      0
    )
  );
}

export function validatePaymentSchedule(
  contractValue: number,
  schedules: PaymentScheduleInput[]
): { valid: true } | { valid: false; error: string } {
  if (!Number.isFinite(contractValue) || contractValue <= 0) {
    return {
      valid: false,
      error: "Contract value must be greater than zero.",
    };
  }

  if (schedules.length === 0) {
    return {
      valid: false,
      error: "At least one payment milestone is required.",
    };
  }

  for (const [index, schedule] of schedules.entries()) {
    const milestone = index + 1;

    if (!schedule.description.trim()) {
      return {
        valid: false,
        error: `Payment milestone ${milestone} needs a description.`,
      };
    }

    if (!Number.isFinite(schedule.amount) || schedule.amount <= 0) {
      return {
        valid: false,
        error: `Payment milestone ${milestone} must have a valid amount.`,
      };
    }

    if (
      schedule.percentage !== undefined &&
      (
        !Number.isFinite(schedule.percentage) ||
        schedule.percentage <= 0 ||
        schedule.percentage > 100
      )
    ) {
      return {
        valid: false,
        error: `Payment milestone ${milestone} has an invalid percentage.`,
      };
    }

    if (
      schedule.dueType === "EXACT_DATE" &&
      !schedule.dueDate
    ) {
      return {
        valid: false,
        error: `Payment milestone ${milestone} requires a due date.`,
      };
    }

    if (
      schedule.dueType !== "EXACT_DATE" &&
      schedule.dueDate
    ) {
      return {
        valid: false,
        error:
          `Payment milestone ${milestone} should not have an exact date.`,
      };
    }
  }

  const total = calculateScheduleTotal(schedules);

  if (Math.abs(total - roundMoney(contractValue)) > 0.01) {
    return {
      valid: false,
      error:
        `Payment schedule total AED ${total.toLocaleString(
          "en-AE",
          {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }
        )} must equal contract value AED ${roundMoney(
          contractValue
        ).toLocaleString("en-AE", {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })}.`,
    };
  }

  const hasPercentages = schedules.some(
    (schedule) => schedule.percentage !== undefined
  );

  const allHavePercentages = schedules.every(
    (schedule) => schedule.percentage !== undefined
  );

  if (hasPercentages && !allHavePercentages) {
    return {
      valid: false,
      error:
        "Either use percentages for all milestones or use fixed AED amounts.",
    };
  }

  if (allHavePercentages) {
    const percentageTotal =
      calculatePercentageTotal(schedules);

    if (Math.abs(percentageTotal - 100) > 0.01) {
      return {
        valid: false,
        error:
          `Payment percentages must total 100%. Currently they total ${percentageTotal}%.`,
      };
    }
  }

  return {
    valid: true,
  };
}