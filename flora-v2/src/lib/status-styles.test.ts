import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { statusStyles } from "./status-styles";

// Module-scope helpers mirror src/lib/customer-financial.test.ts: normalized
// source text is the sanctioned substitute for mocking (TESTING.md forbids
// module mocks). status-styles.ts is pure static data (no Prisma, no I/O),
// so it is imported directly; only the class-string sweep below reads raw
// source text.

const normalize = (source: string): string => source.replace(/\s+/g, " ");

const libDir = dirname(fileURLToPath(import.meta.url));
const srcDir = join(libDir, "..");

const collectSourceFiles = (dir: string): string[] => {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...collectSourceFiles(full));
    } else if (/\.(tsx|ts|jsx|js|mdx)$/.test(entry)) {
      out.push(full);
    }
  }
  return out;
};

// Sanctioned 15-hex family set, derived from the current source of
// src/lib/status-styles.ts and the 01-02-SUMMARY Normalization Log §§ A-E:
// 5 surfaces + 5 texts + 5 borders across the neutral + 4 semantic families.
// neutral: bg #F8F5F2 / text #6B625A / border #D8C9BC
// info:    bg #EEF4FA / text #185FA5 / border #B8D0E5
// warning: bg #FEF9E7 / text #854D0E / border #E6D19B
// success: bg #EDF7F3 / text #0F6E56 / border #B7D8CC
// danger:  bg #FEF2F2 / text #991B1B / border #E8BDBD
const FAMILY_HEXES = new Set([
  "#F8F5F2",
  "#6B625A",
  "#D8C9BC",
  "#EEF4FA",
  "#185FA5",
  "#B8D0E5",
  "#FEF9E7",
  "#854D0E",
  "#E6D19B",
  "#EDF7F3",
  "#0F6E56",
  "#B7D8CC",
  "#FEF2F2",
  "#991B1B",
  "#E8BDBD",
]);

describe("statusStyles canonical map (BRND-02)", () => {
  it("owns the exact 6 groups and 31 status keys", () => {
    expect(Object.keys(statusStyles).sort()).toEqual([
      "enquiry",
      "paymentSchedule",
      "project",
      "quotation",
      "siteVisit",
      "taskPriority",
    ]);
    expect(Object.keys(statusStyles.enquiry).sort()).toEqual([
      "CONTACTED",
      "LOST",
      "NEGOTIATING",
      "NEW",
      "QUOTED",
      "VISIT_SCHEDULED",
      "WON",
    ]);
    expect(Object.keys(statusStyles.quotation).sort()).toEqual([
      "APPROVED",
      "DRAFT",
      "REJECTED",
      "REVISED",
      "SENT",
    ]);
    expect(Object.keys(statusStyles.project).sort()).toEqual([
      "CANCELLED",
      "COMPLETED",
      "INSTALLATION",
      "IN_PROGRESS",
      "NOT_STARTED",
      "ON_HOLD",
      "SNAGGING",
    ]);
    expect(Object.keys(statusStyles.paymentSchedule).sort()).toEqual([
      "CANCELLED",
      "OVERDUE",
      "PAID",
      "PARTIALLY_PAID",
      "PENDING",
    ]);
    expect(Object.keys(statusStyles.siteVisit).sort()).toEqual([
      "CANCELLED",
      "COMPLETED",
      "RESCHEDULED",
      "SCHEDULED",
    ]);
    expect(Object.keys(statusStyles.taskPriority).sort()).toEqual([
      "HIGH",
      "LOW",
      "MEDIUM",
    ]);
    expect(Object.keys(statusStyles.enquiry).length).toBe(7);
    expect(Object.keys(statusStyles.quotation).length).toBe(5);
    expect(Object.keys(statusStyles.project).length).toBe(7);
    expect(Object.keys(statusStyles.paymentSchedule).length).toBe(5);
    expect(Object.keys(statusStyles.siteVisit).length).toBe(4);
    expect(Object.keys(statusStyles.taskPriority).length).toBe(3);
    const total = Object.values(statusStyles).reduce(
      (n, group) => n + Object.keys(group).length,
      0
    );
    expect(total).toBe(31);
  });

  it("keeps every background/text/border hex inside the sanctioned 15-value family set", () => {
    expect(FAMILY_HEXES.size).toBe(15);
    const seen = new Set<string>();
    for (const group of Object.values(statusStyles)) {
      for (const entry of Object.values(group)) {
        expect(FAMILY_HEXES.has(entry.background)).toBe(true);
        expect(FAMILY_HEXES.has(entry.text)).toBe(true);
        expect(FAMILY_HEXES.has(entry.border)).toBe(true);
        seen.add(entry.background);
        seen.add(entry.text);
        seen.add(entry.border);
      }
    }
    expect(seen.size).toBe(15);
  });

  it("emits only the muted|info|warning|success|danger tones", () => {
    const tones = new Set(
      Object.values(statusStyles).flatMap((group) =>
        Object.values(group).map((entry) => entry.tone)
      )
    );
    expect([...tones].sort()).toEqual([
      "danger",
      "info",
      "muted",
      "success",
      "warning",
    ]);
  });

  it(
    "BRND-01/BRND-03: whole-src scan for bracket-hex class strings finds 0 " +
      "(scan covers all of src/ as the robust stand-in for the src/**/*.tsx class-attribute scope)",
    () => {
      const pattern = /\[#[0-9A-Fa-f]{3,8}\]/;
      const violations: string[] = [];
      for (const file of collectSourceFiles(srcDir)) {
        const source = readFileSync(file, "utf8");
        if (pattern.test(normalize(source))) {
          violations.push(file);
        }
      }
      expect(violations).toEqual([]);
    }
  );
});
