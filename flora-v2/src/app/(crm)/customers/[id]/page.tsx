// src/app/(crm)/customers/[id]/page.tsx

import { notFound } from "next/navigation";
import Link from "next/link";
import { getCustomerFinancialSummary } from "@/lib/customer-financial";
import { CustomerFinancialDashboard } from "@/components/crm/CustomerFinancialDashboard";

export default async function CustomerFinancialPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
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