import { NextRequest,NextResponse } from "next/server";
import {auth} from "@/lib/auth";
import { getCustomerFinancialSummary } from "@/lib/customer-financial";

export async function GET(
  _: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const summary = await getCustomerFinancialSummary(id);
    return NextResponse.json(summary);
  } catch (error: any) {
    if (error.message?.includes("not found")) {
      return NextResponse.json({ error: "Customer not found" }, { status: 404 });
    }
    console.error("Financial summary error:", error);
    return NextResponse.json(
      { error: "Failed to load financial data" }, 
      { status: 500 }
    );
  }
}