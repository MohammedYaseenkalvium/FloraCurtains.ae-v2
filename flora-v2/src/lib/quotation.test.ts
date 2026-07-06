import { describe, it, expect } from "vitest";
import { calcTotals, nextQuoteNumber, quoteNumberPrefix } from "./quotation";
import type { QuotationLineItem } from "@/types";

const item = (over: Partial<QuotationLineItem> = {}): QuotationLineItem => ({
  description: "Curtain",
  unit: "pcs",
  qty: 1,
  unitPrice: 100,
  discount: 0,
  ...over,
});

describe("calcTotals", () => {
  it("computes subtotal, VAT and total for a single item", () => {
    const r = calcTotals([item({ qty: 2, unitPrice: 100 })], 5);
    expect(r.subtotal).toBe(200);
    expect(r.vatAmount).toBe(10);
    expect(r.totalAmount).toBe(210);
  });

  it("applies per-line percentage discounts", () => {
    const r = calcTotals([item({ qty: 1, unitPrice: 100, discount: 10 })], 5);
    expect(r.subtotal).toBe(90);
    expect(r.vatAmount).toBe(4.5);
    expect(r.totalAmount).toBe(94.5);
  });

  it("sums multiple line items", () => {
    const r = calcTotals(
      [item({ qty: 2, unitPrice: 50 }), item({ qty: 1, unitPrice: 200, discount: 50 })],
      5
    );
    expect(r.subtotal).toBe(200); // 100 + 100
    expect(r.totalAmount).toBe(210);
  });

  it("returns zeros for an empty list", () => {
    expect(calcTotals([], 5)).toEqual({ subtotal: 0, vatAmount: 0, totalAmount: 0 });
  });

  it("rounds to two decimal places", () => {
    const r = calcTotals([item({ qty: 3, unitPrice: 33.33, discount: 0 })], 5);
    expect(r.subtotal).toBe(99.99);
    expect(r.vatAmount).toBe(5);
    expect(r.totalAmount).toBe(104.99);
  });

  it("supports a zero VAT rate", () => {
    const r = calcTotals([item({ qty: 1, unitPrice: 100 })], 0);
    expect(r.vatAmount).toBe(0);
    expect(r.totalAmount).toBe(100);
  });
});

describe("nextQuoteNumber", () => {
  it("starts at 1001 when there is no prior quote", () => {
    expect(nextQuoteNumber(2026, null)).toBe("FLR-2026-1001");
  });

  it("increments the latest counter", () => {
    expect(nextQuoteNumber(2026, "FLR-2026-1042")).toBe("FLR-2026-1043");
  });

  it("ignores a malformed latest value and falls back to the start", () => {
    expect(nextQuoteNumber(2026, "garbage")).toBe("FLR-2026-1001");
  });

  it("uses the requested year in the prefix", () => {
    expect(nextQuoteNumber(2027, null)).toBe("FLR-2027-1001");
  });

  it("pads the counter to four digits", () => {
    expect(nextQuoteNumber(2026, "FLR-2026-1098").endsWith("1099")).toBe(true);
  });
});

describe("quoteNumberPrefix", () => {
  it("formats the prefix", () => {
    expect(quoteNumberPrefix(2026)).toBe("FLR-2026-");
  });
});
