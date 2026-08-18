import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getCustomerFinancialSummary } from "@/lib/customer-financial";
import { CustomerFinancialDashboard } from "@/components/crm/CustomerFinancialDashboard";

export default async function CustomerFinancialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  // Full financial detail (payments, ledger, contract values) is ADMIN-only —
  // mirrors the role check on /api/customers/[id]/financial.
  if (session.user.role !== "ADMIN") redirect("/customers");

  const { id } = await params;

  const summary = await getCustomerFinancialSummary(id).catch(() => notFound());

  return (
    <div className="max-w-6xl">
      <div className="text-sm text-[#6B625A] mb-5">
        <Link href="/enquiries" className="hover:underline">Enquiries</Link>
        <span className="mx-2">›</span>
        <Link href="/customers" className="hover:underline">Customers</Link>
        <span className="mx-2">›</span>
        <span className="font-medium">{summary.customerName}</span>
      </div>

      <CustomerFinancialDashboard summary={summary} />
    </div>
  );
}