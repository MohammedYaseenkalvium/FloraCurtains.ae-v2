import { describe, expect, it } from "vitest";
import { FIELD_STEPS, isEmailLike, isPlausiblePhone, parseBudgetAed } from "./validation";

describe("parseBudgetAed", () => {
  it("parses a plain number", () => {
    expect(parseBudgetAed("5000")).toBe(5000);
  });

  it("parses AED-prefixed thousands with separators", () => {
    expect(parseBudgetAed("AED 5,000")).toBe(5000);
  });

  it("parses the first number in prose", () => {
    expect(parseBudgetAed("approx 12000 AED")).toBe(12000);
  });

  it("parses decimals", () => {
    expect(parseBudgetAed("5250.50")).toBe(5250.5);
  });

  it("returns null for empty or numberless input", () => {
    expect(parseBudgetAed("")).toBe(null);
    expect(parseBudgetAed(undefined)).toBe(null);
    expect(parseBudgetAed("call me")).toBe(null);
  });

  it("takes digits only without multipliers", () => {
    expect(parseBudgetAed("5k")).toBe(5);
  });
});

describe("isPlausiblePhone", () => {
  it("accepts UAE mobile, landline and international formats", () => {
    expect(isPlausiblePhone("+971557464100")).toBe(true);
    expect(isPlausiblePhone("0557464100")).toBe(true);
    expect(isPlausiblePhone("+971 2 586 4545")).toBe(true);
    expect(isPlausiblePhone("+44 20 7946 0958")).toBe(true);
  });

  it("rejects letters, too-short and empty input", () => {
    expect(isPlausiblePhone("abcde@@@@@")).toBe(false);
    expect(isPlausiblePhone("123")).toBe(false);
    expect(isPlausiblePhone("")).toBe(false);
  });
});

describe("isEmailLike", () => {
  it("accepts standard addresses", () => {
    expect(isEmailLike("user@example.com")).toBe(true);
  });

  it("rejects malformed addresses", () => {
    expect(isEmailLike("not-an-email")).toBe(false);
    expect(isEmailLike("a@b")).toBe(false);
  });
});

describe("FIELD_STEPS", () => {
  it("maps every payload field to a wizard step", () => {
    for (const field of ["name", "email", "phone", "customerType", "projectName", "siteAddress", "serviceWanted", "budget", "notes"]) {
      expect(FIELD_STEPS[field]).toBeGreaterThanOrEqual(0);
    }
  });
});
