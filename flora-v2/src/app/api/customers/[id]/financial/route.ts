import { NextRequest, NextResponse } from "next/server";
import { requireRole } from "@/lib/api";
import { getCustomerFinancialSummary } from "@/lib/customer-financial";

// Full customer financial history (all quotes, projects, payments, running
// ledger) is sensitive. Previously any authenticated staff account could pull
// any customer's complete financial record. Restricted to ADMIN, matching the
// Phase 7 requirement that financial info be gated by server-side role.
export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");

  const { id } = await params;

  try {
    const summary = await getCustomerFinancialSummary(id);
    return NextResponse.json(summary);
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "";
    if (message.includes("not found")) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    console.error("Financial summary error:", error);
    return NextResponse.json(
      { error: "Failed to load financial data" },
      { status: 500 }
    );
  }
}