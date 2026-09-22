import { NextRequest, NextResponse } from "next/server";
import { requireAuth, withErrorHandling, notFound } from "@/lib/api";
import { getCustomerFinancialSummary } from "@/lib/customer-financial";

type Ctx = { params: Promise<{ id: string }> };

export const GET = withErrorHandling(async (_: NextRequest, { params }: Ctx) => {
  await requireAuth();
  const { id } = await params;
  if (!id || typeof id !== "string") {
    throw notFound("Customer not found");
  }

  try {
    const summary = await getCustomerFinancialSummary(id);
    return NextResponse.json(summary);
  } catch (error: unknown) {
    if (error instanceof Error && error.message.toLowerCase().includes("not found")) {
      throw notFound("Customer not found");
    }
    throw error;
  }
});
