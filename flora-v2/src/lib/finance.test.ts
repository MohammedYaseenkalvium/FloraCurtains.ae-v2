import { describe, it, expect } from "vitest";
import { calcLifetimeRevenue, calcOutstanding, sumPayments, roundMoney, formatAED } from "./finance";

describe("finance canonical helpers", () => {
  it("sums payments and rounds", () => {
    expect(sumPayments([{ amount: 100 }, { amount: 20.005 }])).toBe(120.01);
    expect(sumPayments([])).toBe(0);
  });

  it("computes lifetime revenue without double-counting converted quotes", () => {
    const r = calcLifetimeRevenue({
      projects: [{ totalContractValue: 1000, quotationId: "q1" }],
      approvedQuotations: [
        { id: "q1", totalAmount: 900 },
        { id: "q2", totalAmount: 500 },
      ],
    });
    expect(r.projectValues).toBe(1000);
    expect(r.standaloneQuotes).toBe(500);
    expect(r.lifetimeRevenue).toBe(1500);
  });

  it("clamps outstanding at zero instead of surfacing negative credit", () => {
    expect(calcOutstanding(1000, 400)).toBe(600);
    expect(calcOutstanding(1000, 1200)).toBe(0);
  });

  it("rounds money to 2 decimals", () => {
    expect(roundMoney(10.005)).toBe(10.01);
  });

  it("formats AED consistently", () => {
    expect(formatAED(1000)).toContain("1,000.00");
    expect(formatAED(1000, { decimals: false })).toContain("1,000");
  });

  it("handles empty revenue inputs", () => {
    const r = calcLifetimeRevenue({ projects: [], approvedQuotations: [] });
    expect(r.lifetimeRevenue).toBe(0);
    expect(calcOutstanding(r.lifetimeRevenue, 0)).toBe(0);
  });
});
