import { readFileSync } from "node:fs";
import { describe, it, expect } from "vitest";
import { formatDate, formatFullDate, formatRowDate, formatTime } from "./format";

const source = readFileSync(new URL("./format.ts", import.meta.url), "utf8");

describe("formatFullDate", () => {
  it("renders the full en-AE date with a long weekday", () => {
    expect(formatFullDate(new Date(2026, 8, 30))).toBe("Wednesday, 30 September 2026");
  });
});

describe("formatDate", () => {
  it("renders day, short month and year", () => {
    expect(formatDate(new Date(2026, 8, 30))).toBe("30 Sep 2026");
  });
});

describe("formatTime", () => {
  it("renders a 12-hour en-AE clock time", () => {
    expect(formatTime(new Date(2026, 8, 30, 14, 5))).toBe("02:05 PM");
  });
});

describe("formatRowDate", () => {
  const now = new Date(2026, 8, 30, 14, 5);

  it("renders the clock time when value and now share a local calendar day", () => {
    expect(formatRowDate(new Date(2026, 8, 30, 9, 30), now)).toBe("09:30 AM");
  });

  it("renders day and short month when the year matches but the day differs", () => {
    expect(formatRowDate(new Date(2026, 8, 12), now)).toBe("12 Sep");
  });

  it("renders the full short date when the calendar year differs", () => {
    expect(formatRowDate(new Date(2025, 2, 12), now)).toBe("12 Mar 2025");
  });

  it("defaults now to the current day when no value is injected", () => {
    expect(formatRowDate(new Date())).toMatch(/^\d{2}:\d{2} (AM|PM)$/);
  });

  it("keeps relative English copy and money logic out of the module", () => {
    expect(source).not.toMatch(/yesterday|ago\b/i);
    expect(source).not.toMatch(/formatAED|calcOutstanding|sumPayments|AED /);
  });
});
