import { describe, it, expect } from "vitest";
import {
  validatePaymentSchedule,
  calculateScheduleTotal,
  calculatePercentageTotal,
  type PaymentScheduleInput,
} from "./payment-schedule";

const row = (over: Partial<PaymentScheduleInput> = {}): PaymentScheduleInput => ({
  description: "Advance",
  amount: 500,
  dueType: "ON_APPROVAL",
  ...over,
});

describe("validatePaymentSchedule", () => {
  it("accepts a plan totalling the contract value", () => {
    expect(validatePaymentSchedule(1000, [row(), row({ description: "Balance" })])).toEqual({
      valid: true,
    });
  });

  it("rejects totals that differ from the contract value", () => {
    const r = validatePaymentSchedule(1000, [row()]);
    expect(r.valid).toBe(false);
  });

  it("requires at least one milestone and a positive contract", () => {
    expect(validatePaymentSchedule(1000, []).valid).toBe(false);
    expect(validatePaymentSchedule(0, [row()]).valid).toBe(false);
  });

  it("requires a due date for EXACT_DATE and forbids it elsewhere", () => {
    expect(
      validatePaymentSchedule(500, [row({ dueType: "EXACT_DATE" })]).valid
    ).toBe(false);
    expect(
      validatePaymentSchedule(500, [
        row({ dueType: "EXACT_DATE", dueDate: "2026-10-01" }),
      ]).valid
    ).toBe(true);
    expect(
      validatePaymentSchedule(500, [
        row({ dueType: "ON_APPROVAL", dueDate: "2026-10-01" }),
      ]).valid
    ).toBe(false);
  });

  it("enforces all-or-none percentages totalling 100", () => {
    expect(
      validatePaymentSchedule(1000, [
        row({ percentage: 50 }),
        row({ description: "Balance", percentage: 50, amount: 500 }),
      ]).valid
    ).toBe(true);
    expect(
      validatePaymentSchedule(1000, [
        row({ percentage: 50 }),
        row({ description: "Balance" }),
      ]).valid
    ).toBe(false);
    expect(
      validatePaymentSchedule(1000, [
        row({ percentage: 30 }),
        row({ description: "Balance", percentage: 30, amount: 500 }),
      ]).valid
    ).toBe(false);
  });

  it("rejects invalid amounts and percentages", () => {
    expect(validatePaymentSchedule(1000, [row({ amount: 0 })]).valid).toBe(false);
    expect(validatePaymentSchedule(1000, [row({ percentage: 150, amount: 1000 })]).valid).toBe(false);
  });
});

describe("schedule totals", () => {
  it("sums amounts and percentages", () => {
    expect(calculateScheduleTotal([{ amount: 400 }, { amount: 600 }])).toBe(1000);
    expect(calculatePercentageTotal([{ percentage: 40 }, { percentage: 60 }])).toBe(100);
  });
});
