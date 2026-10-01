import { describe, it, expect } from "vitest";
import {
  calcCredit,
  calcLifetimeRevenue,
  calcOutstanding,
  calcPortfolioSummary,
  formatAED,
  roundMoney,
  sumPayments,
  sumQuotationTotals,
  type PortfolioInputs,
} from "./finance";

const portfolioInputs = (over: Partial<PortfolioInputs> = {}): PortfolioInputs => ({
  projects: [{ totalContractValue: 1000, quotationId: "q1" }],
  approvedQuotations: [
    { id: "q1", totalAmount: 900 },
    { id: "q2", totalAmount: 500 },
  ],
  payments: [{ amount: 250 }, { amount: 300 }],
  ...over,
});

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

describe("calcCredit", () => {
  it("returns the overpayment only when payments exceed lifetime revenue", () => {
    expect(calcCredit(1500, 1600)).toBe(100);
    expect(calcCredit(1500, 1500)).toBe(0);
    expect(calcCredit(1500, 1000)).toBe(0);
    expect(calcCredit(1000, 1010.006)).toBe(10.01);
  });

  it("header contract: credit is the rounded overpayment when totalPaid exceeds lifetimeRevenue", () => {
    expect(calcCredit(2000, 2100.5)).toBe(100.5);
    expect(calcCredit(900, 1010.006)).toBe(110.01);
  });

  it("header contract: credit clamps to zero when lifetime revenue covers every payment", () => {
    expect(calcCredit(2000, 2000)).toBe(0);
    expect(calcCredit(2000, 1900)).toBe(0);
  });
});

describe("calcPortfolioSummary", () => {
  it("computes the representative mixed-data fixture without double-counting converted quotes", () => {
    const r = calcPortfolioSummary(portfolioInputs());
    expect(r.projectValues).toBe(1000);
    expect(r.standaloneQuotes).toBe(500);
    expect(r.lifetimeRevenue).toBe(1500);
    expect(r.totalPaid).toBe(550);
    expect(r.outstanding).toBe(950);
    expect(r.credit).toBe(0);
  });

  it("splits an overpayment into outstanding 0 and credit above zero", () => {
    const r = calcPortfolioSummary(portfolioInputs({ payments: [{ amount: 1600 }] }));
    expect(r.outstanding).toBe(0);
    expect(r.credit).toBe(100);
  });

  it("returns zeros for empty inputs", () => {
    const r = calcPortfolioSummary({ projects: [], approvedQuotations: [], payments: [] });
    expect(r.projectValues).toBe(0);
    expect(r.standaloneQuotes).toBe(0);
    expect(r.lifetimeRevenue).toBe(0);
    expect(r.totalPaid).toBe(0);
    expect(r.outstanding).toBe(0);
    expect(r.credit).toBe(0);
  });

  it("composes the canonical outstanding and credit formulas", () => {
    const r = calcPortfolioSummary(portfolioInputs());
    expect(r.outstanding).toBe(calcOutstanding(r.lifetimeRevenue, r.totalPaid));
    expect(r.credit).toBe(calcCredit(r.lifetimeRevenue, r.totalPaid));
    expect(r.projectValues + r.standaloneQuotes).toBe(r.lifetimeRevenue);
  });

  it("header contract: calcPortfolioSummary contract guards keep outstanding and credit mutually exclusive", () => {
    const inputs = {
      projects: [{ totalContractValue: 2500, quotationId: "qP" }],
      approvedQuotations: [{ id: "qP", totalAmount: 2400 }],
      payments: [{ amount: 2600 }],
    };
    const overpaid = calcPortfolioSummary(inputs);
    expect(overpaid.outstanding).toBe(0);
    expect(overpaid.credit).toBe(100);

    const settled = calcPortfolioSummary({ ...inputs, payments: [{ amount: 2400 }] });
    expect(settled.credit).toBe(0);
    expect(settled.outstanding).toBe(100);
    expect(settled.outstanding).toBe(calcOutstanding(2500, 2400));
  });

  it("header contract: outstanding derives from lifetime revenue composed of project values plus standalone quotes", () => {
    const r = calcPortfolioSummary({
      projects: [{ totalContractValue: 2000, quotationId: "qA" }],
      approvedQuotations: [
        { id: "qA", totalAmount: 1800 },
        { id: "qB", totalAmount: 400 },
      ],
      payments: [{ amount: 900 }],
    });
    expect(r.projectValues).toBe(2000);
    expect(r.standaloneQuotes).toBe(400);
    expect(r.lifetimeRevenue).toBe(2400);
    expect(r.outstanding).toBe(1500);
  });

  it("header contract: zero outstanding and credit figures render as AED 0 through formatAED", () => {
    const r = calcPortfolioSummary({ projects: [], approvedQuotations: [], payments: [] });
    expect(r.outstanding).toBe(0);
    expect(r.credit).toBe(0);
    expect(formatAED(r.outstanding, { decimals: false })).toBe("AED 0");
  });
});

describe("sumQuotationTotals", () => {
  it("sums quotation totals and rounds", () => {
    expect(sumQuotationTotals([{ totalAmount: 100 }, { totalAmount: 200.005 }])).toBe(300.01);
    expect(sumQuotationTotals([])).toBe(0);
  });

  it("header contract: sumQuotationTotals rounds the sum of all quotation totals", () => {
    expect(
      sumQuotationTotals([{ totalAmount: 1000 }, { totalAmount: 2000.5 }, { totalAmount: 3000.25 }])
    ).toBe(6000.75);
  });
});
