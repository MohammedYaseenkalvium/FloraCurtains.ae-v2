import type { Prisma, PrismaClient } from "@prisma/client";
import type { QuotationLineItem } from "@/types";

export const QUOTE_NUMBER_START = 1000;

/** Computes subtotal, VAT and total for a set of quotation line items. */
export function calcTotals(items: QuotationLineItem[], vatRate: number) {
  const subtotal = items.reduce(
    (sum, it) => sum + it.qty * it.unitPrice * (1 - it.discount / 100),
    0
  );
  const round = (n: number) => Math.round(n * 100) / 100;
  const vatAmount = round(subtotal * (vatRate / 100));
  const roundedSubtotal = round(subtotal);
  return {
    subtotal: roundedSubtotal,
    vatAmount,
    totalAmount: round(roundedSubtotal + vatAmount),
  };
}

/** Builds the quote-number prefix for a given year. */
export function quoteNumberPrefix(year: number): string {
  return `FLR-${year}-`;
}

/**
 * Pure computation of the next quote number given the latest existing one.
 * Kept separate from the DB read so it can be unit-tested.
 */
export function nextQuoteNumber(year: number, latest: string | null): string {
  const prefix = quoteNumberPrefix(year);
  let counter = QUOTE_NUMBER_START;
  if (latest) {
    const match = latest.match(/-(\d{4})$/);
    if (match) counter = Math.max(counter, parseInt(match[1], 10));
  }
  counter += 1;
  return `${prefix}${String(counter).padStart(4, "0")}`;
}

type QuoteClient = Pick<PrismaClient, "quotation"> | Prisma.TransactionClient;

/**
 * Generates the next unique quote number. Must be called inside a transaction
 * (with a unique constraint on quoteNumber) to be safe against races.
 */
export async function generateQuoteNumber(client: QuoteClient): Promise<string> {
  const year = new Date().getFullYear();
  const prefix = quoteNumberPrefix(year);

  const latest = await client.quotation.findFirst({
    where: { quoteNumber: { startsWith: prefix } },
    orderBy: { quoteNumber: "desc" },
  });

  return nextQuoteNumber(year, latest?.quoteNumber ?? null);
}
